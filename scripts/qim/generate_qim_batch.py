#!/usr/bin/env python3
"""
Kairo -- JAMB/UTME Raw Question Batch Processor (QIM)

Turns raw JAMB/UTME past-question JSON (the flat {year, subject, question,
option_a-d, ...} shape) into QIM-shaped Question JSON (src/qim/Question.js)
at lifecycleState 'imported' -- the same output shape scripts/import-question-bank.js
produces from CSV, so scripts/seed-content-catalog.js can consume it unchanged.

Why this exists instead of doing it in a chat session: a chat conversation
re-sends its entire growing history as input tokens on every turn, so cost
balloons the longer the session runs. This script calls the Claude Batches
API directly instead:

  - every chunk is a fresh, stateless request -- no accumulating history
  - the Batches API itself is ~50% cheaper than synchronous calls, and is
    built for exactly this: many independent, non-interactive requests
  - the system prompt (tutor voice + misconception list, the one thing that
    repeats on every request) is cache_control'd, so it's billed once per
    cache window instead of in full on every chunk
  - each request forces structured output via tool_choice, so there is no
    free-text JSON to parse or retry on malformed output
  - id / learningObjective / source / lifecycleState are computed here in
    Python, not asked of the model -- every output token the model spends
    should be pedagogical content, not boilerplate keys

Usage:
  pip install -r scripts/qim/requirements.txt
  export ANTHROPIC_API_KEY=...

  python scripts/qim/generate_qim_batch.py \\
    content/question-banks/_raw/chemistry_2004.json \\
    --out content/question-banks/_jamb-archive \\
    --chunk-size 10

  # then, unchanged, the existing loader (dry-run by default -- add --apply
  # once you've spot-checked the output):
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \\
    node scripts/seed-content-catalog.js \\
    content/question-banks/_jamb-archive/chemistry/jamb_2004.json \\
    --apply --promote-live

Raw input shape (one file per year/subject, a JSON list of objects) -- the
same shape already used for the 2004/2007 JAMB Chemistry batches:
  [{"year": 2004, "exam_type": "JAMB", "subject": "Chemistry",
    "question_number": 31, "question": "...", "option_a": "...",
    "option_b": "...", "option_c": "...", "option_d": "...", ...}, ...]

Output: one QIM JSON file per (subject, year) pair found in the input,
written to <out>/<subject_slug>/jamb_<year>.json. Items the model flags as
unprocessable (e.g. answer options that only make sense with a diagram that
wasn't included in the source data) are written to
<out>/<subject_slug>/jamb_<year>.skipped.json instead of being guessed at --
review these by hand and re-run with the missing content filled in.
"""
import argparse
import json
import re
import sys
import time
from collections import defaultdict
from pathlib import Path

import anthropic

DEFAULT_MODEL = "claude-sonnet-5"
MAX_TOKENS_PER_CHUNK = 8192

MISCONCEPTION_IDS = [
    "memorized_not_understood", "rushed_under_pressure", "guessed_no_reasoning",
    "confused_similar_concepts", "missing_prerequisite", "misunderstood_terminology",
    "sign_error", "unit_conversion_error", "formula_recall_error", "arithmetic_slip",
    "misread_graph", "overgeneralized_rule",
]

# `topic` must be one of a subject's syllabus major topics -- everything
# more specific (e.g. "Nitrogen and its compounds" under "Non-metals and
# their compounds") goes in `subtopic`, never `topic`. Enforced two ways:
# the tool schema below makes `topic` an enum of exactly this list when the
# chunk's subject has an entry here, and kairo.questions itself carries a
# matching CHECK constraint (questions_chemistry_topic_syllabus_check) --
# so even a request that bypasses this script entirely can't write a
# non-syllabus topic for a subject listed here. Add a subject's official
# syllabus topic list here before generating content for it; an unlisted
# subject falls back to a free-text topic (not yet locked down).
SYLLABUS_TOPICS = {
    "chemistry": [
        "Separation of mixtures and purification of chemical substances",
        "Chemical combination",
        "Kinetic theory of matter and Gas Laws",
        "Atomic structure and bonding",
        "Air",
        "Water",
        "Solubility",
        "Environmental Pollution",
        "Acids, bases and salts",
        "Oxidation and reduction",
        "Electrolysis",
        "Energy changes",
        "Rates of Chemical Reaction",
        "Chemical equilibria",
        "Non-metals and their compounds",
        "Metals and their compounds",
        "Organic Compounds",
        "Chemistry and Industry",
    ],
}

