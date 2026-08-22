# Kairo Taxonomy & Seeding Reference

Durable reference for classifying and seeding JAMB questions into the
`kairo` schema (Supabase project `unbgborbhxzsotaieiun`, "TechMed-Daily").
Written so a fresh session can pick up conversion/seeding work with no
prior chat history — everything it needs is either below or queryable
live from the database.

## How to use this doc

- Classifying a question? Use the canonical topic list for its subject
  below. Never invent a topic string outside that list — a CHECK
  constraint (`questions_<subject>_topic_syllabus_check` /
  `concepts_<subject>_topic_syllabus_check`) rejects anything else.
- Seeding new questions? Follow the **Batch self-containment protocol**
  at the end — it tells you what to query instead of what to remember.

## Schema

### `kairo.questions`

| column | type | notes |
|---|---|---|
| `id` | text PK | `<subject_slug>_NNNN`, zero-padded 4 digits, e.g. `mathematics_0031`, `use_of_english_0201`. Subject slug is the lowercased, underscored subject name (`mathematics`, `use_of_english`, `chemistry`, `biology`, `physics`). |
| `subject` | text | Exact values in use: `Mathematics`, `Use of English`, `Chemistry`, `Biology`, `Physics`. |
| `topic` | text | Must be one of the canonical topics below for that subject. |
| `subtopic` | text (nullable) | Fine-grained skill label. Fill this in — do not leave null. |
| `learning_objective` | text (nullable) | Optional. |
| `concepts_tested` | jsonb, default `[]` | Array of `{"weight": 1, "conceptId": "<concept id>"}`. Usually one element. |
| `prerequisite_concepts` | text[] | Usually empty; prerequisite-chain population is a separate deferred task — leave `{}` unless told otherwise. |
| `difficulty_rating` | int, default 1 | Observed range 1–3 in practice. |
| `cognitive_level` | text, default `'recall'` | Observed values: `recall`, `application`, others as appropriate. |
| `estimated_solving_time_sec` | int, default 30 | |
| `reading_load` | text, default `'low'` | |
| `calculation_load` | text, default `'none'` | |
| `distractors` | jsonb, default `[]` | Array of `{"option": "<A-D>", "explanation": "...", "misconceptionId": "<see catalog>"}` — one entry per wrong option. |
| `skills_assessed` | text[] | Optional. |
| `source` | text, default `'techmed_authored'` | Use `'jamb_past_question'` (or similar consistent value) for real past-question imports, not the default. |
| `year` | int (nullable) | The JAMB exam year the question is from. |
| `exam_body` | text, default `'JAMB'` | Leave as `'JAMB'`. |
| `related_question_ids` | text[] | Optional. |
| `stem` | text | The question text. |
| `options` | jsonb | Array of `{"label": "A", "text": "...", "isCorrect": true/false}` — exactly one `isCorrect: true`. |
| `correct_option` | text | The label (`A`/`B`/`C`/`D`) matching the correct option. |
| `explanation` | text (nullable) | Explains the correct answer. |
| `lifecycle_state` | text, default `'imported'` | **Must be explicitly set to `'live'`** on insert. The default `'imported'` is invisible to students — `SupabaseSyncAdapter.fetchQuestions()` hard-filters `.eq('lifecycle_state', 'live')`. This exact bug caused ~1,000 Biology questions to silently not appear for students; do not repeat it. |
| `empirical_stats` | jsonb | Leave at default. |

### `kairo.concepts`

| column | type | notes |
|---|---|---|
| `id` | text PK | Short random id, subject-prefixed by convention (e.g. `math`+5 chars, `phy`+5-7 chars, `bio`+5 chars). Not enforced by a constraint — just keep it collision-free and grep-able. |
| `name` | text | Human-readable concept name, e.g. `"Laws of Indices"`. |
| `subject` | text | Same values as `questions.subject`. |
| `topic` | text | Must match the canonical list; must equal the `topic` of every question referencing this concept via `concepts_tested`. |
| `subtopic` | text (nullable) | Convention so far: same value as `name`. |
| `difficulty_weight` | numeric, default 1.0 | |
| `dependency_ids` | text[] | Prerequisite concept ids — deferred task, leave `{}`. |
| `question_pool_ids` | text[] | Not actively maintained by these migrations — leave `{}`. |

### Distractor `misconceptionId` catalog (fixed 12 values)

