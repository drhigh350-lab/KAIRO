-- Biology concept-level pass: create granular concepts for real content
-- clusters (2 topics -- 'Support and movement', 'Natural habitats' -- had
-- zero dedicated concepts at all; several others were thin), and fix the
-- 266 question<->concept topic mismatches left after the topic-string
-- realignment (a question relinked to a concept whose own topic doesn't
-- match, because Biology's 94 concepts pre-existed the 23-topic mapping
-- and several -- e.g. 'Adaptations', 'Homeostasis', 'Blood Groups' -- were
-- being reused across multiple official topics). Each remap targets a
-- concept whose own topic equals the question's topic: an existing native
-- concept where one fits, or one of 26 newly created ones for a real
-- cluster with no home (e.g. 'Skeletal System and Joints', 'Cellular
-- Respiration and ATP Production', 'Blood Groups and Transfusion').
--
-- 3 rows needed a manual follow-up fix after the bulk pass (a
-- self-inconsistent source mapping that pointed at a concept native to
-- the wrong topic, one subtopic string missed entirely, and one exact-
-- match statement that didn't take effect against the live table for
-- reasons not fully diagnosed) -- included at the end of this file so a
-- fresh environment lands in the same fully-clean state as production.
--
-- Verified against production: 120 total Biology concepts (was 94, +26
-- new), all 23 official topics now have >=1 dedicated concept (was 21),
-- 0 remaining question<->concept topic mismatches (was 266), 0 dangling
-- references across questions.concepts_tested, concept_states.concept_id,
-- or attempts.concept_id.

begin;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biosk01', 'Skeletal System and Joints', 'Biology', 'Support and movement', 'Skeletal System and Joints', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biolm01', 'Locomotion and Movement Adaptations', 'Biology', 'Support and movement', 'Locomotion and Movement Adaptations', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biops01', 'Plant Support Mechanisms', 'Biology', 'Support and movement', 'Plant Support Mechanisms', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biotp01', 'Thermoregulation and Poikilothermy', 'Biology', 'Support and movement', 'Thermoregulation and Poikilothermy', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biosm01', 'Support and Movement', 'Biology', 'Support and movement', 'Support and Movement', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biohn01', 'Habitat Types and Ecological Niche', 'Biology', 'Natural habitats', 'Habitat Types and Ecological Niche', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biocr01', 'Cellular Respiration and ATP Production', 'Biology', 'Respiration', 'Cellular Respiration and ATP Production', 1.1, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('bioaf01', 'Anaerobic Respiration and Fermentation', 'Biology', 'Respiration', 'Anaerobic Respiration and Fermentation', 1.1, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biobm01', 'Mammalian Breathing Mechanism', 'Biology', 'Respiration', 'Mammalian Breathing Mechanism', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biogx01', 'Gaseous Exchange Surfaces Across Taxa', 'Biology', 'Respiration', 'Gaseous Exchange Surfaces Across Taxa', 1.1, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biowa01', 'Adaptations to Water Availability', 'Biology', 'Factors affecting the distribution of organisms', 'Adaptations to Water Availability', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biodv01', 'Disease Vectors and Distribution', 'Biology', 'Factors affecting the distribution of organisms', 'Disease Vectors and Distribution', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biopa01', 'Parasitism', 'Biology', 'Symbiotic interactions of plants and animals', 'Parasitism', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biomu01', 'Mutualism', 'Biology', 'Symbiotic interactions of plants and animals', 'Mutualism', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('bioco01', 'Commensalism', 'Biology', 'Symbiotic interactions of plants and animals', 'Commensalism', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biose01', 'Sense Organs and Sensory Structures', 'Biology', 'Co-ordination and control', 'Sense Organs and Sensory Structures', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('bioib01', 'Insect and Animal Behaviour', 'Biology', 'Evolution among organisms', 'Insect and Animal Behaviour', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biopl01', 'Parasite and Pathogen Life Cycles', 'Biology', 'Evolution among organisms', 'Parasite and Pathogen Life Cycles', 1.1, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('bioag01', 'Animal and Plant Adaptations by Group', 'Biology', 'Evolution among organisms', 'Animal and Plant Adaptations by Group', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('bioep01', 'Excretion in Plants', 'Biology', 'Excretion', 'Excretion in Plants', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biosg01', 'Seed Germination', 'Biology', 'Growth', 'Seed Germination', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biopg01', 'Plant Growth and Development', 'Biology', 'Growth', 'Plant Growth and Development', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biovh01', 'Variation and Heritability', 'Biology', 'Heredity', 'Variation and Heritability', 1.1, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biofd01', 'Feeding Adaptations and Dentition', 'Biology', 'Nutrition', 'Feeding Adaptations and Dentition', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biome01', 'Metamorphosis and Life Cycle Stages', 'Biology', 'Reproduction', 'Metamorphosis and Life Cycle Stages', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('biobg01', 'Blood Groups and Transfusion', 'Biology', 'Transport', 'Blood Groups and Transfusion', 1.0, '{}', '{}') on conflict (id) do nothing;update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Vertebral column';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Appendicular skeleton';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Mammalian vertebrae';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Skeletal system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Hinge joint at the knee';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Neural arch of a vertebra';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Joints';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Bones';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Hydrostatic skeleton';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Materials of the skeletal system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Pelvic girdle';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Axial skeleton';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Human skeletal system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Functions of the vertebrate skeleton';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Thoracic vertebrae and breathing';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosk01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Body symmetry in animals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biolm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Fish locomotion';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biolm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Streamlined body shape in fish';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biolm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Functions of fish fins';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biolm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Adaptation for movement';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biolm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Flight feathers in birds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biops01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Turgidity as mechanical support in plants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biops01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Cell walls and turgor';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biops01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Xylem tissue adaptation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biotp01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Poikilothermic animals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biotp01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Body temperature regulation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biotp01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Poikilotherms and homoiotherms';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biotp01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Temperature regulation in fish';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biotp01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Poikilothermy in animals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Sensory receptors in the skin';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biolm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Sexual selection and courtship behaviour in Agama lizards';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Circulatory system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Tapeworm attachment organs';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Trichocysts in Paramecium';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biops01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Savanna plant adaptation to bush fires';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Xerophytic adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Aquatic adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Bird adaptations for feeding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Bird adaptations for feeding and digging';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Support and movement' and q.subtopic = 'Feeding adaptations of birds of prey';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Habitats';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Habitat';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Habitat types';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Ecological niche';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Habitats and Adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Marine ecology';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biohn01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Natural habitats' and q.subtopic = 'Zonation in freshwater habitats';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Glycolysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Tissue respiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Catabolism and breakdown of complex substances';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Respiration as a source of ATP energy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Mitochondrial role in cellular respiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Overall reaction of glycolysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Location of glycolysis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Carbon dioxide release during respiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biocr01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Experiments on respiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioaf01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Anaerobic Respiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioaf01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Anaerobic respiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioaf01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Fermentation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioaf01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Anaerobic respiration in yeast';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioaf01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Carbon dioxide production during fermentation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Mechanism of breathing';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Role of the diaphragm in breathing';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Mechanics of expiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Mammalian respiratory system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Mammalian lung structure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Air pathway through the mammalian respiratory system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Respiratory organs in mammals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Human respiratory system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobm01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Composition of inhaled and exhaled air';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Adaptations of respiratory surfaces';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Respiration in free-living protozoans';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Types of respiration in animals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Respiratory system of insects';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Site of respiration in plants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'One-way flow of water through fish gills';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Respiratory adaptation of lungfish';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Gas exchange in annelids';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Cutaneous respiration in amphibians';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Site of gaseous exchange in the lungs';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Modes of gaseous exchange';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Stomata and gaseous exchange';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biogx01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Respiration' and q.subtopic = 'Fish gaseous exchange';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Aquatic adaptation in mammals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Aestivation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Xerophytic Adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Xerophytes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Mesophytes and water availability';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Cactus adaptations for reducing water loss';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Physiological adaptation to dry conditions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Halophytes and saline habitats';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biowa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Aestivation as an adaptation to dry conditions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biodv01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Vectors of infectious disease';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biodv01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Malaria vector';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biodv01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Disease vectors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biodv01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Mosquito as a disease vector';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Species distribution and rainfall';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Measurement of atmospheric pressure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Measurement of abiotic factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Limiting factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Abiotic factors and vegetation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Section C: Ecology';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Aquatic habitats';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Diurnal activity in animals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Adaptation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Gregarious behaviour';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Arboreal organisms';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Light as a limiting factor in aquatic ecosystems';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Environmental factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Relative humidity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Biotic and abiotic factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Behavioural adaptations for predator avoidance';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Major ecological factors in terrestrial habitats';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Intertidal environmental stress';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Terrestrial versus aquatic abiotic factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Edaphic factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Biotic factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Light as a limiting factor for phytoplankton';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Ecological factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Terrestrial Habitats';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Optimum temperature for organismal growth';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Abiotic Factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Limiting factors in aquatic habitats';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Protective and deceptive colouration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Vegetation zones and temperature adaptation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Factors affecting the distribution of organisms' and q.subtopic = 'Marine habitat organisms';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Parasitism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Host of Taenia solium';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopa01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Hosts in the life cycle of liver fluke';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biomu01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Mutualism between legumes and nitrogen-fixing bacteria';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biomu01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Mutualism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biomu01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Mutualistic symbiosis in termites';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biomu01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Mutualism in the rumen';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biomu01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Mycorrhizal associations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioco01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Commensalism';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioco01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Commensalism in epiphytes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('g2zzeu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Symbiotic relationships';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('g2zzeu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Symbiotic Relationships';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('g2zzeu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Symbiotic nutrition';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('g2zzeu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Symbiotic interactions of plants and animals' and q.subtopic = 'Social behaviour and symbiosis';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Structure of the ear';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Vestibular system and balance';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Skin structure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Cataract';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Correction of long-sightedness';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Hearing and the cochlea';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Sensory organs';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biose01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Accommodation of the eye';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Irritability as a characteristic of living organisms';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Thermotaxis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Taxis and phototaxis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('ejssyk'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Xerophytic adaptations for water conservation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Homeostasis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Temperature regulation and homeostasis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Ectothermy and body temperature regulation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5s4xw2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Co-ordination and control' and q.subtopic = 'Nervous vs endocrine system';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Animal behaviour';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Insect mouthparts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Social insects';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Social Insects';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Social insects: termites';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Proboscis as an insect feeding structure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Life cycles of insects';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Arthropod life cycles and larval damage';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Life cycles and economic importance';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Arthropod anatomy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Colonial organization in microorganisms';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Branches and scope of biology';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioib01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Economic importance of insects';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Scolex function in tapeworm';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Taenia solium intermediate host';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Tapeworm transmission';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Trypanosomiasis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Bacterial causative agent of syphilis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Exo-erythrocytic phase of malaria parasite';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopl01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Parasitic protozoans';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Adaptations for transition from aquatic to terrestrial life';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Adaptations of primates';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Animal adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Aquatic adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Bird adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Characteristics of invertebrates';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Chromatophores and colour change in chameleons';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Defence adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Insect mouthpart adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Reptilian adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioag01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evolution among organisms' and q.subtopic = 'Plant storage organs';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('v21gyu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Sebaceous glands and hair protection';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('v21gyu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Skin and temperature regulation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('v21gyu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Skin structure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('v21gyu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Water conservation adaptations in animals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioep01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Excretion in plants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioep01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Excretion through stomata and lenticels';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bioep01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Excretory products of plants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('6hg1ye'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Excretion' and q.subtopic = 'Schistosomiasis and urinary symptoms';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Germination types';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Types of germination';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Functions of cotyledons';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Organs of perennation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biosg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Seed germination requirements';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Conditions for Growth';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Growth pattern in plants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Plant growth-promoting hormones';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Anabolism and growth';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Cellular basis of growth';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biopg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Growth as a characteristic of living organisms';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('7s7ee2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Growth' and q.subtopic = 'Chromosome separation during meiosis';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biovh01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Advantages of outbreeding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biovh01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Environmental influence on traits';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biovh01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Inherited and non-inherited conditions';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biovh01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Sex-linked traits';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biovh01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Types of variation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biovh01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Variation and adaptation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('jfr7l8'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Heredity' and q.subtopic = 'Crossing over';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('1bs5gw'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Carbon Cycle';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('1bs5gw'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Carbon cycle and removal of atmospheric carbon dioxide';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('l2srza'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Genetically modified organisms';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('gqgl8a'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Health hazards';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('1bs5gw'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Nitrogen fixation by lightning';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('1bs5gw'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Ozone layer depletion';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('1bs5gw'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Humans and environment' and q.subtopic = 'Ozone layer depletion by CFCs';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('d8ktqe'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Internal structure of plants and animals' and q.subtopic = 'Adaptations of aquatic plants';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('11zjwa'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Internal structure of plants and animals' and q.subtopic = 'Digestive system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('11zjwa'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Internal structure of plants and animals' and q.subtopic = 'Digestive system anatomy';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('11zjwa'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Internal structure of plants and animals' and q.subtopic = 'Fish respiratory structures';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('vdv7wi'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Cell types';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('n0zfgu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Chromatophores and animal colouration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('n0zfgu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Insect mouthparts';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('n0zfgu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Interferon and antiviral defense';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('n0zfgu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Living and non-living characteristics of viruses';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('rxqnsq'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Mitochondrial energy production';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('vdv7wi'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Role of cytokinesis in mitosis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('n0zfgu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Living organisms' and q.subtopic = 'Viruses';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Biomes';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('7iiwze'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Savanna adaptations';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Climate data interpretation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Climatic factors';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Desert biome characteristics';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Measurement of relative humidity';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('7iiwze'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Savanna vegetation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Tropical rainforest';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('7iiwze'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Savanna zones and crop distribution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('od96ma'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Local (Nigerian) biomes' and q.subtopic = 'Biome characteristics';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biofd01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Bird beak and feeding adaptation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biofd01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Beak adaptations for feeding';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biofd01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Carnassial teeth';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biofd01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Dentition in mammals';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biofd01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Feeding adaptations of bird beaks';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('a4vveu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Chemosynthetic nutrition';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('a4vveu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Heterotrophic nutrition in fungi';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('a4vveu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Modes of nutrition';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('js933a'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Endospermous seeds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('js933a'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Functions of xylem';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('js933a'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Nitrogen fixation by blue-green algae';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('gwtgv8'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Nutrition' and q.subtopic = 'Producers and energy conversion';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biome01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Incomplete metamorphosis in insects';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biome01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Metamorphosis';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biome01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Seed germination';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('yh805s'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Male reproductive system';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('yh805s'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Male reproductive system and urethra';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('yh805s'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Mammalian characteristics';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('yh805s'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Courtship behaviour';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bx0n1i'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Monocotyledonous and dicotyledonous seeds';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('bx0n1i'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Reproduction' and q.subtopic = 'Seed structure';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('auk9y6'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Soil' and q.subtopic = 'Soil fertility and farming practices';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('auk9y6'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Soil' and q.subtopic = 'Soil types';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('auk9y6'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Soil' and q.subtopic = 'Earth''s spheres and the lithosphere';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('o0z4p2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Structural/functional and behavioural adaptations of organisms' and q.subtopic = 'Dentition';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('o0z4p2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Structural/functional and behavioural adaptations of organisms' and q.subtopic = 'Adaptations of endoparasites';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('o0z4p2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Structural/functional and behavioural adaptations of organisms' and q.subtopic = 'Beak adaptations in birds';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('ifs56m'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'The ecology of populations' and q.subtopic = 'Abiotic factors controlling population';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('ryy4ca'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'The ecology of populations' and q.subtopic = 'Adaptive significance of termite nuptial flight';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('6bb3r2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'The ecology of populations' and q.subtopic = 'Carbon cycle';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('ayrg8y'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'The ecology of populations' and q.subtopic = 'Ecological instruments';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mt25uu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Theories of evolution' and q.subtopic = 'Competition and adaptation';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mt25uu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Theories of evolution' and q.subtopic = 'Darwin''s natural selection';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('f9nl6g'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Theories of evolution' and q.subtopic = 'Definition of organic evolution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('cp3poa'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Theories of evolution' and q.subtopic = 'Evolutionary advancements';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('f9nl6g'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Theories of evolution' and q.subtopic = 'Evolutionary structures';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('mt25uu'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Theories of evolution' and q.subtopic = 'Natural selection and survival of the fittest';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('84kiku'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evidence of evolution' and q.subtopic = 'Vertebrate evolution';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('84kiku'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evidence of evolution' and q.subtopic = 'Evolutionary sequence';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('183dvq'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Evidence of evolution' and q.subtopic = 'Adaptive radiation';update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'ABO blood group compatibility';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Blood transfusion';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Agglutination of red blood cells';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Blood group incompatibility and agglutination';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Blood groups';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Rhesus blood group factor';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('biobg01'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'ABO blood group and universal recipients';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('5rv9t2'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Active transport in the kidney';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Water absorption in mosses';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Experimental design';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Factors affecting transpiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Functions of xylem and phloem';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('ejolne'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Placental exchange';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Root structure';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Stomatal control of transpiration';
update kairo.questions q
set concepts_tested = (
  select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text)))
  from jsonb_array_elements(q.concepts_tested) elem
)
where q.subject = 'Biology' and q.topic = 'Transport' and q.subtopic = 'Stomatal mechanism';do $$
declare bad_count int;
begin
  select count(*) into bad_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  where q.subject = 'Biology'
  and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
  if bad_count > 0 then
    raise exception 'bio_concept_remap: % question(s) left with a dangling conceptId', bad_count;
  end if;
end $$;
-- Follow-up fixes for 3 rows the bulk pass above missed/mis-targeted
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('84kiku'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'biology_0757';

update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('wldee2'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'biology_0833';

update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k6czgm'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'biology_0827';

commit;
