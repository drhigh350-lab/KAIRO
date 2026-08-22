begin;

-- Align Mathematics to the official JAMB syllabus (5 broad areas, flattened
-- into their 41 listed granular topics -- the same granularity level used
-- as the canonical `topic` field for Chemistry/Biology/Physics). Small
-- dataset (30 questions, 10 pre-existing 1:1 topic:concept pairs), so this
-- is done as one direct migration rather than a generated/chunked one.
--
-- Fixes: 4 mega-bucket raw topics split across their real syllabus topics
-- (Indices and Logarithms -> Indices / Logarithms; Trigonometry ->
-- Trigonometric ratios / Heights and distances; Statistics -> Measures of
-- central tendency; Sequences and Series -> Arithmetic progression /
-- Geometric progression); "Simple Interest and Percentages" retopic'd to
-- the syllabus's actual "Percentages" topic (Simple Interest is JAMB
-- commercial-arithmetic content under Percentages, not its own topic);
-- casing normalized on 4 topics to match the syllabus text exactly.
-- Mensuration and Measures of central tendency also split into per-skill
-- concepts (area/perimeter/volume, mean/median/mode) matching the
-- concept-level granularity already applied to the other subjects.

-- 1. New concepts for genuine splits
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathind1', 'Laws of Indices', 'Mathematics', 'Indices', 'Laws of Indices', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathpct1', 'Percentage Change', 'Mathematics', 'Percentages', 'Percentage Change', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathmen1', 'Perimeter and Circumference', 'Mathematics', 'Mensuration', 'Perimeter and Circumference', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathmen2', 'Volume of Solids', 'Mathematics', 'Mensuration', 'Volume of Solids', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathhd01', 'Angles of Elevation and Depression', 'Mathematics', 'Heights and distances', 'Angles of Elevation and Depression', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathmed1', 'Median', 'Mathematics', 'Measures of central tendency', 'Median', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathmod1', 'Mode', 'Mathematics', 'Measures of central tendency', 'Mode', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathap01', 'Sum of an Arithmetic Progression', 'Mathematics', 'Arithmetic progression', 'Sum of an Arithmetic Progression', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('mathgp01', 'nth Term of a Geometric Progression', 'Mathematics', 'Geometric progression', 'nth Term of a Geometric Progression', 1.0, '{}', '{}') on conflict (id) do nothing;

-- 2. Existing concepts: casing fix, retopic, and/or rename for the surviving branch of a split
update kairo.concepts set topic = 'Number bases' where id = 'be64x9';
update kairo.concepts set name = 'Laws of Logarithms', topic = 'Logarithms', subtopic = 'Laws of Logarithms' where id = 'q380e4';
update kairo.concepts set topic = 'Simultaneous equations' where id = 'nfvo16';
update kairo.concepts set topic = 'Quadratic equations' where id = 'p719da';
update kairo.concepts set name = 'Simple Interest', topic = 'Percentages', subtopic = 'Simple Interest' where id = '46gg3b';
update kairo.concepts set name = 'Area of Plane Shapes', subtopic = 'Area of Plane Shapes' where id = '1ui9n7';
update kairo.concepts set name = 'Trigonometric Ratios of Angles', topic = 'Trigonometric ratios', subtopic = 'Trigonometric Ratios of Angles' where id = 'edgjx3';
update kairo.concepts set name = 'Mean', topic = 'Measures of central tendency', subtopic = 'Mean' where id = 'p7l3z1';
update kairo.concepts set name = 'nth Term of an Arithmetic Progression', topic = 'Arithmetic progression', subtopic = 'nth Term of an Arithmetic Progression' where id = 'j8p7et';

-- 3. Question topic/subtopic/concept realignment
update kairo.questions set topic = 'Number bases', subtopic = 'Base Conversion' where id in ('mathematics_0001', 'mathematics_0002', 'mathematics_0003');

update kairo.questions
set topic = 'Indices', subtopic = 'Laws of Indices',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathind1'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0004';

update kairo.questions set topic = 'Logarithms', subtopic = 'Laws of Logarithms' where id in ('mathematics_0005', 'mathematics_0006');

update kairo.questions set topic = 'Simultaneous equations' where id in ('mathematics_0007', 'mathematics_0008', 'mathematics_0009');

update kairo.questions set topic = 'Quadratic equations' where id in ('mathematics_0010', 'mathematics_0011', 'mathematics_0012');

