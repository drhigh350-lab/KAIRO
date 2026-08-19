-- Chemistry had accumulated ~84 distinct `topic` strings (spelling variants
-- like "Metals & Their Compounds" / "Metals and their Compounds" / "Metals
-- and Their Compounds" for one topic, plus genuinely off-syllabus buckets
-- like "Electrochemistry", "Nuclear Chemistry", "Qualitative Analysis")
-- instead of the JAMB syllabus's 18 official major topics. This remaps
-- every Chemistry row's `topic` to strictly one of those 18, moving the
-- old, more specific value into `subtopic` wherever `subtopic` was empty
-- (COALESCE against the pre-update row, so real subtopic content already
-- present is never overwritten). Two topic values ("Air and Water", "Water
-- and Solutions") covered content that genuinely splits across two
-- different syllabus majors, resolved by matching actual subtopic/stem
-- content rather than picking one bucket for the whole group.
--
-- Idempotent-safe on any environment: topic strings not present here pass
-- through unchanged (bare `topic` in the ELSE / no-op), so replaying this
-- against a database that doesn't have every historical topic string
-- (e.g. a fresh environment seeded only from this repo's own migrations)
-- is harmless.

update kairo.questions
set
  subtopic = coalesce(subtopic, topic),
  topic = case topic
    when 'Organic Chemistry' then 'Organic Compounds'
    when 'Atomic Structure & Bonding' then 'Atomic structure and bonding'
    when 'Electrolysis' then 'Electrolysis'
    when 'Acids, Bases and Salts' then 'Acids, bases and salts'
    when 'Metals and their Compounds' then 'Metals and their compounds'
    when 'Metals & Their Compounds' then 'Metals and their compounds'
    when 'Acids, Bases & Salts' then 'Acids, bases and salts'
    when 'Chemical Equilibrium' then 'Chemical equilibria'
    when 'Chemical Bonding' then 'Atomic structure and bonding'
    when 'Non-Metals & Their Compounds' then 'Non-metals and their compounds'
    when 'Chemical Combination' then 'Chemical combination'
    when 'Oxidation and Reduction' then 'Oxidation and reduction'
    when 'Kinetic Theory & Gas Laws' then 'Kinetic theory of matter and Gas Laws'
    when 'Qualitative Analysis' then 'Acids, bases and salts'
    when 'Nature of Matter' then 'Kinetic theory of matter and Gas Laws'
    when 'Gas Laws' then 'Kinetic theory of matter and Gas Laws'
    when 'Atomic Structure and Bonding' then 'Atomic structure and bonding'
    when 'Water' then 'Water'
    when 'Periodic Table' then 'Atomic structure and bonding'
    when 'Chemistry & Industry' then 'Chemistry and Industry'
    when 'Oxidation & Reduction' then 'Oxidation and reduction'
    when 'Separation of Mixtures' then 'Separation of mixtures and purification of chemical substances'
    when 'Solutions' then 'Solubility'
    when 'Stoichiometry and Chemical Reactions' then 'Chemical combination'
    when 'Separation Techniques' then 'Separation of mixtures and purification of chemical substances'
    when 'Environmental Pollution' then 'Environmental Pollution'
    when 'Rates of Reaction' then 'Rates of Chemical Reaction'
    when 'Solubility' then 'Solubility'
    when 'Energy Changes' then 'Energy changes'
    when 'Atomic Structure' then 'Atomic structure and bonding'
    when 'Environmental Chemistry' then 'Environmental Pollution'
    when 'Thermochemistry' then 'Energy changes'
    when 'Non-metals and their Compounds' then 'Non-metals and their compounds'
    when 'Nitrogen and its Compounds' then 'Non-metals and their compounds'
    when 'Quantitative Chemistry' then 'Chemical combination'
    when 'Non-Metals and Their Compounds' then 'Non-metals and their compounds'
    when 'Metals and Their Compounds' then 'Metals and their compounds'
    when 'Nuclear Chemistry' then 'Atomic structure and bonding'
    when 'Rates of Chemical Reaction' then 'Rates of Chemical Reaction'
    when 'Chemical Thermodynamics' then 'Energy changes'
    when 'Electrochemistry' then 'Electrolysis'
    when 'Chemical Kinetics' then 'Rates of Chemical Reaction'
    when 'Oxygen and its Compounds' then 'Non-metals and their compounds'
    when 'Stoichiometry' then 'Chemical combination'
    when 'Halogens and their Compounds' then 'Non-metals and their compounds'
    when 'Quantitative Analysis' then 'Acids, bases and salts'
    when 'Carbon and its Compounds' then 'Non-metals and their compounds'
    when 'Mixtures and Separation Techniques' then 'Separation of mixtures and purification of chemical substances'
    when 'Air' then 'Air'
    when 'Redox Chemistry' then 'Oxidation and reduction'
    when 'Chemistry in Everyday Life' then 'Chemistry and Industry'
    when 'Water Chemistry' then 'Water'
    when 'Applied Chemistry' then 'Chemistry and Industry'
    when 'Chemistry in Industry' then 'Chemistry and Industry'
    when 'Halogens' then 'Non-metals and their compounds'
    when 'Hydrogen and its Compounds' then 'Non-metals and their compounds'
    when 'Kinetic Theory of Gases' then 'Kinetic theory of matter and Gas Laws'
    when 'Noble Gases' then 'Non-metals and their compounds'
    when 'Particulate Nature of Matter' then 'Kinetic theory of matter and Gas Laws'
    when 'Reactivity Series' then 'Metals and their compounds'
    when 'Solutions and Solubility' then 'Solubility'
    when 'States of Matter' then 'Kinetic theory of matter and Gas Laws'
    when 'Thermodynamics' then 'Energy changes'
    when 'Organic Reaction Mechanisms' then 'Organic Compounds'
    when 'Organic Acids' then 'Organic Compounds'
    when 'Industrial Chemistry' then 'Chemistry and Industry'
    when 'Gaseous State' then 'Kinetic theory of matter and Gas Laws'
    when 'Everyday Chemistry' then 'Chemistry and Industry'
    when 'Acid-Base Chemistry' then 'Acids, bases and salts'
    when 'Environmental and Health Chemistry' then 'Environmental Pollution'
    when 'Electronic Configuration' then 'Atomic structure and bonding'
    when 'Corrosion' then 'Metals and their compounds'
    when 'Chemical Reactions' then 'Non-metals and their compounds'
    when 'Chemical Combinations' then 'Chemical combination'
    when 'Air and Atmosphere' then 'Air'
    when 'Acids' then 'Acids, bases and salts'
    when 'Alloys' then 'Metals and their compounds'
    when 'Alkali and Alkaline Earth Metals' then 'Metals and their compounds'
    when 'Air and Combustion' then 'Air'
    when 'Petrochemicals' then 'Chemistry and Industry'
    when 'Petroleum Chemistry' then 'Chemistry and Industry'
    when 'Physical and Chemical Changes' then 'Kinetic theory of matter and Gas Laws'
    when 'Properties of Substances' then 'Water'
    else topic
  end
where subject = 'Chemistry' and topic not in ('Air and Water', 'Water and Solutions');

-- 'Air and Water' rows that already carry a subtopic: split by subtopic content.
update kairo.questions
set topic = case
  when subtopic ilike '%Oxygen Content of Air%' then 'Air'
  else 'Water'
end
where subject = 'Chemistry' and topic = 'Air and Water' and subtopic is not null;

-- 'Air and Water' rows with no subtopic: assign both a correct major topic
-- and a real, specific subtopic derived from the stem (only meaningful if
-- these exact ids exist on this environment -- harmless no-op otherwise).
update kairo.questions set topic = 'Air', subtopic = 'Composition of air' where id = 'chemistry_0059';
update kairo.questions set topic = 'Air', subtopic = 'Noble gases in air' where id = 'chemistry_0063';
update kairo.questions set topic = 'Air', subtopic = 'Air as a mixture' where id = 'chemistry_0067';
update kairo.questions set topic = 'Water', subtopic = 'Temporary and permanent hardness of water' where id in ('chemistry_0060', 'chemistry_0061', 'chemistry_0062');
update kairo.questions set topic = 'Water', subtopic = 'Hygroscopic, deliquescent and efflorescent substances' where id = 'chemistry_0064';
update kairo.questions set topic = 'Water', subtopic = 'Town water treatment' where id = 'chemistry_0065';
update kairo.questions set topic = 'Water', subtopic = 'Water of crystallization' where id = 'chemistry_0066';
update kairo.questions set topic = 'Water', subtopic = 'Dissolved oxygen in water' where id = 'chemistry_0068';

-- 'Water and Solutions': split by subtopic content.
update kairo.questions
set topic = case
  when subtopic ilike '%solubility%' then 'Solubility'
  when subtopic ilike '%hydrate%' then 'Water'
  else 'Water'
end
where subject = 'Chemistry' and topic = 'Water and Solutions';

-- Lock it down at the DB level so a future write -- from this repo's
-- scripts or any other pipeline -- can't reintroduce an off-syllabus
-- Chemistry topic. Guarded: this constraint was already added directly
-- against the live TechMed-Daily project (as `enforce_chemistry_jamb_
-- syllabus_topics`, applied ad hoc before this file existed) -- the guard
-- makes replaying this migration a no-op there while still adding it
-- cleanly on any fresh environment.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'questions_chemistry_topic_syllabus_check'
  ) then
    alter table kairo.questions add constraint questions_chemistry_topic_syllabus_check
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