SYSTEM_PROMPT = """You are a sharp, experienced TECHMED tutor processing raw JAMB/UTME \
past-question data into Kairo's Question Intelligence Model (QIM) schema.

Voice and Tone
1. Central philosophy: don't just state why an answer is correct -- expose what the \
question is testing, make the reasoning understandable, and give the student a \
transferable strategy.
2. Tone: conversational, confident, warm, intelligent, practical. Never childish or \
patronizing.
3. Context: you're tutoring a Nigerian UTME aspirant. Use natural, comforting phrases \
like "Don't rush," "The trick here is," or "This is where students usually get \
caught." No forced slang.
4. Explanations: start with meaning before mechanics. For a calculation, explain why \
you're calculating before doing the math.
5. Address why a student might pick a wrong answer. Never shame a student.
6. Length: concise (2 sentences) for simple recall; walk through the logical steps \
for a complex calculation.

Structural Rules
1. Classify subject, topic, and a SPECIFIC subtopic. `topic` must be exactly one of \
the subject's official syllabus major topics -- if the tool schema constrains `topic` \
to an enum, treat that enum as the complete and only valid list, no exceptions. \
Anything more specific than a major topic (e.g. "Nitrogen and its compounds" under \
the major topic "Non-metals and their compounds") is a `subtopic`, never a `topic` -- \
subtopics can be as broad or as narrow as the content genuinely calls for, as long as \
`topic` itself stays a syllabus major topic.
2. Determine the correct answer from first principles. Do not guess.
3. Assign difficultyRating (1-3) and cognitiveLevel (exactly one of: "recall", \
"comprehension", "application").
4. Write one distractor entry per WRONG option, naming the specific reasoning error, \
tagged with exactly one misconceptionId from this fixed list: {misconceptions}.
5. Silently fix obvious OCR typos in the question text or options.
6. If a question's options only make sense with a diagram/structure/image that was \
NOT included in the source data (bare fragments, "see diagram above" with no \
textual content left to reason from), do NOT guess an answer. Put its sourceIndex \
in `unprocessable` with a one-sentence reason instead of fabricating a correct \
option.

You will be given a numbered batch of raw questions in one user message, each \
carrying a `sourceIndex`. Call emit_qim_batch exactly once, and account for every \
single question in the batch -- each one goes into either `questions` or \
`unprocessable`, never omitted.""".format(misconceptions=", ".join(MISCONCEPTION_IDS))

def build_tool(topics=None):
    """Build the emit_qim_batch tool schema. When `topics` is given (the
    subject's syllabus major-topic list), `topic` becomes a hard enum --
    the model literally cannot return a non-syllabus value, rather than
    just being told not to."""
    topic_schema = {"type": "string"}
    if topics:
        topic_schema["enum"] = topics
    return {
    "name": "emit_qim_batch",
    "description": (
        "Emit the processed QIM question objects for this batch, plus any source "
        "items that could not be responsibly processed (e.g. diagram-dependent "
        "with no textual content left to reason from)."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "sourceIndex": {
                            "type": "integer",
                            "description": "Index of the raw question this came from, matching the input batch.",
                        },
                        "subject": {"type": "string"},
                        "topic": topic_schema,
                        "subtopic": {"type": "string"},
                        "difficultyRating": {"type": "integer", "minimum": 1, "maximum": 3},
                        "cognitiveLevel": {
                            "type": "string",
                            "enum": ["recall", "comprehension", "application"],
                        },
                        "stem": {"type": "string"},
                        "options": {
                            "type": "array",
                            "minItems": 2,
                            "items": {
                                "type": "object",
                                "properties": {
                                    "label": {"type": "string"},
                                    "text": {"type": "string"},
                                    "isCorrect": {"type": "boolean"},
                                },
                                "required": ["label", "text", "isCorrect"],
                            },
                        },
                        "correctOption": {"type": "string"},
                        "explanation": {"type": "string"},
                        "distractors": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "option": {"type": "string"},
                                    "explanation": {"type": "string"},
                                    "misconceptionId": {
                                        "type": "string",
                                        "enum": MISCONCEPTION_IDS,
                                    },
                                },
                                "required": ["option", "explanation", "misconceptionId"],
                            },
                        },
                    },
                    "required": [
                        "sourceIndex", "subject", "topic", "subtopic", "difficultyRating",
                        "cognitiveLevel", "stem", "options", "correctOption", "explanation",
                        "distractors",
                    ],
                },
            },
            "unprocessable": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "sourceIndex": {"type": "integer"},
                        "reason": {"type": "string"},
                    },
                    "required": ["sourceIndex", "reason"],
                },
            },
        },
        "required": ["questions", "unprocessable"],
    },
}