update kairo.questions set topic = 'Percentages', subtopic = 'Simple Interest' where id in ('mathematics_0013', 'mathematics_0015');

update kairo.questions
set topic = 'Percentages', subtopic = 'Percentage Change',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathpct1'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0014';

update kairo.questions set subtopic = 'Area of Plane Shapes' where id = 'mathematics_0016';

update kairo.questions
set subtopic = 'Perimeter and Circumference',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathmen1'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0017';

update kairo.questions
set subtopic = 'Volume of Solids',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathmen2'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0018';

update kairo.questions set topic = 'Trigonometric ratios', subtopic = 'Trigonometric Ratios of Angles' where id in ('mathematics_0019', 'mathematics_0021');

update kairo.questions
set topic = 'Heights and distances', subtopic = 'Angles of Elevation and Depression',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathhd01'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0020';

update kairo.questions set topic = 'Measures of central tendency', subtopic = 'Mean' where id = 'mathematics_0022';

update kairo.questions
set topic = 'Measures of central tendency', subtopic = 'Median',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathmed1'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0023';

update kairo.questions
set topic = 'Measures of central tendency', subtopic = 'Mode',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathmod1'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0024';

update kairo.questions set subtopic = 'Simple Probability' where id in ('mathematics_0025', 'mathematics_0026', 'mathematics_0027');

update kairo.questions set topic = 'Arithmetic progression', subtopic = 'nth Term of an Arithmetic Progression' where id = 'mathematics_0028';

update kairo.questions
set topic = 'Arithmetic progression', subtopic = 'Sum of an Arithmetic Progression',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathap01'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0029';

update kairo.questions
set topic = 'Geometric progression', subtopic = 'nth Term of a Geometric Progression',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mathgp01'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'mathematics_0030';

-- 4. Lock topic to the 41 official JAMB Mathematics topics (5 broad areas, flattened)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'questions_mathematics_topic_syllabus_check') then
    alter table kairo.questions add constraint questions_mathematics_topic_syllabus_check
    check (subject <> 'Mathematics' or topic = any (array[
        'Number bases','Fractions, decimals and approximations','Percentages','Indices','Logarithms',
        'Surds','Sets','Arithmetic progression','Geometric progression','Binary operations','Modular arithmetic',
        'Algebraic expressions','Factorization','Change of subject of formula','Linear equations',
        'Simultaneous equations','Quadratic equations','Inequalities','Variation','Polynomials','Matrices and determinants',
        'Angles','Triangles','Polygons','Circles','Mensuration','Loci','Coordinate geometry',
        'Trigonometric ratios','Trigonometric functions','Heights and distances',
        'Differentiation','Applications of differentiation','Integration','Applications of integration',
        'Data collection and presentation','Frequency distributions','Measures of central tendency',
        'Measures of dispersion','Probability','Permutations and combinations'
    ]::text[]));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'concepts_mathematics_topic_syllabus_check') then
    alter table kairo.concepts add constraint concepts_mathematics_topic_syllabus_check
    check (subject <> 'Mathematics' or topic = any (array[
        'Number bases','Fractions, decimals and approximations','Percentages','Indices','Logarithms',
        'Surds','Sets','Arithmetic progression','Geometric progression','Binary operations','Modular arithmetic',
        'Algebraic expressions','Factorization','Change of subject of formula','Linear equations',
        'Simultaneous equations','Quadratic equations','Inequalities','Variation','Polynomials','Matrices and determinants',
        'Angles','Triangles','Polygons','Circles','Mensuration','Loci','Coordinate geometry',
        'Trigonometric ratios','Trigonometric functions','Heights and distances',
        'Differentiation','Applications of differentiation','Integration','Applications of integration',
        'Data collection and presentation','Frequency distributions','Measures of central tendency',
        'Measures of dispersion','Probability','Permutations and combinations'
    ]::text[]));
  end if;
end $$;

-- 5. Safety net
do $$
declare bad_count int;
declare mismatch_count int;
begin
  select count(*) into bad_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  where q.subject = 'Mathematics'
  and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
  if bad_count > 0 then
    raise exception 'math_remap: % question(s) left with a dangling conceptId', bad_count;
  end if;

  select count(*) into mismatch_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  join kairo.concepts c on c.id = e->>'conceptId'
  where q.subject = 'Mathematics' and q.topic <> c.topic;
  if mismatch_count > 0 then
    raise exception 'math_remap: % question(s) still have topic <> concept.topic', mismatch_count;
  end if;
end $$;

commit;
