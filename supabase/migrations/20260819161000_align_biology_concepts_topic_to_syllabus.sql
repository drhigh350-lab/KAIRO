-- align_biology_topics_to_jamb_syllabus.sql fixed kairo.questions.topic but
-- missed kairo.concepts.topic entirely -- same gap as Chemistry's equivalent
-- fix (20260819031042_align_chemistry_concepts_topic_to_syllabus.sql): the
-- app's topic picker reads from the engine's in-memory ConceptNode graph,
-- populated from kairo.concepts via loadContentCatalog(), not from
-- kairo.questions directly. Same remap, applied here.
--
-- Unlike Chemistry, none of Biology's 5 "mega-bucket" question-topic
-- strings (e.g. 'Population Ecology, Biomes & Soil') appear as a concept's
-- own topic value, so no subtopic-based splitting is needed for this
-- table -- a straight 1:1 remap covers all 94 Biology concepts.
--
-- Verified against production: concepts.topic collapsed from 94 distinct
-- strings to 21 of the 23 official topics (2 topics -- "Support and
-- movement" and "Natural habitats" -- have no dedicated concept yet;
-- questions in those topics currently link to a concept homed in an
-- adjacent topic, e.g. "Animal Anatomy"). question<->concept topic
-- mismatches dropped from 1148 to 266, all attributable to this
-- coarser-than-23-topics concept set (a handful of concepts like
-- "Adaptations" are reused across multiple official topics) rather than
-- any remaining bad data -- flagged as follow-on concept-level work,
-- same shape as the Chemistry concept remap.

begin;