def slugify(s):
    return re.sub(r"^_+|_+$", "", re.sub(r"[^a-z0-9]+", "_", s.lower()))


def chunk_list(items, size):
    return [items[i:i + size] for i in range(0, len(items), size)]


def raw_to_prompt(batch):
    return (
        f"Process this batch of {len(batch)} raw questions. Use the `sourceIndex` "
        f"given for each.\n\n{json.dumps(batch, indent=2, ensure_ascii=False)}"
    )


def learning_objective(topic):
    return f"Understand {topic} well enough to apply it, not just recall it."


def build_question_id(subject, exam_body, year, seq):
    return f"{slugify(subject)}_{exam_body.lower()}{year}_{seq:03d}"


def to_qim_question(item, raw_item, exam_body, year):
    seq = raw_item.get("question_number") or (raw_item["_position"] + 1)
    subject = item["subject"]
    return {
        "id": build_question_id(subject, exam_body, year, seq),
        "subject": subject,
        "topic": item["topic"],
        "subtopic": item["subtopic"],
        "learningObjective": learning_objective(item["topic"]),
        "conceptsTested": [],
        "prerequisiteConcepts": [],
        "difficultyRating": item["difficultyRating"],
        "cognitiveLevel": item["cognitiveLevel"],
        "estimatedSolvingTimeSec": 60,
        "readingLoad": "low",
        "calculationLoad": "none",
        "distractors": item["distractors"],
        "skillsAssessed": [],
        "source": "jamb_past_question",
        "year": year,
        "examBody": exam_body,
        "relatedQuestionIds": [],
        "stem": item["stem"],
        "options": item["options"],
        "correctOption": item["correctOption"],
        "explanation": item["explanation"],
        "distractorRationale": None,
        "lifecycleState": "imported",
        "empiricalStats": {
            "totalAttempts": 0,
            "correctCount": 0,
            "avgResponseTimeMs": 0,
            "distractorSelectionCounts": {},
        },
    }


def topics_for_chunk(chunk_items):
    """Look up the syllabus topic list for a chunk's subject(s). A chunk is
    expected to be single-subject in practice; if it somehow isn't, no
    enum is applied rather than guessing which subject's list to use."""
    subjects = {str(r.get("subject", "")).strip().lower() for r in chunk_items}
    if len(subjects) == 1:
        return SYLLABUS_TOPICS.get(next(iter(subjects)))
    return None


def build_requests(chunks, model):
    requests = []
    for ci, c in enumerate(chunks):
        requests.append({
            "custom_id": f"chunk-{ci:04d}",
            "params": {
                "model": model,
                "max_tokens": MAX_TOKENS_PER_CHUNK,
                "system": [{
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }],
                "messages": [{"role": "user", "content": raw_to_prompt(c)}],
                "tools": [build_tool(topics_for_chunk(c))],
                "tool_choice": {"type": "tool", "name": "emit_qim_batch"},
            },
        })
    return requests


def run_batch(client, requests, poll_interval):
    batch = client.messages.batches.create(requests=requests)
    print(f"Submitted batch {batch.id}, status={batch.processing_status}")

    while True:
        batch = client.messages.batches.retrieve(batch.id)
        c = batch.request_counts
        print(
            f"  {batch.processing_status}: succeeded={c.succeeded} errored={c.errored} "
            f"processing={c.processing} canceled={c.canceled} expired={c.expired}"
        )
        if batch.processing_status == "ended":
            return batch
        time.sleep(poll_interval)


