-- align_chemistry_topics_to_jamb_syllabus.sql fixed kairo.questions.topic
-- but missed kairo.concepts.topic entirely -- and the app's topic picker
-- (kairo-app TopicSelect.tsx -> getRealTopics()) reads from the engine's
-- in-memory ConceptNode graph, populated from kairo.concepts via
-- loadContentCatalog(), not from kairo.questions directly. So the live
-- site kept showing all 79 pre-realignment topic strings for Chemistry
-- even after the questions table was fixed. Same remap, applied here.
--
-- concepts.id is untouched (it's the join target for questions.
-- concepts_tested[].conceptId and several FKs) -- only the display-level
-- topic string changes, so no relinking is needed. Two topic values that
-- covered content split across two syllabus majors ('Air and Water',
-- 'Water and Solutions') are resolved per concept by name/subtopic,
-- mirroring the equivalent step in the questions migration.
--
-- Idempotent-safe: topic strings not present here pass through unchanged.

update kairo.concepts
set topic = case topic
    when 'Acids' then 'Acids, bases and salts'
    when 'Acids, Bases & Salts' then 'Acids, bases and salts'
    when 'Acids, Bases and Salts' then 'Acids, bases and salts'
    when 'Air' then 'Air'
    when 'Air and Atmosphere' then 'Air'
    when 'Alkali and Alkaline Earth Metals' then 'Metals and their compounds'
    when 'Alloys' then 'Metals and their compounds'
    when 'Applied Chemistry' then 'Chemistry and Industry'
    when 'Atomic Structure' then 'Atomic structure and bonding'
    when 'Atomic Structure & Bonding' then 'Atomic structure and bonding'
    when 'Atomic Structure and Bonding' then 'Atomic structure and bonding'
    when 'Carbon and its Compounds' then 'Non-metals and their compounds'
    when 'Chemical Bonding' then 'Atomic structure and bonding'
    when 'Chemical Combination' then 'Chemical combination'
    when 'Chemical Combinations' then 'Chemical combination'
    when 'Chemical Equilibrium' then 'Chemical equilibria'
    when 'Chemical Kinetics' then 'Rates of Chemical Reaction'
    when 'Chemical Thermodynamics' then 'Energy changes'
    when 'Chemistry & Industry' then 'Chemistry and Industry'
    when 'Chemistry in Everyday Life' then 'Chemistry and Industry'
    when 'Chemistry in Industry' then 'Chemistry and Industry'
    when 'Corrosion' then 'Metals and their compounds'
    when 'Electrochemistry' then 'Electrolysis'
    when 'Electronic Configuration' then 'Atomic structure and bonding'
    when 'Elements and Their Uses' then 'Chemistry and Industry'
    when 'Energy Changes' then 'Energy changes'
    when 'Environmental Chemistry' then 'Environmental Pollution'
    when 'Gas Laws' then 'Kinetic theory of matter and Gas Laws'
    when 'Halogens' then 'Non-metals and their compounds'
    when 'Halogens and their Compounds' then 'Non-metals and their compounds'
    when 'Hydrogen and its Compounds' then 'Non-metals and their compounds'
    when 'Kinetic Theory & Gas Laws' then 'Kinetic theory of matter and Gas Laws'
    when 'Kinetic Theory of Gases' then 'Kinetic theory of matter and Gas Laws'
    when 'Metals & Their Compounds' then 'Metals and their compounds'
    when 'Metals and their Compounds' then 'Metals and their compounds'
    when 'Metals and Their Compounds' then 'Metals and their compounds'
    when 'Mixtures and Separation Techniques' then 'Separation of mixtures and purification of chemical substances'
    when 'Nature of Matter' then 'Kinetic theory of matter and Gas Laws'
    when 'Nitrogen and its Compounds' then 'Non-metals and their compounds'
    when 'Noble Gases' then 'Non-metals and their compounds'
    when 'Non-Metals & Their Compounds' then 'Non-metals and their compounds'
    when 'Non-metals and their Compounds' then 'Non-metals and their compounds'
    when 'Non-Metals and Their Compounds' then 'Non-metals and their compounds'
    when 'Nuclear Chemistry' then 'Atomic structure and bonding'
    when 'Organic Acids' then 'Organic Compounds'
    when 'Organic Chemistry' then 'Organic Compounds'
    when 'Organic Reaction Mechanisms' then 'Organic Compounds'
    when 'Oxidation & Reduction' then 'Oxidation and reduction'
    when 'Oxidation and Reduction' then 'Oxidation and reduction'
    when 'Oxygen and its Compounds' then 'Non-metals and their compounds'
    when 'Particulate Nature of Matter' then 'Kinetic theory of matter and Gas Laws'
    when 'Periodic Table' then 'Atomic structure and bonding'
    when 'Petrochemicals' then 'Chemistry and Industry'
    when 'Petroleum Chemistry' then 'Chemistry and Industry'
    when 'Physical and Chemical Changes' then 'Kinetic theory of matter and Gas Laws'
    when 'Properties of Substances' then 'Water'
    when 'Qualitative Analysis' then 'Acids, bases and salts'
    when 'Quantitative Analysis' then 'Acids, bases and salts'
    when 'Quantitative Chemistry' then 'Chemical combination'
    when 'Rates of Chemical Reaction' then 'Rates of Chemical Reaction'
    when 'Rates of Reaction' then 'Rates of Chemical Reaction'
    when 'Reactions of Metal Oxides' then 'Metals and their compounds'
    when 'Reactivity Series' then 'Metals and their compounds'
    when 'Separation of Mixtures' then 'Separation of mixtures and purification of chemical substances'
    when 'Separation Techniques' then 'Separation of mixtures and purification of chemical substances'
    when 'Solubility' then 'Solubility'
    when 'Solutions' then 'Solubility'
    when 'Solutions and Solubility' then 'Solubility'
    when 'States of Matter' then 'Kinetic theory of matter and Gas Laws'
    when 'Stoichiometry' then 'Chemical combination'
    when 'Stoichiometry and Chemical Reactions' then 'Chemical combination'
    when 'Thermochemistry' then 'Energy changes'
    when 'Thermodynamics' then 'Energy changes'
    when 'Water' then 'Water'
    when 'Water Chemistry' then 'Water'
    else topic
  end