update kairo.concepts
set topic = case topic
  when 'Evolution Among Organisms — Classification & Variety of Organisms' then 'Evolution among organisms'
  when 'Reproduction in Plants & Mammals' then 'Reproduction'
  when 'Heredity & Genetics — Mendelian Inheritance & Sex-Linkage' then 'Heredity'
  when 'Nutrition in Plants & Animals' then 'Nutrition'
  when 'Transport Systems in Plants & Animals' then 'Transport'
  when 'Living Organisms — Cell Structure & Organization' then 'Living organisms'
  when 'Excretion & Osmoregulation' then 'Excretion'
  when 'Support & Movement in Plants and Animals' then 'Support and movement'
  when 'Factors Affecting Distribution of Organisms' then 'Factors affecting the distribution of organisms'
  when 'Human Impact on the Environment' then 'Humans and environment'
  when 'Co-ordination & Control — Nervous System' then 'Co-ordination and control'
  when 'Respiration & Gaseous Exchange' then 'Respiration'
  when 'Digestive Systems & Enzymes' then 'Nutrition'
  when 'Internal Structure of Flowering Plants & Mammals' then 'Internal structure of plants and animals'
  when 'Endocrine System & Hormonal Control' then 'Co-ordination and control'
  when 'Diffusion, Osmosis & Active Transport' then 'Transport'
  when 'Reproduction' then 'Reproduction'
  when 'Respiration' then 'Respiration'
  when 'Evidence for Evolution' then 'Evidence of evolution'
  when 'Plant Tropisms' then 'Co-ordination and control'
  when 'Excretion' then 'Excretion'
  when 'Nutrition' then 'Nutrition'
  when 'Variation' then 'Variation in population'
  when 'Adaptations' then 'Structural/functional and behavioural adaptations of organisms'
  when 'Evolution' then 'Theories of evolution'
  when 'Digestion' then 'Nutrition'
  when 'Classification - Plants' then 'Evolution among organisms'
  when 'Health and Disease' then 'Humans and environment'
  when 'Mendelian Genetics' then 'Heredity'
  when 'Photosynthesis' then 'Nutrition'
  when 'Plant Reproduction' then 'Reproduction'
  when 'Plant Transport' then 'Transport'
  when 'Cell Organelles' then 'Living organisms'
  when 'Genetic Disorders' then 'Heredity'
  when 'Plant Physiology' then 'Co-ordination and control'
  when 'Levels of Organisation' then 'Living organisms'
  when 'Genetics' then 'Heredity'
  when 'Transport in Plants' then 'Transport'
  when 'Population Ecology' then 'The ecology of populations'
  when 'Classification of Living Organisms' then 'Evolution among organisms'
  when 'Coordination and Response' then 'Co-ordination and control'
  when 'Plant Anatomy' then 'Internal structure of plants and animals'
  when 'Disease Vectors' then 'Humans and environment'
  when 'Natural Selection' then 'Theories of evolution'
  when 'Circulation' then 'Transport'
  when 'Soil Science' then 'Soil'
  when 'Classification - Animals' then 'Evolution among organisms'
  when 'Circulatory System' then 'Transport'
  when 'Symbiotic Relationships' then 'Symbiotic interactions of plants and animals'
  when 'Animal Adaptation' then 'Structural/functional and behavioural adaptations of organisms'
  when 'Speciation' then 'Theories of evolution'
  when 'Succession' then 'The ecology of populations'
  when 'Theories of Evolution' then 'Theories of evolution'
  when 'Growth — Cell Division & Development' then 'Growth'
  when 'Genetics Terminology' then 'Heredity'
  when 'Genetic Engineering' then 'Heredity'
  when 'Nitrogen Cycle' then 'The ecology of populations'
  when 'Nervous System' then 'Co-ordination and control'
  when 'Cell Structure' then 'Living organisms'
  when 'Cell Structure and Organization' then 'Living organisms'
  when 'Blood' then 'Transport'
  when 'Agricultural Genetics' then 'Heredity'
  when 'Pollution' then 'Humans and environment'
  when 'Ecology — Nutrient Cycles' then 'The ecology of populations'
  when 'Mechanisms of Evolution' then 'Theories of evolution'
  when 'Cell Division — Mitosis & Meiosis' then 'Growth'
  when 'Environmental Issues' then 'Humans and environment'
  when 'Living Organisms' then 'Living organisms'
  when 'Classification - Fungi' then 'Evolution among organisms'
  when 'Ecology — Conservation' then 'Humans and environment'
  when 'Conservation' then 'Humans and environment'
  when 'Human Anatomy' then 'Internal structure of plants and animals'
  when 'Hormones' then 'Co-ordination and control'
  when 'Homeostasis' then 'Excretion'
  when 'Biomes' then 'Local (Nigerian) biomes'
  when 'Sex-Linked Inheritance' then 'Heredity'
  when 'Blood Group Genetics' then 'Heredity'
  when 'Water Cycle' then 'The ecology of populations'
  when 'Adaptive Radiation' then 'Theories of evolution'
  when 'Agriculture' then 'Humans and environment'
  when 'Animal Anatomy' then 'Internal structure of plants and animals'
  when 'Biomes - Nigeria' then 'Local (Nigerian) biomes'
  when 'Biotechnology' then 'Heredity'
  when 'Blood Groups' then 'Heredity'
  when 'Carbon Cycle' then 'The ecology of populations'
  when 'Cell Biology' then 'Living organisms'
  when 'Cell Division' then 'Growth'
  when 'Characteristics of Living Things' then 'Living organisms'
  when 'Chromosomal Disorders' then 'Heredity'
  when 'Classification' then 'Evolution among organisms'
  when 'Classification - Birds' then 'Evolution among organisms'
  when 'Classification - Chordates' then 'Evolution among organisms'
  when 'Classification - Fish' then 'Evolution among organisms'
  when 'Classification - Mammals' then 'Evolution among organisms'
  when 'Classification - Monera' then 'Evolution among organisms'
  when 'Classification - Protista' then 'Evolution among organisms'
  when 'Classification - Vertebrates' then 'Evolution among organisms'
  when 'Classification — Arthropoda' then 'Evolution among organisms'
  when 'Convergent Evolution' then 'Evidence of evolution'
  when 'Coordination — Hormones' then 'Co-ordination and control'
  when 'Coordination — Sense Organs' then 'Co-ordination and control'
  when 'Decomposers' then 'The ecology of populations'
  when 'Disease Control' then 'Humans and environment'
  when 'Ecological Concepts' then 'The ecology of populations'
  when 'Ecological Tools' then 'The ecology of populations'
  when 'Ecology — Abiotic Factors' then 'Factors affecting the distribution of organisms'
  when 'Ecology — Distribution of Organisms' then 'Factors affecting the distribution of organisms'
  when 'Ecology — Habitat and Niche' then 'Natural habitats'
  when 'Ecology — Pollution' then 'Humans and environment'
  when 'Ecology — Population Dynamics' then 'The ecology of populations'
  when 'Ecology — Population Ecology' then 'The ecology of populations'
  when 'Ecology — Soil' then 'Soil'
  when 'Economic Importance' then 'Humans and environment'
  when 'Economic Importance of Organisms' then 'Humans and environment'
  when 'Energy Flow' then 'The ecology of populations'
  when 'Evolution Concepts' then 'Theories of evolution'
  when 'Food Chains' then 'The ecology of populations'
  when 'Food Tests' then 'Nutrition'
  when 'Food Webs' then 'The ecology of populations'
  when 'Genetic Variation' then 'Variation in population'
  when 'Genetics — Chromosomal Disorders' then 'Heredity'
  when 'Genetics — Monohybrid Inheritance' then 'Heredity'
  when 'Genetics — Sex Linkage' then 'Heredity'
  when 'Genetics — Variation' then 'Variation in population'
  when 'Health and Diseases' then 'Humans and environment'
  when 'Health Organizations' then 'Humans and environment'
  when 'Heredity' then 'Heredity'
  when 'History of Evolution' then 'Theories of evolution'
  when 'History of Genetics' then 'Heredity'
  when 'Insect Behaviour' then 'Structural/functional and behavioural adaptations of organisms'
  when 'Kingdom Fungi' then 'Evolution among organisms'
  when 'Life Cycles' then 'Growth'
  when 'Living Organisms — Levels of Organization' then 'Living organisms'
  when 'Living Organisms — Support and Movement' then 'Support and movement'
  when 'Modern Evolutionary Theory' then 'Theories of evolution'
  when 'Molecular Genetics' then 'Heredity'
  when 'Natural Resources' then 'Humans and environment'
  when 'Nutrition — Digestion' then 'Nutrition'
  when 'Osmosis' then 'Transport'
  when 'Plant Hormones' then 'Co-ordination and control'
  when 'Plant Nutrition' then 'Nutrition'
  when 'Plant Support' then 'Support and movement'
  when 'Population Interactions' then 'The ecology of populations'
  when 'Reproduction — Development' then 'Reproduction'
  when 'Reproduction — Human Reproduction' then 'Reproduction'
  when 'Reproduction — Plant Development' then 'Reproduction'
  when 'Reproduction — Plant Reproduction' then 'Reproduction'
  when 'Reproduction — Viviparity' then 'Reproduction'
  when 'Reproductive Technology' then 'Heredity'
  when 'Respiration — Gas Exchange' then 'Respiration'
  when 'Sewage Treatment' then 'Humans and environment'
  when 'Sex Determination' then 'Heredity'
  when 'Soil' then 'Soil'
  when 'Soil Conservation' then 'Soil'
  when 'Support and Movement' then 'Support and movement'
  when 'Abiotic Factors' then 'Factors affecting the distribution of organisms'
  when 'Germination & Growth' then 'Growth'
  else topic
end
where subject = 'Biology';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'concepts_biology_topic_syllabus_check'
  ) then
    alter table kairo.concepts add constraint concepts_biology_topic_syllabus_check
    check (
      subject <> 'Biology' or topic = any (array[
        'Living organisms','Evolution among organisms',
        'Structural/functional and behavioural adaptations of organisms',
        'Internal structure of plants and animals','Nutrition','Transport',
        'Respiration','Excretion','Support and movement','Reproduction','Growth',
        'Co-ordination and control','Factors affecting the distribution of organisms',
        'Symbiotic interactions of plants and animals','Natural habitats',
        'Local (Nigerian) biomes','The ecology of populations','Soil',
        'Humans and environment','Variation in population','Heredity',
        'Theories of evolution','Evidence of evolution'
      ]::text[])
    );
  end if;
end $$;

commit;