def process_results(client, batch_id, chunks):
    """Pure-ish core: given the batch's raw results, return
    (out_questions, out_skipped, errors) keyed the same way main() expects.
    Split out from main() so it's testable with a fake `client`."""
    by_custom_id = {f"chunk-{ci:04d}": c for ci, c in enumerate(chunks)}

    out_questions = defaultdict(list)  # (subject, year) -> [Question dict]
    out_skipped = defaultdict(list)    # (subject, year) -> [{sourceIndex, reason, question}]
    errors = []

    for result in client.messages.batches.results(batch_id):
        c = by_custom_id.get(result.custom_id)
        if c is None:
            errors.append({"custom_id": result.custom_id, "type": "unknown_custom_id"})
            continue

        if result.result.type != "succeeded":
            errors.append({
                "custom_id": result.custom_id,
                "type": result.result.type,
                "detail": str(getattr(result.result, "error", result.result)),
            })
            continue

        message = result.result.message
        tool_use = next((b for b in message.content if b.type == "tool_use"), None)
        if tool_use is None:
            errors.append({"custom_id": result.custom_id, "type": "no_tool_use"})
            continue

        payload = tool_use.input
        raw_by_index = {r["sourceIndex"]: r for r in c}

        for item in payload.get("questions", []):
            raw_item = raw_by_index.get(item["sourceIndex"])
            if raw_item is None:
                errors.append({
                    "custom_id": result.custom_id,
                    "type": "unknown_sourceIndex",
                    "detail": item["sourceIndex"],
                })
                continue
            exam_body = raw_item.get("exam_type") or raw_item.get("examBody") or "JAMB"
            year = raw_item.get("year")
            q = to_qim_question(item, raw_item, exam_body, year)
            out_questions[(q["subject"], year)].append(q)

        for skip in payload.get("unprocessable", []):
            raw_item = raw_by_index.get(skip["sourceIndex"])
            subject = (raw_item or {}).get("subject", "unknown")
            year = (raw_item or {}).get("year")
            out_skipped[(subject, year)].append({
                "sourceIndex": skip["sourceIndex"],
                "reason": skip["reason"],
                "question": (raw_item or {}).get("question"),
            })

    return out_questions, out_skipped, errors


def write_outputs(out_dir, out_questions, out_skipped, errors):
    out_dir = Path(out_dir)

    for (subject, year), qs in out_questions.items():
        qs.sort(key=lambda q: q["id"])
        path = out_dir / slugify(subject) / f"jamb_{year}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(qs, indent=2, ensure_ascii=False))
        print(f"Wrote {len(qs)} question(s) -> {path}")

    for (subject, year), skips in out_skipped.items():
        path = out_dir / slugify(subject) / f"jamb_{year}.skipped.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(skips, indent=2, ensure_ascii=False))
        print(f"Flagged {len(skips)} unprocessable -> {path}")

    if errors:
        err_path = out_dir / "errors.json"
        err_path.write_text(json.dumps(errors, indent=2, ensure_ascii=False))
        print(f"{len(errors)} chunk error(s) -> {err_path}", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("input", help="Raw JAMB question JSON file (a JSON list of objects)")
    ap.add_argument("--out", required=True, help="Output root directory for QIM JSON files")
    ap.add_argument("--chunk-size", type=int, default=10, help="Raw questions per API request")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--poll-interval", type=int, default=20, help="Seconds between batch status polls")
    args = ap.parse_args()

    raw = json.loads(Path(args.input).read_text())
    for i, r in enumerate(raw):
        r["_position"] = i
        r.setdefault("sourceIndex", i)

    chunks = chunk_list(raw, args.chunk_size)
    print(f"{len(raw)} raw questions -> {len(chunks)} chunk(s) of up to {args.chunk_size}")

    client = anthropic.Anthropic()
    requests = build_requests(chunks, args.model)
    batch = run_batch(client, requests, args.poll_interval)

    out_questions, out_skipped, errors = process_results(client, batch.id, chunks)
    write_outputs(args.out, out_questions, out_skipped, errors)

    total = sum(len(v) for v in out_questions.values())
    total_skip = sum(len(v) for v in out_skipped.values())
    print(f"\nDone: {total} question(s) written, {total_skip} flagged unprocessable, "
          f"{len(errors)} chunk error(s).")
    if total:
        print("Next (dry run first, then --apply once you've spot-checked the output):")
        print(f"  node scripts/seed-content-catalog.js {args.out}/**/*.json")
        print(f"  node scripts/seed-content-catalog.js {args.out}/**/*.json --apply --promote-live")


if __name__ == "__main__":
    main()
