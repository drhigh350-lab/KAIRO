-- Chemistry concept-level remap: link questions to the granular concepts
-- that already exist for their topic (isotopes, electron configuration,
-- molecular shape, etc.) instead of a broad topic-level placeholder
-- concept. Audit found 963 of 1268 Chemistry questions (76%) linked via
-- concepts_tested[].conceptId to one of several generic, no-subtopic
-- concept nodes per topic (frequently multiple near-duplicate spelling
-- variants of the topic name itself, e.g. 5 separate "Atomic Structure /
-- Atomic Structure & Bonding / Atomic Structure and Bonding" rows for one
-- topic) rather than the specific granular concept their own `subtopic`
-- text already names.
--
-- This migration, applied directly against the live TechMed-Daily
-- project in stages (hence the internal ordering below):
--   1. Adds 5 new granular concepts for real JAMB-syllabus content
--      clusters that had no existing concept (aldehydes/ketones under
--      Organic Compounds, chromatography + distillation under
--      Separation, air composition under Air, water deliquescence/
--      hygroscopy under Water).
--   2. Remaps every confidently-identifiable question (question.subtopic
--      matched by name/spelling-variant against an existing granular
--      concept's name/subtopic, within the question's own topic) from a
--      generic concept to that granular concept. Questions whose subtopic
--      text is too vague/generic to confidently place (e.g. literally
--      repeats the topic name) are left on the topic's canonical generic
--      concept rather than force-mapped -- 284 of 1268 remain this way,
--      down from 963 spread across many duplicate generic nodes.
--   3. Consolidates the duplicate generic (no-subtopic) concept nodes per
--      topic into one canonical id -- 59 concept rows removed. Every
--      table with a FK to kairo.concepts(id) is repointed first:
--      kairo.concept_states (with a dedup delete for the rare case a
--      student already has state on both the loser and canonical
--      concept -- (student_id, concept_id) is the PK there) and
--      kairo.attempts (its own `id` PK, no collision risk), plus any
--      concepts.dependency_ids array referencing a loser.
--   4. A safety check (do $$ ... raise exception ... end $$) verifying no
--      Chemistry question was left with a dangling conceptId -- this
--      migration only reaches its final commit if that check passes.
--
-- Net result verified against production: 984/1268 Chemistry questions
-- (77.6%) now on a granular concept (up from ~305, 24%); 176 total
-- Chemistry concepts (was 230, +5 new, -59 consolidated); zero dangling
-- references across questions.concepts_tested, concept_states.concept_id,
-- attempts.concept_id, or concepts.dependency_ids. The topic-level JAMB
-- syllabus CHECK constraint (questions_chemistry_topic_syllabus_check /
-- concepts_chemistry_topic_syllabus_check) is untouched and still holds.
--
-- Idempotent-safe: every UPDATE targets a specific current value (jsonb_set
-- of a matched conceptId, or a specific loser id) and every INSERT/DELETE
-- is conflict/existence-guarded, so replaying this against an environment
-- that already has it applied is a no-op.