where subject = 'Chemistry' and topic not in ('Air and Water', 'Water and Solutions');

-- 'Air and Water' concepts, resolved individually (only 4 rows, checked
-- by name/subtopic directly rather than a generic rule):
--   fch4i1 "Dissolved Gases in Drinks"            -> Water
--   oin8lb "Air and Water" (generic, no subtopic) -> Water
--   beypy2 "Water Treatment and Hardness"         -> Water
--   txr2h3 "Oxygen Content of Air"                -> Air
update kairo.concepts set topic = 'Air' where id = 'txr2h3';
update kairo.concepts set topic = 'Water' where id in ('fch4i1', 'oin8lb', 'beypy2');

-- 'Water and Solutions' concept (icgutb, generic, no subtopic) -> Water,
-- matching the majority precedent from the equivalent questions split.
update kairo.concepts set topic = 'Water' where id = 'icgutb';

-- Lock it down at the DB level, matching questions_chemistry_topic_
-- syllabus_check. Guarded: already added directly against the live
-- TechMed-Daily project as `enforce_chemistry_concepts_topic_syllabus`
-- before this file existed.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'concepts_chemistry_topic_syllabus_check'
  ) then
    alter table kairo.concepts add constraint concepts_chemistry_topic_syllabus_check
    check (
      subject <> 'Chemistry' or topic = any (array[
        'Separation of mixtures and purification of chemical substances',
        'Chemical combination',
        'Kinetic theory of matter and Gas Laws',
        'Atomic structure and bonding',
        'Air',
        'Water',
        'Solubility',
        'Environmental Pollution',
        'Acids, bases and salts',
        'Oxidation and reduction',
        'Electrolysis',
        'Energy changes',
        'Rates of Chemical Reaction',
        'Chemical equilibria',
        'Non-metals and their compounds',
        'Metals and their compounds',
        'Organic Compounds',
        'Chemistry and Industry'
      ]::text[])
    );
  end if;
end $$;
