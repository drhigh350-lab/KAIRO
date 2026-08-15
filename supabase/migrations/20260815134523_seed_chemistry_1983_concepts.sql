-- Kairo — Seed real Chemistry content (JAMB 1983 past paper) — concepts
--
-- 37 new Chemistry concepts, reusing the exact existing topic strings
-- (verified against kairo.concepts) and adding real subtopics under them.
-- The existing ~200 Chemistry questions stay on their topic-level,
-- subtopic-null concepts, untouched and fully reachable via topic-level
-- practice; only the new Subtopic Select view gains real depth for these
-- topics.
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values
($q$kv2dlm$q$, $q$Qualitative Analysis of Ions$q$, $q$Chemistry$q$, $q$Acids, Bases & Salts$q$, $q$Qualitative Analysis of Ions$q$, 1.3, '{}', '{}'),
($q$ab1gw8$q$, $q$pH Scale$q$, $q$Chemistry$q$, $q$Acids, Bases & Salts$q$, $q$pH Scale$q$, 1.1, '{}', '{}'),
($q$e6pk77$q$, $q$Titration Calculations$q$, $q$Chemistry$q$, $q$Acids, Bases & Salts$q$, $q$Titration Calculations$q$, 1.2, '{}', '{}'),
($q$liww8z$q$, $q$Salt Preparation$q$, $q$Chemistry$q$, $q$Acids, Bases & Salts$q$, $q$Salt Preparation$q$, 1.3, '{}', '{}'),
($q$qe23qr$q$, $q$Neutralization Reactions$q$, $q$Chemistry$q$, $q$Acids, Bases & Salts$q$, $q$Neutralization Reactions$q$, 1.0, '{}', '{}'),
($q$vpzbrw$q$, $q$Identifying Acids and Gas Tests$q$, $q$Chemistry$q$, $q$Acids, Bases & Salts$q$, $q$Identifying Acids and Gas Tests$q$, 1.1, '{}', '{}'),
($q$z9kmjm$q$, $q$Alkanols and Soap Chemistry$q$, $q$Chemistry$q$, $q$Organic Chemistry$q$, $q$Alkanols and Soap Chemistry (Saponification)$q$, 1.0, '{}', '{}'),
($q$r4t0dz$q$, $q$Hydrocarbons — Homologous Series$q$, $q$Chemistry$q$, $q$Organic Chemistry$q$, $q$Hydrocarbons — Homologous Series$q$, 1.0, '{}', '{}'),
($q$d1sp6r$q$, $q$Carbohydrates$q$, $q$Chemistry$q$, $q$Organic Chemistry$q$, $q$Carbohydrates — Identification and Formula$q$, 1.3, '{}', '{}'),
($q$j32bof$q$, $q$Isomerism$q$, $q$Chemistry$q$, $q$Organic Chemistry$q$, $q$Isomerism$q$, 1.3, '{}', '{}'),
($q$kk9o6y$q$, $q$Fermentation and Distillation$q$, $q$Chemistry$q$, $q$Organic Chemistry$q$, $q$Fermentation and Distillation$q$, 1.1, '{}', '{}'),
($q$jv7ln2$q$, $q$Welding and Metalworking$q$, $q$Chemistry$q$, $q$Chemistry & Industry$q$, $q$Welding and Metalworking Flames$q$, 1.0, '{}', '{}'),
($q$pfpi8t$q$, $q$Fermentation and Brewing$q$, $q$Chemistry$q$, $q$Chemistry & Industry$q$, $q$Fermentation and Brewing$q$, 1.0, '{}', '{}'),
($q$yxuq7s$q$, $q$Petroleum Refining$q$, $q$Chemistry$q$, $q$Chemistry & Industry$q$, $q$Petroleum Refining$q$, 1.0, '{}', '{}'),
($q$7u41s5$q$, $q$Electronic Configuration$q$, $q$Chemistry$q$, $q$Atomic Structure & Bonding$q$, $q$Electronic Configuration and Periodic Blocks$q$, 1.2, '{}', '{}'),
($q$mzf4b6$q$, $q$Atomic Mass$q$, $q$Chemistry$q$, $q$Atomic Structure & Bonding$q$, $q$Atomic Mass$q$, 1.0, '{}', '{}'),
($q$cl4iqu$q$, $q$Molecular Shape$q$, $q$Chemistry$q$, $q$Atomic Structure & Bonding$q$, $q$Molecular Shape$q$, 1.0, '{}', '{}'),
($q$3a2yze$q$, $q$Electronegativity$q$, $q$Chemistry$q$, $q$Atomic Structure & Bonding$q$, $q$Electronegativity$q$, 1.0, '{}', '{}'),
($q$sdx4xa$q$, $q$Hydrates and Water of Crystallization$q$, $q$Chemistry$q$, $q$Chemical Combination$q$, $q$Hydrates and Water of Crystallization$q$, 1.3, '{}', '{}'),
($q$l5d6y3$q$, $q$Combustion Calculations$q$, $q$Chemistry$q$, $q$Chemical Combination$q$, $q$Combustion Calculations$q$, 1.4, '{}', '{}'),
($q$sam5eu$q$, $q$Limiting Reagent$q$, $q$Chemistry$q$, $q$Chemical Combination$q$, $q$Limiting Reagent$q$, 1.3, '{}', '{}'),
($q$kc1jua$q$, $q$Separation Techniques$q$, $q$Chemistry$q$, $q$Separation of Mixtures$q$, $q$Separation Techniques$q$, 1.3, '{}', '{}'),
($q$84csd7$q$, $q$Gas Laws$q$, $q$Chemistry$q$, $q$Kinetic Theory & Gas Laws$q$, $q$Gas Laws$q$, 1.1, '{}', '{}'),
($q$9jaxsa$q$, $q$Solubility Calculations$q$, $q$Chemistry$q$, $q$Solubility$q$, $q$Solubility Calculations$q$, 1.3, '{}', '{}'),
($q$865p59$q$, $q$Flame Tests$q$, $q$Chemistry$q$, $q$Metals & Their Compounds$q$, $q$Flame Tests$q$, 1.0, '{}', '{}'),
($q$e6wz62$q$, $q$Reactivity and Electrochemical Series$q$, $q$Chemistry$q$, $q$Metals & Their Compounds$q$, $q$Reactivity and Electrochemical Series$q$, 1.1, '{}', '{}'),
($q$4ihrpp$q$, $q$Alloys$q$, $q$Chemistry$q$, $q$Metals & Their Compounds$q$, $q$Alloys$q$, 1.0, '{}', '{}'),
($q$vfmsto$q$, $q$General Reactivity Facts$q$, $q$Chemistry$q$, $q$Metals & Their Compounds$q$, $q$General Reactivity Facts$q$, 1.2, '{}', '{}'),
($q$3hq7md$q$, $q$Identifying Oxidation from Equations$q$, $q$Chemistry$q$, $q$Oxidation & Reduction$q$, $q$Identifying Oxidation from Equations$q$, 1.3, '{}', '{}'),
($q$0wt48x$q$, $q$Oxidizing and Reducing Agents$q$, $q$Chemistry$q$, $q$Oxidation & Reduction$q$, $q$Oxidizing and Reducing Agents$q$, 1.3, '{}', '{}'),
($q$2eamtt$q$, $q$Sulphur Compounds$q$, $q$Chemistry$q$, $q$Non-Metals & Their Compounds$q$, $q$Sulphur Compounds$q$, 1.3, '{}', '{}'),
($q$ww2ejp$q$, $q$Oxidation States of Common Gases$q$, $q$Chemistry$q$, $q$Non-Metals & Their Compounds$q$, $q$Oxidation States of Common Gases$q$, 1.3, '{}', '{}'),
($q$23bs2u$q$, $q$Electrode Reactions$q$, $q$Chemistry$q$, $q$Electrolysis$q$, $q$Electrode Reactions$q$, 1.3, '{}', '{}'),
($q$alfbvy$q$, $q$Pollution Control$q$, $q$Chemistry$q$, $q$Environmental Pollution$q$, $q$Pollution Control$q$, 1.1, '{}', '{}'),
($q$6i2n9s$q$, $q$Comparing Enthalpy Changes$q$, $q$Chemistry$q$, $q$Energy Changes$q$, $q$Comparing Enthalpy Changes$q$, 1.3, '{}', '{}'),
($q$fiv6k4$q$, $q$Enthalpy of Dissolution$q$, $q$Chemistry$q$, $q$Energy Changes$q$, $q$Enthalpy of Dissolution$q$, 1.3, '{}', '{}'),
($q$5mzsr0$q$, $q$Rate of Reaction — Surface Area$q$, $q$Chemistry$q$, $q$Rates of Reaction$q$, $q$Rate of Reaction — Surface Area$q$, 1.1, '{}', '{}');