begin;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('airconc1', 'Composition of Air', 'Chemistry', 'Air', 'Composition of Air', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('orgaldk1', 'Alkanals and Alkanones', 'Chemistry', 'Organic Compounds', 'Alkanals and Alkanones (Aldehydes and Ketones)', 1.2, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('sepchrm1', 'Chromatography', 'Chemistry', 'Separation of mixtures and purification of chemical substances', 'Chromatography', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('sepdist1', 'Distillation', 'Chemistry', 'Separation of mixtures and purification of chemical substances', 'Distillation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('wtrdelq1', 'Deliquescence, Efflorescence and Hygroscopy', 'Chemistry', 'Water', 'Deliquescence, Efflorescence and Hygroscopy', 1.0, '{}', '{}') on conflict (id) do nothing;update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('8ocrzy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'pH and pOH Calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('8ocrzy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'pH and pOH';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('zjw5u3'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Indicators and pH';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('zjw5u3'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Acid-base indicators';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vpzbrw'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Identification of Gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vpzbrw'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Test for Water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vpzbrw'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Collection of Gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('yzd6cv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Hydrolysis of Salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('yzd6cv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Hydrolysis of salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Flame Tests';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Identification of Anions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Test for Cations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Test for anions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Test for trioxocarbonate(IV) (carbonate) ions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Flame tests';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kv2dlm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Solubility Rules';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('liww8z'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Preparation of Salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e6pk77'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Acid-Base Titrations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e6pk77'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Volumetric Analysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('qe23qr'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Neutralization and Ionic Equations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cq46o7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Bronsted-Lowry Theory';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cq46o7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Nature of salts from acid-base combinations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('qs067o'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Reactions of trioxonitrate(V) acid with metals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('liww8z'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Types of Salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('liww8z'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Classification of Salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('liww8z'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.subtopic = 'Normal salts vs. acid salts';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('airconc1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.subtopic = 'Composition of Air';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('airconc1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.subtopic = 'Composition of air';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('airconc1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.subtopic = 'Air as a mixture';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('airconc1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.subtopic = 'Role of nitrogen in air';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('airconc1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.subtopic = 'Noble gases in air';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('airconc1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.subtopic = 'Elements, Compounds and Mixtures';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gqm7dj'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Soaps and Detergents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('x5x9l4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Industrial synthesis of styrene';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('x5x9l4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Plastics and Polymers';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('yklr2g'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Solvents and cleaning agents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('yklr2g'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Household Chemicals and Solvents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('yxuq7s'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Catalytic reforming of hydrocarbons';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.subtopic = 'Metals & Their Compounds';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2oceg6'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Periodic Trends';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2oceg6'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Periodic trends';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2oceg6'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Group Trends and Properties';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ot0voy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Radioactivity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ot0voy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Radioactivity and Half-Life';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ot0voy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Radioactivity and Isotopes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ot0voy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Nuclear fusion';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ot0voy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Half-life and Decay Constant';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronic Configuration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronic Configuration and Periodic Blocks';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronic Configuration and Periodic Table';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Noble Gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Blocks of the Periodic Table';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electron shells';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronic Configuration and Valency';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('7u41s5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electron configuration of halide ions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cl4iqu'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Molecular Shapes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cl4iqu'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Shapes of Molecules';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cl4iqu'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Molecular Shape (VSEPR Theory)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cl4iqu'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Molecular Shape';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Covalent Bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Ionic (Electrovalent) Bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Ionic Bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Giant Covalent Structures';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Properties of Ionic Compounds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Bonding in metal halides';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Octet rule';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('epcv95'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Ionic vs Covalent Character — Fajan''s Rules';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('zxcqb1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Intermolecular Forces';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('zxcqb1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Intermolecular Forces — Van der Waals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('lbnthq'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Hybridization';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('nucy3t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'History of Atomic Theory';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('nucy3t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Cathode rays';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('nucy3t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Bohr Model and Hydrogen Spectrum';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('nucy3t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Atomic Models and History';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gzi1bc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Isotopes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gzi1bc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Isotopes and Relative Atomic Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gzi1bc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Isotopes and mass number';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gzi1bc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Isotopes and relative abundance';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gzi1bc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Isotopes and Atomic Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gzi1bc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Isotopic Abundance Calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f4y1pg'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Atomic Particles';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f4y1pg'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Atomic Particles and Mass Number';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f4y1pg'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Atomic Particles and Ions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f4y1pg'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Subatomic Particles and Ion Charge';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f4y1pg'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Subatomic Particles';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f4y1pg'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'The Nucleus';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('aixz7h'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Transition Metals and d-Orbitals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f0dj68'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Structure of the Periodic Table';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f0dj68'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Periods and groups';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('f0dj68'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Metals vs Non-Metals — Periodic Position';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('25qyuy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Coordinate Bonding — Ligands';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('25qyuy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Coordinate (Dative) Bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('25qyuy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Coordinate Covalent Bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('25qyuy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Coordinate covalent bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('25qyuy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Complex compounds nomenclature';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('i5jfdn'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Shapes of atomic orbitals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('i5jfdn'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Quantum Numbers';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('i5jfdn'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Quantum numbers';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('i5jfdn'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Hund''s Rule and Electron Spin';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('3a2yze'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronegativity and bond polarity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('3a2yze'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronegativity and Bond Character';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('3a2yze'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Electronegativity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mzf4b6'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Atomic Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('z2f3rl'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Metallic Bonding';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('z2f3rl'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Metallic Bonding vs. Compound Formation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jis2pp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Hydrogen Bonding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jis2pp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.subtopic = 'Intermolecular Forces (Hydrogen Bonding)';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mu9d5t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Empirical and Molecular Formulae';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v4o1jb'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Gay-Lussac''s Law';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v4o1jb'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Gay-Lussac''s Law of Combining Volumes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v4o1jb'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Molar volume of gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v4o1jb'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Molar Volume of Gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jniec0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Moles and Molar Volume';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jniec0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Mole Concept';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jniec0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Moles and Molar Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jniec0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'The Mole Concept';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('naed66'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Percentage Composition';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('naed66'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Percentage Composition by Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e5q9c8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Mass-Volume Relationships';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e5q9c8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Mass-Mass Calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e5q9c8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Mass-Mass Relationships';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ucnecz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Mass calculations from molarity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ucnecz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Concentration and Molarity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ucnecz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Molarity and concentration calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('m4b114'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Relative Molecular Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('m4b114'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Molar Volume and Mass';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('m4b114'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.subtopic = 'Molar Mass Calculations';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kzcd9t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical equilibria' and q.subtopic = 'Le Chatelier''s Principle';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kzcd9t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical equilibria' and q.subtopic = 'Le Chatelier''s principle';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kzcd9t'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical equilibria' and q.subtopic = 'Effect of temperature on exothermic equilibria';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('shtbq8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical equilibria' and q.subtopic = 'Equilibrium Constant';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('shtbq8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical equilibria' and q.subtopic = 'Equilibrium Constant (Kc)';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cbvosp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Faraday''s Laws of Electrolysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cbvosp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Faraday''s Laws';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('cbvosp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Faraday''s laws of electrolysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('tqaefy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Preferential Discharge of Ions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('tqaefy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Electrolysis of water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('23bs2u'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Electrolytic Cells';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('23bs2u'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Daniell cell reactions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('23bs2u'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Inert Electrodes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('23bs2u'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Galvanic Cells';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('23bs2u'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Active Electrodes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('23bs2u'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Electrochemical Cells';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('qpxjys'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Industrial Applications of Electrolysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('qpxjys'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Electroplating';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('qpxjys'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Purification of metals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('yckr2s'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.subtopic = 'Electrolytes and Non-electrolytes';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('6i2n9s'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Enthalpy Changes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Entropy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Entropy changes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Entropy and Free Energy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Free energy and spontaneity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Free Energy and Spontaneity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Gibbs Free Energy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('s55vck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Gibbs Free Energy and Spontaneity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kshq1j'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Exothermic and Endothermic Reactions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kshq1j'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Exothermic and endothermic reactions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kshq1j'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Endothermic and Exothermic Reactions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kshq1j'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Energy Profile Diagrams';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('fiv6k4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Entropy changes on dissolution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('fiv6k4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Energy Changes in Dissolution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('6in5n9'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Heat of Neutralization';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('6in5n9'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.subtopic = 'Heat of Reaction';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('alfbvy'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Acid Rain';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('4w8vof'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Water Pollution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('4w8vof'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Pollutants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jiwfyk'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Ozone Layer';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jiwfyk'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'The atmosphere and ozone layer';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('jiwfyk'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Greenhouse Effect';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('u8nzau'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Air pollution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('u8nzau'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Air Pollution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('u8nzau'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.subtopic = 'Causes of smog';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Graham''s Law of Diffusion';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Charles''s Law';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Boyle''s Law';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Boyle''s law';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'General Gas Equation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Ideal Gas Equation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Ideal vs. Real Gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Standard Temperature and Pressure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('84csd7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Rates of Diffusion';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vvwi6v'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Physical and Chemical Changes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vvwi6v'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Identifying physical changes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bpogj3'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Purity of Substances';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v89sra'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Kinetic Theory of Matter';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v89sra'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Evidence for Particles';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('v89sra'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Postulates of kinetic theory';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('unbitv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'States of Matter and Phase Changes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('unbitv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Changes of state';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('fb792s'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Molar Volume of Gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('h65avs'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Elements, compounds and mixtures';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('h65avs'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Elements, Compounds and Mixtures';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('eo9w1a'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.subtopic = 'Gas pressure';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('4ihrpp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Alloys';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('4ihrpp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Composition and uses of soft solder';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction of Iron';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction and Properties of Iron';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction and properties of iron';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction of Metals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction of Aluminium';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction of aluminium';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Aluminium';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('hse3ru'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Extraction and Uses of Iron';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e6wz62'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Reactivity Series';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('e6wz62'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Electrochemical Series';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gc697d'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Transition Metals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gc697d'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Iron and its compounds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gc697d'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Iron and Steel';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('5q74k0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Corrosion of Metals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('5q74k0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Corrosion and rusting';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('5q74k0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Rusting of Iron';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('5q74k0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Chemical composition of rust';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('5q74k0'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Resistance to oxidation and metal uses';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('q8of3z'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Amphoterism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ndx7qp'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Action of heat on salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vfmsto'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Reaction of metals with dilute acids';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vfmsto'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'General Reactivity Facts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('865p59'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.subtopic = 'Qualitative Analysis';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2eamtt'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Sulphur and its Compounds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2eamtt'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Manufacture of Tetraoxosulphate(VI) acid';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2eamtt'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Hydrogen sulphide';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2eamtt'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Sulphur(IV) Oxide';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('2eamtt'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Sulphur and its Uses';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ewcz01'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Laboratory Preparation of Oxygen';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ewcz01'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Oxygen';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('brt8ck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Trioxonitrate (V) acid (Nitric acid)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('brt8ck'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Manufacture of Trioxonitrate(V) acid';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('w3jjz5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Hydrogen Chloride';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('w3jjz5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Properties of Chlorine';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('w3jjz5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Preparation of Chlorine';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('w3jjz5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Manufacture of Chlorine';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('w3jjz5'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Chlorine and its Compounds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Ammonia and its Salts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Ammonia and its Compounds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Ammonia and its reactions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Preparation and Properties of Ammonia';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Manufacture of Ammonia';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Nitrogen and its Compounds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Properties of Nitrates';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Oxides of nitrogen';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bqhgcv'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'The Nitrogen Cycle';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vejcxc'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Uses of noble gases';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gbh920'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Photodecomposition of chlorine water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('gbh920'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Bleaching Agents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('izl9kl'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Displacement Reactions of Halogens';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('izl9kl'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.subtopic = 'Uses and preparation of iodine tincture';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('xn8nji'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkanols';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bo2kcr'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'IUPAC Nomenclature';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bo2kcr'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Nomenclature';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bo2kcr'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Nomenclature of Alkenes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bo2kcr'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Functional Groups';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('lteab6'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Macromolecules (Polymers)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('j32bof'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Isomerism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('j32bof'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Structural isomerism in haloalkanes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('j32bof'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Structural Isomerism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('j32bof'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Geometric Isomerism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ace3du'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Hydrocarbons (Alkenes)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ace3du'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkenes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('bb5rj9'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Reactions of Alkenes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('orgaldk1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkanals and Alkanones';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('d1sp6r'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Carbohydrates';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('r4t0dz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkanes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('r4t0dz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Hydrocarbons (Alkanes)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('r4t0dz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Reactions of Alkanes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('r4t0dz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Hydrocarbons';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('r4t0dz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Boiling points of alkanes and van der Waals forces';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('4f68ue'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Reactions of Alkanols';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vfpcni'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Hydrocarbons (Alkynes)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('vfpcni'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkynes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('z9kmjm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Fats and Oils';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('z9kmjm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Fats and Oils (Saponification)';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('lws0hj'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Amines';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kmmznm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Esterification';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kmmznm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Esters';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kmmznm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Esters and Amides';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kmmznm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'IUPAC nomenclature of esters';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('uej13e'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Aromatic Hydrocarbons';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('uej13e'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Aromatic hydrocarbons';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('dcbxq2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkanoic Acids';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('dcbxq2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Alkanoic acids';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('dcbxq2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Properties of Alkanoic Acids';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('nuclq7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Halogenoalkanes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('a7c5wm'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Amino acids and proteins';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kk9o6y'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.subtopic = 'Fermentation';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('y963w7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Oxidation States';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('y963w7'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Oxidation numbers';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('0wt48x'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Electrochemical Series';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('0wt48x'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Oxidizing and Reducing Agents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('0wt48x'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Oxidizing and reducing agents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('0wt48x'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Test for Reducing Agents';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('d3l5it'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Balancing Redox Equations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('3hq7md'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.subtopic = 'Redox Reactions';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('c4kxyo'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Catalysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('c4kxyo'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Role of catalysts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('c4kxyo'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Activation Energy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('c4kxyo'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Collision Theory and Activation Energy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('c4kxyo'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Energy Profile Diagrams';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ocems4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Effect of Temperature';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ocems4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Collision Theory';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ocems4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Factors Affecting Rates of Reaction';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ocems4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Factors Affecting Reaction Rates';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('ocems4'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.subtopic = 'Factors affecting reaction rate';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('sepchrm1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Chromatography';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('sepdist1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Distillation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('sepdist1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Fractional Distillation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kc1jua'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Crystallization';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kc1jua'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Sublimation and Magnetic Separation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kc1jua'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Sublimation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kc1jua'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Complex Separations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kc1jua'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Separation of solid mixtures';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('kc1jua'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Adsorption';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mt5suz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Separating Funnel';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mt5suz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Separating immiscible liquids';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mt5suz'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.subtopic = 'Solubility and Solvents';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('9jaxsa'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Solubility Calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('9jaxsa'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Solubility calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mu3oy8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Solubility Curves';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mu3oy8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Crystallization and Calculations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mu3oy8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Solubility rules';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mu3oy8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Factors affecting solubility';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('mu3oy8'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.subtopic = 'Saturated vs supersaturated solutions';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Water Hardness';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Hardness of Water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Temporary and permanent hardness of water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Hardness of water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Temporary hardness and limescale formation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Water Treatment';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Town water treatment';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('beypy2'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Water Purification';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('wtrdelq1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Deliquescence, Efflorescence and Hygroscopy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('wtrdelq1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Hygroscopic, deliquescent and efflorescent substances';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('wtrdelq1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Deliquescence';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('wtrdelq1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Hygroscopy and deliquescence';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('fch4i1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Dissolved Gases in Water';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(
    case when (elem->>'conceptId') = any(array(select c.id from kairo.concepts c where c.subject='Chemistry' and c.subtopic is null))
    then jsonb_set(elem, '{conceptId}', to_jsonb('fch4i1'::text))
    else elem end
  )
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.subtopic = 'Dissolved oxygen in water';-- Acids, bases and salts: merge mpfx4x -> lslag9
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'mpfx4x' then jsonb_set(elem, '{conceptId}', to_jsonb('lslag9'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'mpfx4x'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'mpfx4x' and cs_canon.concept_id = 'lslag9' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'lslag9' where concept_id = 'mpfx4x';
update kairo.attempts set concept_id = 'lslag9' where concept_id = 'mpfx4x';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'mpfx4x', 'lslag9') where 'mpfx4x' = any(dependency_ids);
delete from kairo.concepts where id = 'mpfx4x';
-- Acids, bases and salts: merge 6y8jif -> lslag9
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '6y8jif' then jsonb_set(elem, '{conceptId}', to_jsonb('lslag9'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Acids, bases and salts' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '6y8jif'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '6y8jif' and cs_canon.concept_id = 'lslag9' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'lslag9' where concept_id = '6y8jif';
update kairo.attempts set concept_id = 'lslag9' where concept_id = '6y8jif';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '6y8jif', 'lslag9') where '6y8jif' = any(dependency_ids);
delete from kairo.concepts where id = '6y8jif';
-- Air: merge e9b7wz -> bxqx8h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'e9b7wz' then jsonb_set(elem, '{conceptId}', to_jsonb('bxqx8h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Air' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'e9b7wz'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'e9b7wz' and cs_canon.concept_id = 'bxqx8h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'bxqx8h' where concept_id = 'e9b7wz';
update kairo.attempts set concept_id = 'bxqx8h' where concept_id = 'e9b7wz';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'e9b7wz', 'bxqx8h') where 'e9b7wz' = any(dependency_ids);
delete from kairo.concepts where id = 'e9b7wz';
-- Atomic structure and bonding: merge flsz3n -> 31q61
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'flsz3n' then jsonb_set(elem, '{conceptId}', to_jsonb('31q61'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'flsz3n'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'flsz3n' and cs_canon.concept_id = '31q61' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '31q61' where concept_id = 'flsz3n';
update kairo.attempts set concept_id = '31q61' where concept_id = 'flsz3n';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'flsz3n', '31q61') where 'flsz3n' = any(dependency_ids);
delete from kairo.concepts where id = 'flsz3n';
-- Atomic structure and bonding: merge xi3d07 -> 31q61
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'xi3d07' then jsonb_set(elem, '{conceptId}', to_jsonb('31q61'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'xi3d07'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'xi3d07' and cs_canon.concept_id = '31q61' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '31q61' where concept_id = 'xi3d07';
update kairo.attempts set concept_id = '31q61' where concept_id = 'xi3d07';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'xi3d07', '31q61') where 'xi3d07' = any(dependency_ids);
delete from kairo.concepts where id = 'xi3d07';
-- Atomic structure and bonding: merge 52ykmr -> 31q61
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '52ykmr' then jsonb_set(elem, '{conceptId}', to_jsonb('31q61'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '52ykmr'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '52ykmr' and cs_canon.concept_id = '31q61' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '31q61' where concept_id = '52ykmr';
update kairo.attempts set concept_id = '31q61' where concept_id = '52ykmr';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '52ykmr', '31q61') where '52ykmr' = any(dependency_ids);
delete from kairo.concepts where id = '52ykmr';
-- Atomic structure and bonding: merge c6hxmz -> 31q61
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'c6hxmz' then jsonb_set(elem, '{conceptId}', to_jsonb('31q61'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'c6hxmz'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'c6hxmz' and cs_canon.concept_id = '31q61' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '31q61' where concept_id = 'c6hxmz';
update kairo.attempts set concept_id = '31q61' where concept_id = 'c6hxmz';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'c6hxmz', '31q61') where 'c6hxmz' = any(dependency_ids);
delete from kairo.concepts where id = 'c6hxmz';
-- Atomic structure and bonding: merge j70xof -> 31q61
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'j70xof' then jsonb_set(elem, '{conceptId}', to_jsonb('31q61'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'j70xof'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'j70xof' and cs_canon.concept_id = '31q61' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '31q61' where concept_id = 'j70xof';
update kairo.attempts set concept_id = '31q61' where concept_id = 'j70xof';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'j70xof', '31q61') where 'j70xof' = any(dependency_ids);
delete from kairo.concepts where id = 'j70xof';
-- Atomic structure and bonding: merge tztsyl -> 31q61
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'tztsyl' then jsonb_set(elem, '{conceptId}', to_jsonb('31q61'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Atomic structure and bonding' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'tztsyl'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'tztsyl' and cs_canon.concept_id = '31q61' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '31q61' where concept_id = 'tztsyl';
update kairo.attempts set concept_id = '31q61' where concept_id = 'tztsyl';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'tztsyl', '31q61') where 'tztsyl' = any(dependency_ids);
delete from kairo.concepts where id = 'tztsyl';
-- Chemical combination: merge mtaosz -> osbd5t
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'mtaosz' then jsonb_set(elem, '{conceptId}', to_jsonb('osbd5t'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'mtaosz'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'mtaosz' and cs_canon.concept_id = 'osbd5t' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'osbd5t' where concept_id = 'mtaosz';
update kairo.attempts set concept_id = 'osbd5t' where concept_id = 'mtaosz';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'mtaosz', 'osbd5t') where 'mtaosz' = any(dependency_ids);
delete from kairo.concepts where id = 'mtaosz';
-- Chemical combination: merge cb38qp -> osbd5t
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'cb38qp' then jsonb_set(elem, '{conceptId}', to_jsonb('osbd5t'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'cb38qp'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'cb38qp' and cs_canon.concept_id = 'osbd5t' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'osbd5t' where concept_id = 'cb38qp';
update kairo.attempts set concept_id = 'osbd5t' where concept_id = 'cb38qp';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'cb38qp', 'osbd5t') where 'cb38qp' = any(dependency_ids);
delete from kairo.concepts where id = 'cb38qp';
-- Chemical combination: merge gfms3d -> osbd5t
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'gfms3d' then jsonb_set(elem, '{conceptId}', to_jsonb('osbd5t'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'gfms3d'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'gfms3d' and cs_canon.concept_id = 'osbd5t' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'osbd5t' where concept_id = 'gfms3d';
update kairo.attempts set concept_id = 'osbd5t' where concept_id = 'gfms3d';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'gfms3d', 'osbd5t') where 'gfms3d' = any(dependency_ids);
delete from kairo.concepts where id = 'gfms3d';
-- Chemical combination: merge 3pr31b -> osbd5t
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '3pr31b' then jsonb_set(elem, '{conceptId}', to_jsonb('osbd5t'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemical combination' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '3pr31b'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '3pr31b' and cs_canon.concept_id = 'osbd5t' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'osbd5t' where concept_id = '3pr31b';
update kairo.attempts set concept_id = 'osbd5t' where concept_id = '3pr31b';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '3pr31b', 'osbd5t') where '3pr31b' = any(dependency_ids);
delete from kairo.concepts where id = '3pr31b';
-- Chemistry and Industry: merge 4yozg9 -> kol84h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '4yozg9' then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '4yozg9'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '4yozg9' and cs_canon.concept_id = 'kol84h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'kol84h' where concept_id = '4yozg9';
update kairo.attempts set concept_id = 'kol84h' where concept_id = '4yozg9';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '4yozg9', 'kol84h') where '4yozg9' = any(dependency_ids);
delete from kairo.concepts where id = '4yozg9';
-- Chemistry and Industry: merge kz6hhl -> kol84h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'kz6hhl' then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'kz6hhl'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'kz6hhl' and cs_canon.concept_id = 'kol84h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'kol84h' where concept_id = 'kz6hhl';
update kairo.attempts set concept_id = 'kol84h' where concept_id = 'kz6hhl';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'kz6hhl', 'kol84h') where 'kz6hhl' = any(dependency_ids);
delete from kairo.concepts where id = 'kz6hhl';
-- Chemistry and Industry: merge 7ix1cv -> kol84h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '7ix1cv' then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '7ix1cv'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '7ix1cv' and cs_canon.concept_id = 'kol84h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'kol84h' where concept_id = '7ix1cv';
update kairo.attempts set concept_id = 'kol84h' where concept_id = '7ix1cv';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '7ix1cv', 'kol84h') where '7ix1cv' = any(dependency_ids);
delete from kairo.concepts where id = '7ix1cv';
-- Chemistry and Industry: merge dervgf -> kol84h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'dervgf' then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'dervgf'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'dervgf' and cs_canon.concept_id = 'kol84h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'kol84h' where concept_id = 'dervgf';
update kairo.attempts set concept_id = 'kol84h' where concept_id = 'dervgf';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'dervgf', 'kol84h') where 'dervgf' = any(dependency_ids);
delete from kairo.concepts where id = 'dervgf';
-- Chemistry and Industry: merge j4576t -> kol84h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'j4576t' then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'j4576t'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'j4576t' and cs_canon.concept_id = 'kol84h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'kol84h' where concept_id = 'j4576t';
update kairo.attempts set concept_id = 'kol84h' where concept_id = 'j4576t';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'j4576t', 'kol84h') where 'j4576t' = any(dependency_ids);
delete from kairo.concepts where id = 'j4576t';
-- Chemistry and Industry: merge zamq5d -> kol84h
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'zamq5d' then jsonb_set(elem, '{conceptId}', to_jsonb('kol84h'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Chemistry and Industry' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'zamq5d'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'zamq5d' and cs_canon.concept_id = 'kol84h' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'kol84h' where concept_id = 'zamq5d';
update kairo.attempts set concept_id = 'kol84h' where concept_id = 'zamq5d';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'zamq5d', 'kol84h') where 'zamq5d' = any(dependency_ids);
delete from kairo.concepts where id = 'zamq5d';
-- Electrolysis: merge 71t5tt -> jzsjaf
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '71t5tt' then jsonb_set(elem, '{conceptId}', to_jsonb('jzsjaf'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Electrolysis' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '71t5tt'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '71t5tt' and cs_canon.concept_id = 'jzsjaf' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'jzsjaf' where concept_id = '71t5tt';
update kairo.attempts set concept_id = 'jzsjaf' where concept_id = '71t5tt';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '71t5tt', 'jzsjaf') where '71t5tt' = any(dependency_ids);
delete from kairo.concepts where id = '71t5tt';
-- Energy changes: merge qkm1lr -> y8cpsp
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'qkm1lr' then jsonb_set(elem, '{conceptId}', to_jsonb('y8cpsp'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'qkm1lr'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'qkm1lr' and cs_canon.concept_id = 'y8cpsp' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'y8cpsp' where concept_id = 'qkm1lr';
update kairo.attempts set concept_id = 'y8cpsp' where concept_id = 'qkm1lr';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'qkm1lr', 'y8cpsp') where 'qkm1lr' = any(dependency_ids);
delete from kairo.concepts where id = 'qkm1lr';
-- Energy changes: merge fgd7vj -> y8cpsp
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'fgd7vj' then jsonb_set(elem, '{conceptId}', to_jsonb('y8cpsp'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'fgd7vj'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'fgd7vj' and cs_canon.concept_id = 'y8cpsp' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'y8cpsp' where concept_id = 'fgd7vj';
update kairo.attempts set concept_id = 'y8cpsp' where concept_id = 'fgd7vj';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'fgd7vj', 'y8cpsp') where 'fgd7vj' = any(dependency_ids);
delete from kairo.concepts where id = 'fgd7vj';
-- Energy changes: merge usscxt -> y8cpsp
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'usscxt' then jsonb_set(elem, '{conceptId}', to_jsonb('y8cpsp'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Energy changes' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'usscxt'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'usscxt' and cs_canon.concept_id = 'y8cpsp' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'y8cpsp' where concept_id = 'usscxt';
update kairo.attempts set concept_id = 'y8cpsp' where concept_id = 'usscxt';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'usscxt', 'y8cpsp') where 'usscxt' = any(dependency_ids);
delete from kairo.concepts where id = 'usscxt';
-- Environmental Pollution: merge 5gycan -> qqowhr
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '5gycan' then jsonb_set(elem, '{conceptId}', to_jsonb('qqowhr'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Environmental Pollution' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '5gycan'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '5gycan' and cs_canon.concept_id = 'qqowhr' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'qqowhr' where concept_id = '5gycan';
update kairo.attempts set concept_id = 'qqowhr' where concept_id = '5gycan';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '5gycan', 'qqowhr') where '5gycan' = any(dependency_ids);
delete from kairo.concepts where id = '5gycan';
-- Kinetic theory of matter and Gas Laws: merge 1r4xtr -> 619mgx
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '1r4xtr' then jsonb_set(elem, '{conceptId}', to_jsonb('619mgx'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '1r4xtr'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '1r4xtr' and cs_canon.concept_id = '619mgx' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '619mgx' where concept_id = '1r4xtr';
update kairo.attempts set concept_id = '619mgx' where concept_id = '1r4xtr';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '1r4xtr', '619mgx') where '1r4xtr' = any(dependency_ids);
delete from kairo.concepts where id = '1r4xtr';
-- Kinetic theory of matter and Gas Laws: merge datmf3 -> 619mgx
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'datmf3' then jsonb_set(elem, '{conceptId}', to_jsonb('619mgx'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'datmf3'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'datmf3' and cs_canon.concept_id = '619mgx' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '619mgx' where concept_id = 'datmf3';
update kairo.attempts set concept_id = '619mgx' where concept_id = 'datmf3';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'datmf3', '619mgx') where 'datmf3' = any(dependency_ids);
delete from kairo.concepts where id = 'datmf3';
-- Kinetic theory of matter and Gas Laws: merge mdt825 -> 619mgx
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'mdt825' then jsonb_set(elem, '{conceptId}', to_jsonb('619mgx'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'mdt825'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'mdt825' and cs_canon.concept_id = '619mgx' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '619mgx' where concept_id = 'mdt825';
update kairo.attempts set concept_id = '619mgx' where concept_id = 'mdt825';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'mdt825', '619mgx') where 'mdt825' = any(dependency_ids);
delete from kairo.concepts where id = 'mdt825';
-- Kinetic theory of matter and Gas Laws: merge 2og9d5 -> 619mgx
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '2og9d5' then jsonb_set(elem, '{conceptId}', to_jsonb('619mgx'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '2og9d5'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '2og9d5' and cs_canon.concept_id = '619mgx' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '619mgx' where concept_id = '2og9d5';
update kairo.attempts set concept_id = '619mgx' where concept_id = '2og9d5';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '2og9d5', '619mgx') where '2og9d5' = any(dependency_ids);
delete from kairo.concepts where id = '2og9d5';
-- Kinetic theory of matter and Gas Laws: merge uj48v3 -> 619mgx
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'uj48v3' then jsonb_set(elem, '{conceptId}', to_jsonb('619mgx'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'uj48v3'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'uj48v3' and cs_canon.concept_id = '619mgx' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '619mgx' where concept_id = 'uj48v3';
update kairo.attempts set concept_id = '619mgx' where concept_id = 'uj48v3';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'uj48v3', '619mgx') where 'uj48v3' = any(dependency_ids);
delete from kairo.concepts where id = 'uj48v3';
-- Kinetic theory of matter and Gas Laws: merge 5cvpcn -> 619mgx
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '5cvpcn' then jsonb_set(elem, '{conceptId}', to_jsonb('619mgx'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Kinetic theory of matter and Gas Laws' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '5cvpcn'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '5cvpcn' and cs_canon.concept_id = '619mgx' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '619mgx' where concept_id = '5cvpcn';
update kairo.attempts set concept_id = '619mgx' where concept_id = '5cvpcn';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '5cvpcn', '619mgx') where '5cvpcn' = any(dependency_ids);
delete from kairo.concepts where id = '5cvpcn';
-- Metals and their compounds: merge h2k1cl -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'h2k1cl' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'h2k1cl'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'h2k1cl' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = 'h2k1cl';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = 'h2k1cl';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'h2k1cl', 'wf02hn') where 'h2k1cl' = any(dependency_ids);
delete from kairo.concepts where id = 'h2k1cl';-- Metals and their compounds: merge w6m601 -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'w6m601' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'w6m601'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'w6m601' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = 'w6m601';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = 'w6m601';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'w6m601', 'wf02hn') where 'w6m601' = any(dependency_ids);
delete from kairo.concepts where id = 'w6m601';
-- Metals and their compounds: merge jv2mdb -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'jv2mdb' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'jv2mdb'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'jv2mdb' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = 'jv2mdb';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = 'jv2mdb';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'jv2mdb', 'wf02hn') where 'jv2mdb' = any(dependency_ids);
delete from kairo.concepts where id = 'jv2mdb';
-- Metals and their compounds: merge 12lk1z -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '12lk1z' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '12lk1z'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '12lk1z' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = '12lk1z';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = '12lk1z';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '12lk1z', 'wf02hn') where '12lk1z' = any(dependency_ids);
delete from kairo.concepts where id = '12lk1z';
-- Metals and their compounds: merge wpb1d1 -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'wpb1d1' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'wpb1d1'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'wpb1d1' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = 'wpb1d1';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = 'wpb1d1';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'wpb1d1', 'wf02hn') where 'wpb1d1' = any(dependency_ids);
delete from kairo.concepts where id = 'wpb1d1';
-- Metals and their compounds: merge 9sxvjz -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '9sxvjz' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '9sxvjz'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '9sxvjz' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = '9sxvjz';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = '9sxvjz';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '9sxvjz', 'wf02hn') where '9sxvjz' = any(dependency_ids);
delete from kairo.concepts where id = '9sxvjz';
-- Metals and their compounds: merge vg4ysf -> wf02hn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'vg4ysf' then jsonb_set(elem, '{conceptId}', to_jsonb('wf02hn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'vg4ysf'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'vg4ysf' and cs_canon.concept_id = 'wf02hn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'wf02hn' where concept_id = 'vg4ysf';
update kairo.attempts set concept_id = 'wf02hn' where concept_id = 'vg4ysf';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'vg4ysf', 'wf02hn') where 'vg4ysf' = any(dependency_ids);
delete from kairo.concepts where id = 'vg4ysf';
-- Non-metals and their compounds: merge 8nt2nt -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '8nt2nt' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '8nt2nt'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '8nt2nt' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = '8nt2nt';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = '8nt2nt';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '8nt2nt', 'v8jbwn') where '8nt2nt' = any(dependency_ids);
delete from kairo.concepts where id = '8nt2nt';
-- Non-metals and their compounds: merge 55ry8f -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '55ry8f' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '55ry8f'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '55ry8f' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = '55ry8f';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = '55ry8f';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '55ry8f', 'v8jbwn') where '55ry8f' = any(dependency_ids);
delete from kairo.concepts where id = '55ry8f';
-- Non-metals and their compounds: merge 1p10fz -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '1p10fz' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '1p10fz'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '1p10fz' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = '1p10fz';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = '1p10fz';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '1p10fz', 'v8jbwn') where '1p10fz' = any(dependency_ids);
delete from kairo.concepts where id = '1p10fz';
-- Non-metals and their compounds: merge nvackh -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'nvackh' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'nvackh'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'nvackh' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = 'nvackh';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = 'nvackh';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'nvackh', 'v8jbwn') where 'nvackh' = any(dependency_ids);
delete from kairo.concepts where id = 'nvackh';
-- Non-metals and their compounds: merge g1t53n -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'g1t53n' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'g1t53n'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'g1t53n' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = 'g1t53n';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = 'g1t53n';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'g1t53n', 'v8jbwn') where 'g1t53n' = any(dependency_ids);
delete from kairo.concepts where id = 'g1t53n';
-- Non-metals and their compounds: merge kk4pup -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'kk4pup' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'kk4pup'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'kk4pup' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = 'kk4pup';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = 'kk4pup';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'kk4pup', 'v8jbwn') where 'kk4pup' = any(dependency_ids);
delete from kairo.concepts where id = 'kk4pup';
-- Non-metals and their compounds: merge ss984l -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'ss984l' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'ss984l'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'ss984l' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = 'ss984l';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = 'ss984l';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'ss984l', 'v8jbwn') where 'ss984l' = any(dependency_ids);
delete from kairo.concepts where id = 'ss984l';
-- Non-metals and their compounds: merge b892u3 -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'b892u3' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'b892u3'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'b892u3' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = 'b892u3';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = 'b892u3';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'b892u3', 'v8jbwn') where 'b892u3' = any(dependency_ids);
delete from kairo.concepts where id = 'b892u3';
-- Non-metals and their compounds: merge xy70yp -> v8jbwn
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'xy70yp' then jsonb_set(elem, '{conceptId}', to_jsonb('v8jbwn'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Non-metals and their compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'xy70yp'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'xy70yp' and cs_canon.concept_id = 'v8jbwn' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'v8jbwn' where concept_id = 'xy70yp';
update kairo.attempts set concept_id = 'v8jbwn' where concept_id = 'xy70yp';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'xy70yp', 'v8jbwn') where 'xy70yp' = any(dependency_ids);
delete from kairo.concepts where id = 'xy70yp';
-- Organic Compounds: merge mqutgf -> 5io3z5
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'mqutgf' then jsonb_set(elem, '{conceptId}', to_jsonb('5io3z5'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'mqutgf'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'mqutgf' and cs_canon.concept_id = '5io3z5' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '5io3z5' where concept_id = 'mqutgf';
update kairo.attempts set concept_id = '5io3z5' where concept_id = 'mqutgf';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'mqutgf', '5io3z5') where 'mqutgf' = any(dependency_ids);
delete from kairo.concepts where id = 'mqutgf';
-- Organic Compounds: merge sssfwf -> 5io3z5
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'sssfwf' then jsonb_set(elem, '{conceptId}', to_jsonb('5io3z5'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Organic Compounds' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'sssfwf'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'sssfwf' and cs_canon.concept_id = '5io3z5' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '5io3z5' where concept_id = 'sssfwf';
update kairo.attempts set concept_id = '5io3z5' where concept_id = 'sssfwf';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'sssfwf', '5io3z5') where 'sssfwf' = any(dependency_ids);
delete from kairo.concepts where id = 'sssfwf';
-- Oxidation and reduction: merge h1a6m9 -> qen1i7
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'h1a6m9' then jsonb_set(elem, '{conceptId}', to_jsonb('qen1i7'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Oxidation and reduction' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'h1a6m9'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'h1a6m9' and cs_canon.concept_id = 'qen1i7' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'qen1i7' where concept_id = 'h1a6m9';
update kairo.attempts set concept_id = 'qen1i7' where concept_id = 'h1a6m9';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'h1a6m9', 'qen1i7') where 'h1a6m9' = any(dependency_ids);
delete from kairo.concepts where id = 'h1a6m9';
-- Rates of Chemical Reaction: merge 97mtz5 -> yr6ha1
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = '97mtz5' then jsonb_set(elem, '{conceptId}', to_jsonb('yr6ha1'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', '97mtz5'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = '97mtz5' and cs_canon.concept_id = 'yr6ha1' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'yr6ha1' where concept_id = '97mtz5';
update kairo.attempts set concept_id = 'yr6ha1' where concept_id = '97mtz5';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, '97mtz5', 'yr6ha1') where '97mtz5' = any(dependency_ids);
delete from kairo.concepts where id = '97mtz5';
-- Rates of Chemical Reaction: merge agc5wh -> yr6ha1
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'agc5wh' then jsonb_set(elem, '{conceptId}', to_jsonb('yr6ha1'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Rates of Chemical Reaction' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'agc5wh'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'agc5wh' and cs_canon.concept_id = 'yr6ha1' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'yr6ha1' where concept_id = 'agc5wh';
update kairo.attempts set concept_id = 'yr6ha1' where concept_id = 'agc5wh';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'agc5wh', 'yr6ha1') where 'agc5wh' = any(dependency_ids);
delete from kairo.concepts where id = 'agc5wh';
-- Separation of mixtures and purification of chemical substances: merge zc491d -> xp7zed
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'zc491d' then jsonb_set(elem, '{conceptId}', to_jsonb('xp7zed'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'zc491d'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'zc491d' and cs_canon.concept_id = 'xp7zed' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'xp7zed' where concept_id = 'zc491d';
update kairo.attempts set concept_id = 'xp7zed' where concept_id = 'zc491d';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'zc491d', 'xp7zed') where 'zc491d' = any(dependency_ids);
delete from kairo.concepts where id = 'zc491d';
-- Separation of mixtures and purification of chemical substances: merge i4r36p -> xp7zed
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'i4r36p' then jsonb_set(elem, '{conceptId}', to_jsonb('xp7zed'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Separation of mixtures and purification of chemical substances' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'i4r36p'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'i4r36p' and cs_canon.concept_id = 'xp7zed' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'xp7zed' where concept_id = 'i4r36p';
update kairo.attempts set concept_id = 'xp7zed' where concept_id = 'i4r36p';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'i4r36p', 'xp7zed') where 'i4r36p' = any(dependency_ids);
delete from kairo.concepts where id = 'i4r36p';
-- Solubility: merge iid473 -> g6vk9f
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'iid473' then jsonb_set(elem, '{conceptId}', to_jsonb('g6vk9f'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'iid473'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'iid473' and cs_canon.concept_id = 'g6vk9f' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'g6vk9f' where concept_id = 'iid473';
update kairo.attempts set concept_id = 'g6vk9f' where concept_id = 'iid473';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'iid473', 'g6vk9f') where 'iid473' = any(dependency_ids);
delete from kairo.concepts where id = 'iid473';
-- Solubility: merge w85zxx -> g6vk9f
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'w85zxx' then jsonb_set(elem, '{conceptId}', to_jsonb('g6vk9f'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Solubility' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'w85zxx'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'w85zxx' and cs_canon.concept_id = 'g6vk9f' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'g6vk9f' where concept_id = 'w85zxx';
update kairo.attempts set concept_id = 'g6vk9f' where concept_id = 'w85zxx';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'w85zxx', 'g6vk9f') where 'w85zxx' = any(dependency_ids);
delete from kairo.concepts where id = 'w85zxx';
-- Water: merge jb9yi9 -> 1siqzl
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'jb9yi9' then jsonb_set(elem, '{conceptId}', to_jsonb('1siqzl'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'jb9yi9'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'jb9yi9' and cs_canon.concept_id = '1siqzl' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '1siqzl' where concept_id = 'jb9yi9';
update kairo.attempts set concept_id = '1siqzl' where concept_id = 'jb9yi9';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'jb9yi9', '1siqzl') where 'jb9yi9' = any(dependency_ids);
delete from kairo.concepts where id = 'jb9yi9';
-- Water: merge icgutb -> 1siqzl
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'icgutb' then jsonb_set(elem, '{conceptId}', to_jsonb('1siqzl'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'icgutb'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'icgutb' and cs_canon.concept_id = '1siqzl' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '1siqzl' where concept_id = 'icgutb';
update kairo.attempts set concept_id = '1siqzl' where concept_id = 'icgutb';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'icgutb', '1siqzl') where 'icgutb' = any(dependency_ids);
delete from kairo.concepts where id = 'icgutb';
-- Water: merge x73n35 -> 1siqzl
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'x73n35' then jsonb_set(elem, '{conceptId}', to_jsonb('1siqzl'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'x73n35'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'x73n35' and cs_canon.concept_id = '1siqzl' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '1siqzl' where concept_id = 'x73n35';
update kairo.attempts set concept_id = '1siqzl' where concept_id = 'x73n35';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'x73n35', '1siqzl') where 'x73n35' = any(dependency_ids);
delete from kairo.concepts where id = 'x73n35';
-- Water: merge oin8lb -> 1siqzl
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(case when (elem->>'conceptId') = 'oin8lb' then jsonb_set(elem, '{conceptId}', to_jsonb('1siqzl'::text)) else elem end)
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Chemistry' and q.topic = 'Water' and q.concepts_tested @> jsonb_build_array(jsonb_build_object('conceptId', 'oin8lb'));
delete from kairo.concept_states cs_loser
using kairo.concept_states cs_canon
where cs_loser.concept_id = 'oin8lb' and cs_canon.concept_id = '1siqzl' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '1siqzl' where concept_id = 'oin8lb';
update kairo.attempts set concept_id = '1siqzl' where concept_id = 'oin8lb';
update kairo.concepts set dependency_ids = array_replace(dependency_ids, 'oin8lb', '1siqzl') where 'oin8lb' = any(dependency_ids);
delete from kairo.concepts where id = 'oin8lb';do $$
declare bad_count int;
begin
  select count(*) into bad_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  where q.subject = 'Chemistry'
  and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
  if bad_count > 0 then
    raise exception 'chem_remap: % question(s) left with a dangling conceptId', bad_count;
  end if;
end $$;
commit;
