begin;

-- Pass 2: fix 132 topic/concept mismatches discovered in physics_0201-0873
-- (questions seeded by a separate later batch reusing the pass-1 concept
-- catalog), plus 7 corrections to the original pass-1 classification that
-- this cross-check exposed (surface tension/capillarity/viscosity belong
-- under 'Liquids at Rest' per the JAMB syllabus, not 'Kinetic Theory of
-- Matter'/'Friction'; electrical energy consumption belongs under
-- 'Electrical Energy and Power' not 'Work, Energy and Power'; resonance in
-- forced vibration belongs under 'Propagation of Sound Waves' not 'Motion').

-- 1. New concepts for genuine gaps
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy2i9tn', 'Isotopes and Nuclear Structure', 'Physics', 'Nuclear Physics', 'Isotopes and Nuclear Structure', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy6tv1w', 'Thermal Equilibrium', 'Physics', 'Temperature and its Measurement', 'Thermal Equilibrium', 1.0, '{}', '{}') on conflict (id) do nothing;

-- 2. Concept retopics
update kairo.concepts set topic = 'Magnetic Field' where id = 'q7e71m';
update kairo.concepts set topic = 'Electric Cells' where id = 'a69fu';
update kairo.concepts set topic = 'Liquids at Rest' where id = 'phyphr62';
update kairo.concepts set topic = 'Liquids at Rest' where id = 'phy31yih';
update kairo.concepts set topic = 'Liquids at Rest' where id = 'phy5tb94';
update kairo.concepts set topic = 'Heat Transfer' where id = 'phy0lvsn';
update kairo.concepts set topic = 'Electrical Energy and Power' where id = 'phycwi64';
update kairo.concepts set topic = 'Light Energy' where id = '3kwo9o';
update kairo.concepts set topic = 'Propagation of Sound Waves' where id = 'phyazytj';

-- 3. Original physics_0001-0200 rows synced to the retopics above
update kairo.questions set topic = 'Liquids at Rest' where id = 'physics_0100';
update kairo.questions set topic = 'Liquids at Rest' where id = 'physics_0102';
update kairo.questions set topic = 'Liquids at Rest' where id = 'physics_0054';
update kairo.questions set topic = 'Liquids at Rest' where id = 'physics_0055';
update kairo.questions set topic = 'Heat Transfer' where id = 'physics_0095';
update kairo.questions set topic = 'Electrical Energy and Power' where id = 'physics_0046';
update kairo.questions set topic = 'Propagation of Sound Waves' where id = 'physics_0029';

-- 3b. Additional rows outside the 132/0001-0200 sets that were previously
-- matching under the OLD concept topic and would break from step 2's retopics
update kairo.questions
set topic = 'Current Electricity',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyr5uqp'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'physics_0350';
update kairo.questions set topic = 'Magnetic Field' where id = 'physics_0528';