```
memorized_not_understood, rushed_under_pressure, guessed_no_reasoning,
confused_similar_concepts, missing_prerequisite, misunderstood_terminology,
sign_error, unit_conversion_error, formula_recall_error, arithmetic_slip,
misread_graph, overgeneralized_rule
```

### Full example row (Mathematics)

```json
{
  "id": "mathematics_0001",
  "subject": "Mathematics",
  "topic": "Number bases",
  "subtopic": "Base Conversion",
  "concepts_tested": [{"weight": 1, "conceptId": "be64x9"}],
  "difficulty_rating": 2,
  "cognitive_level": "application",
  "stem": "Convert 110101₂ to base 10.",
  "options": [
    {"label": "A", "text": "43", "isCorrect": false},
    {"label": "B", "text": "53", "isCorrect": true},
    {"label": "C", "text": "54", "isCorrect": false},
    {"label": "D", "text": "37", "isCorrect": false}
  ],
  "correct_option": "B",
  "explanation": "Each digit's place value doubles moving left: 110101₂ = (1×32)+(1×16)+(0×8)+(1×4)+(0×2)+(1×1) = 32+16+0+4+0+1 = 53.",
  "distractors": [
    {"option": "A", "explanation": "This results from assigning place values in reverse order (treating the leftmost digit as 2⁰ instead of the rightmost).", "misconceptionId": "formula_recall_error"},
    {"option": "C", "explanation": "An arithmetic slip while adding the place values (32+16+4+1) gives 53, not 54.", "misconceptionId": "arithmetic_slip"},
    {"option": "D", "explanation": "This omits the 2⁴ (16) place value from the sum.", "misconceptionId": "formula_recall_error"}
  ],
  "source": "techmed_authored",
  "year": null,
  "exam_body": "JAMB",
  "lifecycle_state": "live"
}
```

For a real past-question import, set `"source"` to something like
`"jamb_past_question"` and `"year"` to the actual exam year instead of
`null`.

## Canonical topic lists

Every `topic` value must come from the list for that subject. These are
enforced by DB CHECK constraints, so a mismatched string will fail the
migration loudly rather than silently miscategorizing a question.

### Mathematics (41 topics)

```
Number bases, Fractions decimals and approximations, Percentages, Indices,
Logarithms, Surds, Sets, Arithmetic progression, Geometric progression,
Binary operations, Modular arithmetic,
Algebraic expressions, Factorization, Change of subject of formula,
Linear equations, Simultaneous equations, Quadratic equations,
Inequalities, Variation, Polynomials, Matrices and determinants,
Angles, Triangles, Polygons, Circles, Mensuration, Loci,
Coordinate geometry, Trigonometric ratios, Trigonometric functions,
Heights and distances,
Differentiation, Applications of differentiation, Integration,
Applications of integration,
Data collection and presentation, Frequency distributions,
Measures of central tendency, Measures of dispersion, Probability,
Permutations and combinations
```

(Note: `Fractions, decimals and approximations` is stored with commas —
copy the exact string from
`supabase/migrations/20260821020000_mathematics_topic_and_concept_level_remap.sql`
if unsure of punctuation.)

### Use of English (27 topics, 3 sections)

Unlike the other subjects, `topic` is one of these 27 named topics, not a
subject-wide flat list — but it is still a single flat `topic` field in
the DB (the section grouping below is informational, not a stored
column).

**Section A — Comprehension/Summary:**
`Description, Narration, Exposition, Argumentation/Persuasion,
Comprehension, Vocabulary and expressions in context, Coherence and
logical reasoning, The Lekki Headmaster — Kabir Alabi Garba, Synthesis of
ideas from passages`

**Section B — Lexis and Structure:**
`Vocabulary, Word classes, Sentence structure, Grammatical usage,
Idiomatic expressions, Appropriate word choice, Synonyms/antonyms,
Register, Sentence completion, Error identification, Structural
relationships`

**Section C — Oral Forms:**
`Vowels, Consonants, Rhymes, Stress, Intonation, Homophones,
Pronunciation distinctions`

Note the em dash in `The Lekki Headmaster — Kabir Alabi Garba` — copy it
exactly (U+2014), not a hyphen.

### Chemistry (18 topics)

