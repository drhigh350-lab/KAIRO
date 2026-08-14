# Distractor tags — content guide

P0-7 fixed the engine wiring for three error-taxonomy tags that were
permanently unreachable — `misread_question`, `misapplied_rule`,
`partial_understanding` — by adding `distractors[].tags` (per-option
metadata, same shape as `distractors[].misconceptionId`) and fixing
`ErrorPatternClassifier` to actually read it. See
`src/qim/Question.js`'s `getDistractorTags()` and
`src/engine/ErrorPatternClassifier.js`.

**What wasn't done, and why:** actually tagging real production questions.
That's subject-matter judgment — deciding whether a specific wrong option
in a real Biology/Chemistry/Physics question genuinely represents a
misread trap, an adjacent-rule mix-up, or a final-step slip requires
reading the question the way a real teacher would. Guessing at that from
outside the content team would risk writing wrong diagnostic signal into
real questions in front of real students — worse than leaving the gap
open. This doc is the handoff: what the tags mean, and three real
questions as worked examples.

**Update:** the three worked examples below were reviewed and applied
live (2026-08-14) — each was grounded in evidence already on the record
(the question's own existing `explanation` field, or a stem structure
readable without subject expertise), not a guess. `biology_0198`,
`biology_0142`, and `biology_0107` now carry real `tags` in production.
Everything past this point in this doc is the pattern and rollout
guidance for the rest of the bank, which still needs a content reviewer's
pass — these three are a start, not the finish.

## The three tags

Set on a specific wrong option — `kairo.questions.distractors` is jsonb,
so no schema migration is needed, just adding a `tags: [...]` key to the
relevant distractor object(s) on a question already in the table (same
place `misconceptionId` and `explanation` already live per-distractor).

| Tag | Means | Fires when |
|---|---|---|
| `misread_trap` | This option is what a student picks if they misread the question, not if they don't understand the subject. | Student selects it → `misread_question` |
| `adjacent_rule` | This option is the *correct* answer to a real, different, neighboring question — a genuine rule applied where it doesn't belong. | Student selects it → `misapplied_rule` |
| `final_step` | Reachable only by getting every step right except the last one, on a calculation-heavy question. | Student selects it, and `calculation_load !== 'none'` → `partial_understanding` |

A question can have zero, one, or (rarely) more than one distractor
carrying one of these — most questions won't have any, and that's fine;
this taxonomy is for the subset where the wrong-option pattern is
genuinely diagnostic, not for every question.

## Worked examples (applied live)

**`biology_0198`** — *"Which of the following is NOT a mechanism of
evolution?"* (A. Natural selection, B. Genetic drift, C. Mitosis
[correct], D. Mutation)

A, B, and D are each **real** mechanisms of evolution. A student who
reads past the "NOT" answers as if the question asked which one *is* a
mechanism — that's a reading error, not a biology gap. Applied:
`tags: ['misread_trap']` on options A, B, and D. This pattern (a stem
containing "NOT", "EXCEPT", or "LEAST") is close to mechanically
detectable and is probably the highest-leverage, lowest-risk starting
point for a first tagging pass.

**`biology_0142`** — *"In a cross between two heterozygous tall plants
(Tt x Tt), what is the expected phenotypic ratio?"* (A. 1:1
[incorrect], B. 3:1 [correct], ...)

Option A's own existing `explanation` already says it outright: *"1:1
ratio results from a testcross (Tt x tt)."* That's not a random wrong
answer — it's the *correct* answer to a different, adjacent cross
scenario. Applied: `tags: ['adjacent_rule']` on option A.

**`biology_0107`** — *"The nitrogen cycle in nature involves which of
the following processes?"* (A. Photosynthesis and respiration
[incorrect — carbon cycle], correct: B, C. Combustion and precipitation
[incorrect — carbon/water cycle], D. Transpiration and evaporation
[incorrect — water cycle])

Same shape as above, at the question level rather than one distractor:
each wrong option is a real process from a *different* cycle, not a
fabricated one. Applied: `tags: ['adjacent_rule']` on A, C, and D.

No confident `final_step` example is included here — every Biology
question sampled had `calculation_load: 'none'`. That tag's natural home
is Chemistry/Physics stoichiometry and mechanics questions with a real
multi-step arithmetic chain; a content reviewer with the actual worked
solutions in front of them should pick the candidates there.

## Applying a tag

Once confirmed, a direct update against the live row (jsonb merge, one
distractor at a time):

```sql
update kairo.questions
set distractors = (
  select jsonb_agg(
    case when d->>'option' = 'A'
      then d || jsonb_build_object('tags', jsonb_build_array('misread_trap'))
      else d
    end
  )
  from jsonb_array_elements(distractors) d
)
where id = 'biology_0198';
```

## Rollout suggestion

Start with the "NOT / EXCEPT / LEAST" stem pattern across one subject —
it's close to mechanically identifiable and directly unlocks
`misread_question`, the tag with the clearest, lowest-ambiguity signal.
`adjacent_rule` needs an actual read of each question; `final_step` needs
Chemistry/Physics content with real calculation chains. A regression test
already proves the mechanism works correctly once tags exist
(`tests/engine.test.js`, "ERROR TAXONOMY WIRING TESTS" section) — this is
purely a content-authoring task from here, not an engineering one.