-- 4. Topic-only fixes (concept already correct, questions.topic was stale)
update kairo.questions set topic = 'Magnetic Field' where id in ('physics_0233', 'physics_0251', 'physics_0394', 'physics_0531', 'physics_0539', 'physics_0560', 'physics_0786', 'physics_0823');
update kairo.questions set topic = 'Electric Cells' where id in ('physics_0201', 'physics_0240', 'physics_0545', 'physics_0619', 'physics_0711', 'physics_0792', 'physics_0855', 'physics_0859', 'physics_0367', 'physics_0661', 'physics_0205', 'physics_0554');
update kairo.questions set topic = 'Liquids at Rest' where id in ('physics_0252', 'physics_0295', 'physics_0356', 'physics_0656', 'physics_0671', 'physics_0772', 'physics_0458', 'physics_0624', 'physics_0347', 'physics_0677', 'physics_0681', 'physics_0290', 'physics_0543', 'physics_0810');
update kairo.questions set topic = 'Heat Transfer' where id in ('physics_0569', 'physics_0650', 'physics_0865');
update kairo.questions set topic = 'Electrical Energy and Power' where id in ('physics_0326', 'physics_0500', 'physics_0627', 'physics_0802', 'physics_0867', 'physics_0664', 'physics_0821');
update kairo.questions set topic = 'Light Energy' where id in ('physics_0842', 'physics_0848', 'physics_0863', 'physics_0525', 'physics_0750');
update kairo.questions set topic = 'Propagation of Sound Waves' where id in ('physics_0218', 'physics_0228', 'physics_0266', 'physics_0404', 'physics_0463', 'physics_0841', 'physics_0361', 'physics_0494', 'physics_0668', 'physics_0703', 'physics_0340', 'physics_0432', 'physics_0646', 'physics_0440', 'physics_0462', 'physics_0595', 'physics_0365', 'physics_0618', 'physics_0714', 'physics_0598');
update kairo.questions set topic = 'Motion' where id in ('physics_0331', 'physics_0422', 'physics_0449', 'physics_0731', 'physics_0730');
update kairo.questions set topic = 'Scalars and Vectors' where id in ('physics_0377');
update kairo.questions set topic = 'Electromagnetic Induction' where id in ('physics_0299', 'physics_0738', 'physics_0303', 'physics_0784', 'physics_0820');
update kairo.questions set topic = 'Current Electricity' where id in ('physics_0275', 'physics_0248');
update kairo.questions set topic = 'Refraction of Light' where id in ('physics_0216');
update kairo.questions set topic = 'Optical Instruments' where id in ('physics_0614', 'physics_0745', 'physics_0838');
update kairo.questions set topic = 'Dispersion of Light and Colours' where id in ('physics_0721', 'physics_0854');
update kairo.questions set topic = 'Measurements and Units' where id in ('physics_0805');
update kairo.questions set topic = 'Electrostatics' where id in ('physics_0471');
update kairo.questions set topic = 'Equilibrium of Forces' where id in ('physics_0606');
update kairo.questions set topic = 'Elementary Modern Physics' where id in ('physics_0474', 'physics_0202', 'physics_0436', 'physics_0503', 'physics_0639', 'physics_0655', 'physics_0600');
update kairo.questions set topic = 'Energy Quantization' where id in ('physics_0475');
update kairo.questions set topic = 'Nuclear Physics' where id in ('physics_0346', 'physics_0486');
update kairo.questions set topic = 'Change of State' where id in ('physics_0351', 'physics_0775', 'physics_0568', 'physics_0262', 'physics_0701');
update kairo.questions set topic = 'Kinetic Theory of Matter' where id in ('physics_0728');
update kairo.questions set topic = 'Alternating Current' where id in ('physics_0396', 'physics_0589');
update kairo.questions set topic = 'Waves' where id in ('physics_0302', 'physics_0762');
update kairo.questions set topic = 'Work, Energy and Power' where id in ('physics_0774');

-- 5. Concept reassignments
update kairo.questions
set topic = 'Equilibrium of Forces',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyrc11e'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0226';
update kairo.questions
set topic = 'Electrical Energy and Power',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyuk9e1'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0243';
update kairo.questions
set topic = 'Alternating Current',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('138vlu'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0254';
update kairo.questions
set topic = 'Alternating Current',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('138vlu'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0690';
update kairo.questions
set topic = 'Elementary Modern Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phykkv9r'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0341';
update kairo.questions
set topic = 'Elementary Modern Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy49itn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0476';
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('l7dm74'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0594';
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('l7dm74'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0665';
update kairo.questions
set topic = 'Gas Laws',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3j2d5'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0308';
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phygdswm'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0549';
update kairo.questions
set topic = 'Magnetic Field',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('q7e71m'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0584';
update kairo.questions
set topic = 'Heat Transfer',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phydpg8s'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0717';
update kairo.questions
set topic = 'Electric Cells',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('a69fu'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0852';
update kairo.questions
set topic = 'Nuclear Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2i9tn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0605';
update kairo.questions
set topic = 'Nuclear Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2i9tn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0621';
update kairo.questions
set topic = 'Nuclear Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2i9tn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0632';
update kairo.questions
set topic = 'Nuclear Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2i9tn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0643';
update kairo.questions
set topic = 'Nuclear Physics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2i9tn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0688';
update kairo.questions
set topic = 'Temperature and its Measurement',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy6tv1w'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0250';
update kairo.questions
set topic = 'Quantity of Heat',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyg8jdp'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id = 'physics_0642';

-- 6. Safety net
do $$
declare bad_count int;
declare mismatch_count int;
begin
  select count(*) into bad_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  where q.subject = 'Physics'
  and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
  if bad_count > 0 then
    raise exception 'phy_pass2: % question(s) left with a dangling conceptId', bad_count;
  end if;

  select count(*) into mismatch_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  join kairo.concepts c on c.id = e->>'conceptId'
  where q.subject = 'Physics' and q.topic <> c.topic;
  if mismatch_count > 0 then
    raise exception 'phy_pass2: % question(s) still have topic <> concept.topic', mismatch_count;
  end if;
end $$;

commit;