```
Separation of mixtures and purification of chemical substances,
Chemical combination, Kinetic theory of matter and Gas Laws,
Atomic structure and bonding, Air, Water, Solubility,
Environmental Pollution, Acids bases and salts, Oxidation and reduction,
Electrolysis, Energy changes, Rates of Chemical Reaction,
Chemical equilibria, Non-metals and their compounds,
Metals and their compounds, Organic Compounds, Chemistry and Industry
```

### Biology (23 topics, 5 sections: A. Variety of Organisms, B. Form and
Functions, C. Ecology, D. Heredity and Variations, E. Evolution)

```
Living organisms, Evolution among organisms,
Structural/functional and behavioural adaptations of organisms,
Internal structure of plants and animals, Nutrition, Transport,
Respiration, Excretion, Support and movement, Reproduction, Growth,
Co-ordination and control, Factors affecting the distribution of
organisms, Symbiotic interactions of plants and animals, Natural
habitats, Local (Nigerian) biomes, The ecology of populations, Soil,
Humans and environment, Variation in population, Heredity,
Theories of evolution, Evidence of evolution
```

### Physics (39 topics)

```
Measurements and Units, Scalars and Vectors, Motion, Gravitational Field,
Equilibrium of Forces, Work Energy and Power, Friction, Simple Machines,
Elasticity, Pressure, Liquids at Rest, Temperature and its Measurement,
Thermal Expansion, Gas Laws, Quantity of Heat, Change of State, Vapours,
Kinetic Theory of Matter, Heat Transfer, Waves, Propagation of Sound
Waves, Light Energy, Reflection of Light, Refraction of Light, Optical
Instruments, Dispersion of Light and Colours, Electrostatics, Capacitors,
Electric Cells, Current Electricity, Electrical Energy and Power,
Electrical Measuring Instruments, Magnetic Field, Electromagnetic
Induction, Alternating Current, Semiconductors, Elementary Modern
Physics, Nuclear Physics, Energy Quantization
```

(`Work Energy and Power` is stored as `Work, Energy and Power` — check
`supabase/migrations/20260819*physics*.sql` for exact punctuation before
trusting a hand-copied string.)

## Batch self-containment protocol

Each batch (one JSON file — e.g. one exam year) must be processable
**without reading any earlier batch's output**. The database is the
source of truth for what already exists, not the chat history. Before
converting a batch:

1. **Find the next id number.** Run:
   ```sql
   select max(id) from kairo.questions where subject = '<Subject>';
   ```
   Parse the trailing number and continue from there (e.g. max is
   `mathematics_0187` → this batch starts at `mathematics_0188`). Never
   assume the next number from a previous chat turn.

2. **Find existing concepts for this subject/topic** before creating new
   ones:
   ```sql
   select id, name, topic, subtopic from kairo.concepts
   where subject = '<Subject>' and topic = '<Topic>' order by name;
   ```
   Reuse a concept whose `subtopic` genuinely matches the new question's
   skill; only insert a new concept row for a skill not already covered.

3. **Convert + classify** the batch's raw questions into the QIM shape
   above, assigning `topic` only from the canonical list, filling
   `subtopic`, and setting `lifecycle_state = 'live'` explicitly.

4. **Write one migration file** per batch under
   `supabase/migrations/`, timestamped, named like
   `<timestamp>_seed_<subject>_<year-or-batch-label>.sql`. Apply it via
   `mcp__Supabase__apply_migration`, then copy the exact applied SQL into
   the repo file (don't regenerate it from memory afterward — copy what
   ran).

5. **Validate the batch** before moving on:
   ```sql
   select count(*) from kairo.questions where subject='<Subject>' and id >= '<first_new_id>';
   -- dangling concept refs:
   select count(*) from kairo.questions q
   cross join lateral jsonb_array_elements(q.concepts_tested) e
   where q.subject='<Subject>' and q.id >= '<first_new_id>'
   and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
   -- topic/concept mismatches:
   select count(*) from kairo.questions q
   cross join lateral jsonb_array_elements(q.concepts_tested) e
   join kairo.concepts c on c.id = e->>'conceptId'
   where q.subject='<Subject>' and q.id >= '<first_new_id>' and q.topic <> c.topic;
   ```

6. **Commit and push**, then report a short summary (question count,
   id range, topics touched, any new concepts created) — that summary
   line is all the next batch needs to see; it should not need to
   re-read this batch's generated SQL or raw JSON.

Because steps 1–2 pull current state from the database rather than
memory, each batch turn is self-contained even in a very long-running
chat, and the conversation can be safely compacted between batches
without losing anything the next batch depends on.
