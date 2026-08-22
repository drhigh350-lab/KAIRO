-- Biology topic realignment to the official JAMB syllabus's 23 major
-- topics (5 sections: A. Variety of Organisms 1-3, B. Form and
-- Functions 4-12, C. Ecology 13-19, D. Heredity and Variations 20-21,
-- E. Evolution 22-23). Audit found 162 distinct `topic` strings across
-- 1323 Biology questions -- unlike Chemistry's pre-fix state (mostly
-- spelling variants of the same buckets), Biology's mess is three
-- different problems at once: (a) several 'mega-bucket' topics that
-- merge 2-4 official topics into one string (e.g. 'Population Ecology,
-- Biomes & Soil' spans official topics 16/17/18), (b) subtopic-level
-- strings used as the topic itself (e.g. 'Photosynthesis', 'Osmosis',
-- 'Speciation' -- each a single official topic, just needing a rename),
-- and (c) genuine naming variants. `subtopic` is already populated on
-- every Biology row (unlike Chemistry pre-fix), so no subtopic
-- migration is needed here -- only `topic`.
--
-- The 5 mega-buckets are split by keyword match against each question's
-- own `subtopic` text (same technique as the existing 'Air and Water'
-- split in 20260819023316_align_chemistry_topics_to_jamb_syllabus.sql).
-- Every other raw topic string maps 1:1 to its correct official topic.
--
-- Idempotent-safe: topic strings not present here pass through
-- unchanged (bare `topic` in the ELSE), so replaying this against an
-- environment without every historical topic string is harmless.
--
-- Verified against production: all 1323 Biology questions now map to
-- exactly the 23 official topics (was 162 distinct strings), every
-- topic has at least 1 question, row count unchanged.

begin;

-- 1. Simple 1:1 topic-string -> official-topic remap
update kairo.questions
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
where subject = 'Biology' and topic not in ('Population Ecology, Biomes & Soil', 'Evolution & Evidence of Evolution', 'Ecology — Food Chains, Food Webs & Symbiotic Relationships', 'Meiosis, Variation & Genetic Principles', 'Ecology');

-- 2. Mega-bucket splits by subtopic keyword match
update kairo.questions
set topic = case
  when subtopic ilike '%soil%' then 'Soil'
  when subtopic ilike '%lithosphere%' then 'Soil'
  when subtopic ilike '%humus%' then 'Soil'
  when subtopic ilike '%biome%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%savanna%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%rainforest%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%desert%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%vegetation%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%climat%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%humidity%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%habitat%' then 'Natural habitats'
  when subtopic ilike '%niche%' then 'Natural habitats'
  when subtopic ilike '%zonation%' then 'Natural habitats'
  when subtopic ilike '%marine ecology%' then 'Natural habitats'
  when subtopic ilike '%natural selection%' then 'Theories of evolution'
  else 'The ecology of populations'
end
where subject = 'Biology' and topic = 'Population Ecology, Biomes & Soil';

update kairo.questions
set topic = case
  when subtopic ilike '%lamarck%' then 'Theories of evolution'
  when subtopic ilike '%darwin%' then 'Theories of evolution'
  when subtopic ilike '%natural selection%' then 'Theories of evolution'
  when subtopic ilike '%acquired characteristic%' then 'Theories of evolution'
  when subtopic ilike '%struggle for existence%' then 'Theories of evolution'
  when subtopic ilike '%theories of evolution%' then 'Theories of evolution'
  when subtopic ilike '%organic evolution%' then 'Theories of evolution'
  when subtopic ilike '%evolutionary trend%' then 'Theories of evolution'
  when subtopic ilike '%evolutionary advancement%' then 'Theories of evolution'
  when subtopic ilike '%evidence%' then 'Evidence of evolution'
  when subtopic ilike '%vestigial%' then 'Evidence of evolution'
  when subtopic ilike '%homologous%' then 'Evidence of evolution'
  when subtopic ilike '%fossil%' then 'Evidence of evolution'
  when subtopic ilike '%common ancestry%' then 'Evidence of evolution'
  when subtopic ilike '%convergent%' then 'Evidence of evolution'
  when subtopic ilike '%adaptive radiation%' then 'Evidence of evolution'
  when subtopic ilike '%vertebrate evolution%' then 'Evidence of evolution'
  when subtopic ilike '%evolutionary sequence%' then 'Evidence of evolution'
  when subtopic ilike '%evolution of terrestrial%' then 'Evidence of evolution'
  when subtopic ilike '%birds and reptiles%' then 'Evidence of evolution'
  when subtopic ilike '%habitat%' then 'Natural habitats'
  else 'Structural/functional and behavioural adaptations of organisms'
end
where subject = 'Biology' and topic = 'Evolution & Evidence of Evolution';

update kairo.questions
set topic = case
  when subtopic ilike '%symbio%' then 'Symbiotic interactions of plants and animals'
  when subtopic ilike '%mutualis%' then 'Symbiotic interactions of plants and animals'
  when subtopic ilike '%parasit%' then 'Symbiotic interactions of plants and animals'
  when subtopic ilike '%commensal%' then 'Symbiotic interactions of plants and animals'
  when subtopic ilike '%mycorrhiz%' then 'Symbiotic interactions of plants and animals'
  when subtopic ilike '%host%' then 'Symbiotic interactions of plants and animals'
  when subtopic ilike '%habitat%' then 'Natural habitats'
  else 'The ecology of populations'
end
where subject = 'Biology' and topic = 'Ecology — Food Chains, Food Webs & Symbiotic Relationships';

update kairo.questions
set topic = case
  when subtopic ilike '%variation%' then 'Variation in population'
  when subtopic ilike '%frequency distribution%' then 'Variation in population'
  when subtopic ilike '%fingerprint%' then 'Variation in population'
  else 'Growth'
end
where subject = 'Biology' and topic = 'Meiosis, Variation & Genetic Principles';

update kairo.questions
set topic = case
  when subtopic ilike '%savanna%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%rainforest%' then 'Local (Nigerian) biomes'
  when subtopic ilike '%habitat%' then 'Natural habitats'
  else 'The ecology of populations'
end
where subject = 'Biology' and topic = 'Ecology';

-- 3. DB-level guard, matching the Chemistry precedent
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'questions_biology_topic_syllabus_check'
  ) then
    alter table kairo.questions add constraint questions_biology_topic_syllabus_check
    check (
      subject <> 'Biology' or topic = any (array[
        'Living organisms',
        'Evolution among organisms',
        'Structural/functional and behavioural adaptations of organisms',
        'Internal structure of plants and animals',
        'Nutrition',
        'Transport',
        'Respiration',
        'Excretion',
        'Support and movement',
        'Reproduction',
        'Growth',
        'Co-ordination and control',
        'Factors affecting the distribution of organisms',
        'Symbiotic interactions of plants and animals',
        'Natural habitats',
        'Local (Nigerian) biomes',
        'The ecology of populations',
        'Soil',
        'Humans and environment',
        'Variation in population',
        'Heredity',
        'Theories of evolution',
        'Evidence of evolution'
      ]::text[])
    );
  end if;
end $$;

commit;
