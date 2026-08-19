-- Content-level audit following up on align_chemistry_topics_to_jamb_syllabus.sql:
-- that migration fixed the *bucket* (wrong topic string), this fixes cases
-- where the bucket string was a valid syllabus topic but the wrong one for
-- the actual content -- found via a keyword-vs-assigned-topic scan across
-- all 1,268 Chemistry stems (59 candidates surfaced, reviewed individually;
-- most were false positives from real keyword overlap between topics, e.g.
-- a stoichiometry question that happens to mention "s.t.p." isn't a gas-laws
-- question just because it shares that term).
--
-- 5 "find the empirical/molecular formula from % composition or molar
-- mass" questions were tagged Organic Compounds. That's a general
-- stoichiometry technique (mole ratios from mass percentages), not
-- organic-chemistry-specific knowledge -- confirmed by 5 near-identical
-- questions sharing the exact same subtopic ("Empirical and Molecular
-- Formula(e)") that were already correctly tagged Chemical combination.
update kairo.questions set topic = 'Chemical combination'
where id in ('chemistry_1dbb7d', 'chemistry_5571d6', 'chemistry_6325f7', 'chemistry_920b5c', 'chemistry_f89ace');

-- "Which of the statements shows that air is a mixture?" was tagged
-- Kinetic theory of matter and Gas Laws (subtopic drifted in as "Elements,
-- Compounds and Mixtures" during the earlier topic realignment); the
-- content is specifically about air's composition, not gas behavior/laws.
update kairo.questions set topic = 'Air'
where id = 'chemistry_aeaeef';

-- "Percentage composition of cement" was tagged Metals and their
-- compounds; cement is an industrial material, not a metal compound.
update kairo.questions set topic = 'Chemistry and Industry'
where id = 'chemistry_0169';
