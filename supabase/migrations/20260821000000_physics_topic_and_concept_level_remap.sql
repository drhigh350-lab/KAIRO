-- Physics topic + concept-level pass, in one migration since -- unlike
-- Chemistry/Biology -- Physics questions had zero subtopic data and only
-- one generic concept per raw topic string (28 concepts for 200
-- questions, exactly 1:1 with the pre-fix topic strings). There was no
-- existing subtopic text to pattern-match against, so every question's
-- topic, subtopic, and concept link were classified directly from its
-- stem. 168 new granular concepts created (e.g. 'Ohm's Law', 'Coulomb's
-- Law', 'Simple Harmonic Motion', 'Radioactive Decay and Half-Life').
--
-- 9 of the 28 raw topic strings were genuine mega-buckets spanning 2-5
-- official topics (e.g. 'Light Energy and Optics' spans official topics
-- 22-26; 'Waves and Sound' spans Waves + Propagation of Sound Waves) --
-- split by reading each question's stem individually (no subtopic text
-- existed to pattern-match, unlike the Chemistry/Biology ILIKE splits).
-- The remaining 19 were simple renames.
--
-- The 28 old per-topic anchor concepts are NOT deleted or reassigned --
-- real students have accumulated concept_states/attempts against them
-- (up to 18 attempts on some), unlike Chemistry/Biology's near-empty
-- duplicate placeholders. They're left in place with their `topic` field
-- corrected to a valid canonical topic (majority target for split
-- buckets), no longer referenced by any question going forward, so
-- existing mastery history is preserved rather than destroyed.

begin;

-- 1. New granular concepts
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyxaji0', 'Micrometer Screw Gauge', 'Physics', 'Measurements and Units', 'Micrometer Screw Gauge', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyy6dpb', 'Fundamental and Derived Quantities', 'Physics', 'Measurements and Units', 'Fundamental and Derived Quantities', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyhsahx', 'Dimensional Analysis', 'Physics', 'Measurements and Units', 'Dimensional Analysis', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phythv3a', 'Significant Figures', 'Physics', 'Measurements and Units', 'Significant Figures', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3zmf8', 'Vernier Caliper', 'Physics', 'Measurements and Units', 'Vernier Caliper', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phymdd4v', 'Errors in Measurement', 'Physics', 'Measurements and Units', 'Errors in Measurement', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy30t9n', 'Resultant of Vectors', 'Physics', 'Scalars and Vectors', 'Resultant of Vectors', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyt3w5u', 'Resolution of Vectors', 'Physics', 'Scalars and Vectors', 'Resolution of Vectors', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzbikc', 'Scalar and Vector Quantities', 'Physics', 'Scalars and Vectors', 'Scalar and Vector Quantities', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyidkwn', 'Relative Velocity', 'Physics', 'Scalars and Vectors', 'Relative Velocity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phynhj7x', 'Equations of Uniformly Accelerated Motion', 'Physics', 'Motion', 'Equations of Uniformly Accelerated Motion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyvg0fn', 'Motion Under Gravity', 'Physics', 'Motion', 'Motion Under Gravity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9xuy4', 'Motion Graphs', 'Physics', 'Motion', 'Motion Graphs', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy1iblj', 'Projectile Motion', 'Physics', 'Motion', 'Projectile Motion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyh75lx', 'Newton''s Laws of Motion', 'Physics', 'Motion', 'Newton''s Laws of Motion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyo6qji', 'Momentum and Collisions', 'Physics', 'Motion', 'Momentum and Collisions', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyujv6o', 'Impulse and Momentum', 'Physics', 'Motion', 'Impulse and Momentum', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyh9sdb', 'Circular Motion', 'Physics', 'Motion', 'Circular Motion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phydw2pc', 'Simple Harmonic Motion', 'Physics', 'Motion', 'Simple Harmonic Motion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyn9t84', 'Speed and Velocity', 'Physics', 'Motion', 'Speed and Velocity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyazytj', 'Resonance in Forced Vibration', 'Physics', 'Motion', 'Resonance in Forced Vibration', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyxepq8', 'Variation of g with Height', 'Physics', 'Gravitational Field', 'Variation of g with Height', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5jsg6', 'Escape Velocity', 'Physics', 'Gravitational Field', 'Escape Velocity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5kxvf', 'Variation of g with Depth', 'Physics', 'Gravitational Field', 'Variation of g with Depth', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy1t2ta', 'Satellites and Orbits', 'Physics', 'Gravitational Field', 'Satellites and Orbits', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyla753', 'Newton''s Law of Universal Gravitation', 'Physics', 'Gravitational Field', 'Newton''s Law of Universal Gravitation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phylc58d', 'Gravitational Potential', 'Physics', 'Gravitational Field', 'Gravitational Potential', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyrc11e', 'Triangle of Forces', 'Physics', 'Equilibrium of Forces', 'Triangle of Forces', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyrtj5p', 'Moments and Torque', 'Physics', 'Equilibrium of Forces', 'Moments and Torque', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyht0hl', 'Lami''s Theorem', 'Physics', 'Equilibrium of Forces', 'Lami''s Theorem', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9xpse', 'Types of Equilibrium', 'Physics', 'Equilibrium of Forces', 'Types of Equilibrium', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyimvih', 'Work Done by a Force', 'Physics', 'Work, Energy and Power', 'Work Done by a Force', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phycwi64', 'Electrical Energy Consumption', 'Physics', 'Work, Energy and Power', 'Electrical Energy Consumption', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyciyhe', 'Power', 'Physics', 'Work, Energy and Power', 'Power', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy7ur23', 'Kinetic and Potential Energy', 'Physics', 'Work, Energy and Power', 'Kinetic and Potential Energy', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phygdppq', 'Conservation of Energy', 'Physics', 'Work, Energy and Power', 'Conservation of Energy', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy0y9do', 'Renewable and Non-Renewable Energy', 'Physics', 'Work, Energy and Power', 'Renewable and Non-Renewable Energy', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phym5igq', 'Coefficient of Friction', 'Physics', 'Friction', 'Coefficient of Friction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phypki7p', 'Static and Kinetic Friction', 'Physics', 'Friction', 'Static and Kinetic Friction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5tb94', 'Terminal Velocity and Viscosity', 'Physics', 'Friction', 'Terminal Velocity and Viscosity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy874fr', 'Advantages and Disadvantages of Friction', 'Physics', 'Friction', 'Advantages and Disadvantages of Friction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyhocn9', 'Mechanical Advantage and Efficiency', 'Physics', 'Simple Machines', 'Mechanical Advantage and Efficiency', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyj2qp8', 'Classes of Levers', 'Physics', 'Simple Machines', 'Classes of Levers', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9uzfk', 'Velocity Ratio of Pulleys', 'Physics', 'Simple Machines', 'Velocity Ratio of Pulleys', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy8ut0c', 'Hooke''s Law and Spring Constant', 'Physics', 'Elasticity', 'Hooke''s Law and Spring Constant', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyvs4f8', 'Elastic Limit', 'Physics', 'Elasticity', 'Elastic Limit', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phycgvyi', 'Energy Stored in a Spring', 'Physics', 'Elasticity', 'Energy Stored in a Spring', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phye6ivw', 'Young''s Modulus', 'Physics', 'Elasticity', 'Young''s Modulus', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phypvs7h', 'Pressure in Fluids', 'Physics', 'Pressure', 'Pressure in Fluids', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzioyk', 'Pascal''s Principle', 'Physics', 'Pressure', 'Pascal''s Principle', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyl1cq9', 'Barometers', 'Physics', 'Pressure', 'Barometers', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9chj7', 'Atmospheric Pressure', 'Physics', 'Pressure', 'Atmospheric Pressure', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy55nf4', 'Hydraulic Press', 'Physics', 'Pressure', 'Hydraulic Press', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzw9xa', 'Archimedes'' Principle', 'Physics', 'Liquids at Rest', 'Archimedes'' Principle', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3kx7e', 'Relative Density', 'Physics', 'Liquids at Rest', 'Relative Density', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyedtjv', 'Flotation', 'Physics', 'Liquids at Rest', 'Flotation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzhwjr', 'Temperature Scales', 'Physics', 'Temperature and its Measurement', 'Temperature Scales', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy64dpj', 'Thermometric Properties', 'Physics', 'Temperature and its Measurement', 'Thermometric Properties', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phya1wj0', 'Fixed Points of Thermometers', 'Physics', 'Temperature and its Measurement', 'Fixed Points of Thermometers', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phytpac5', 'Clinical Thermometer', 'Physics', 'Temperature and its Measurement', 'Clinical Thermometer', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy6t4uf', 'Linear Expansivity', 'Physics', 'Thermal Expansion', 'Linear Expansivity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyel624', 'Relation Between Expansivities', 'Physics', 'Thermal Expansion', 'Relation Between Expansivities', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy6hid2', 'Applications of Thermal Expansion', 'Physics', 'Thermal Expansion', 'Applications of Thermal Expansion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5owf7', 'Anomalous Expansion of Water', 'Physics', 'Thermal Expansion', 'Anomalous Expansion of Water', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5935a', 'Real and Apparent Expansivity of Liquids', 'Physics', 'Thermal Expansion', 'Real and Apparent Expansivity of Liquids', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy0l725', 'General Gas Equation', 'Physics', 'Gas Laws', 'General Gas Equation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3j2d5', 'Boyle''s Law', 'Physics', 'Gas Laws', 'Boyle''s Law', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy4i3qk', 'Absolute Zero Temperature', 'Physics', 'Gas Laws', 'Absolute Zero Temperature', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy2iagl', 'Ideal Gas Equation', 'Physics', 'Gas Laws', 'Ideal Gas Equation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy58kxo', 'Charles'' Law', 'Physics', 'Gas Laws', 'Charles'' Law', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9t7e8', 'Deviation from Ideal Gas Behaviour', 'Physics', 'Gas Laws', 'Deviation from Ideal Gas Behaviour', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyg8jdp', 'Specific Heat Capacity', 'Physics', 'Quantity of Heat', 'Specific Heat Capacity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy0lvsn', 'Newton''s Law of Cooling', 'Physics', 'Quantity of Heat', 'Newton''s Law of Cooling', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyujza7', 'Specific Latent Heat', 'Physics', 'Change of State', 'Specific Latent Heat', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phytz0yn', 'Boiling and Evaporation', 'Physics', 'Change of State', 'Boiling and Evaporation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phycxll4', 'Effect of Pressure on Boiling Point', 'Physics', 'Change of State', 'Effect of Pressure on Boiling Point', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzkloo', 'Relative Humidity', 'Physics', 'Vapours', 'Relative Humidity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phykep7y', 'Dew Point', 'Physics', 'Vapours', 'Dew Point', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy6wkta', 'Hygrometers', 'Physics', 'Vapours', 'Hygrometers', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phykpuxq', 'Brownian Motion', 'Physics', 'Kinetic Theory of Matter', 'Brownian Motion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyphr62', 'Surface Tension', 'Physics', 'Kinetic Theory of Matter', 'Surface Tension', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phygdswm', 'Diffusion', 'Physics', 'Kinetic Theory of Matter', 'Diffusion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy31yih', 'Capillarity', 'Physics', 'Kinetic Theory of Matter', 'Capillarity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyair4c', 'Kinetic Theory of Gases', 'Physics', 'Kinetic Theory of Matter', 'Kinetic Theory of Gases', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyowgzr', 'Radiation', 'Physics', 'Heat Transfer', 'Radiation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyixa11', 'Convection', 'Physics', 'Heat Transfer', 'Convection', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phydpg8s', 'Conduction', 'Physics', 'Heat Transfer', 'Conduction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phybi4q2', 'Wave Equation', 'Physics', 'Waves', 'Wave Equation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyy9v86', 'Transverse and Longitudinal Waves', 'Physics', 'Waves', 'Transverse and Longitudinal Waves', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phywzs3t', 'Diffraction of Waves', 'Physics', 'Waves', 'Diffraction of Waves', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy60rji', 'Polarization of Waves', 'Physics', 'Waves', 'Polarization of Waves', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyw1swj', 'Principle of Superposition', 'Physics', 'Waves', 'Principle of Superposition', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyckjlt', 'Beats', 'Physics', 'Propagation of Sound Waves', 'Beats', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyeiyzc', 'Doppler Effect', 'Physics', 'Propagation of Sound Waves', 'Doppler Effect', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyotohp', 'Speed of Sound in Different Media', 'Physics', 'Propagation of Sound Waves', 'Speed of Sound in Different Media', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy6vz41', 'Echoes', 'Physics', 'Propagation of Sound Waves', 'Echoes', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phynam14', 'Pitch, Loudness and Quality', 'Physics', 'Propagation of Sound Waves', 'Pitch, Loudness and Quality', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy8p0tv', 'Resonance in Pipes', 'Physics', 'Propagation of Sound Waves', 'Resonance in Pipes', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyhhpbm', 'Vibrating Strings', 'Physics', 'Propagation of Sound Waves', 'Vibrating Strings', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyyofqe', 'Rectilinear Propagation of Light', 'Physics', 'Light Energy', 'Rectilinear Propagation of Light', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phywaoua', 'Electromagnetic Spectrum', 'Physics', 'Light Energy', 'Electromagnetic Spectrum', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyxeqbn', 'Mirror Formula and Images', 'Physics', 'Reflection of Light', 'Mirror Formula and Images', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyhl1n1', 'Laws of Reflection', 'Physics', 'Reflection of Light', 'Laws of Reflection', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3jcat', 'Laws of Refraction', 'Physics', 'Refraction of Light', 'Laws of Refraction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9mx2x', 'Total Internal Reflection', 'Physics', 'Refraction of Light', 'Total Internal Reflection', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy18haf', 'Critical Angle and Refractive Index', 'Physics', 'Refraction of Light', 'Critical Angle and Refractive Index', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyeyuhz', 'Lens Formula', 'Physics', 'Refraction of Light', 'Lens Formula', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy1gv0e', 'Defects of Vision', 'Physics', 'Optical Instruments', 'Defects of Vision', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy38dal', 'Power of a Lens', 'Physics', 'Optical Instruments', 'Power of a Lens', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyy8ozc', 'The Astronomical Telescope', 'Physics', 'Optical Instruments', 'The Astronomical Telescope', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyywd14', 'Dispersion by a Prism', 'Physics', 'Dispersion of Light and Colours', 'Dispersion by a Prism', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyve92m', 'Primary Colours of Light', 'Physics', 'Dispersion of Light and Colours', 'Primary Colours of Light', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phypnsm4', 'Formation of a Rainbow', 'Physics', 'Dispersion of Light and Colours', 'Formation of a Rainbow', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3d8w3', 'Coulomb''s Law', 'Physics', 'Electrostatics', 'Coulomb''s Law', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzp08j', 'Charging by Induction', 'Physics', 'Electrostatics', 'Charging by Induction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3trp0', 'Electric Field Lines', 'Physics', 'Electrostatics', 'Electric Field Lines', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyj43d5', 'Electric Field Intensity', 'Physics', 'Electrostatics', 'Electric Field Intensity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyiqvnb', 'Applications of Electrostatics', 'Physics', 'Electrostatics', 'Applications of Electrostatics', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy4gh2m', 'The Gold-Leaf Electroscope', 'Physics', 'Electrostatics', 'The Gold-Leaf Electroscope', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5zja8', 'Electric Potential', 'Physics', 'Electrostatics', 'Electric Potential', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phydzr1y', 'Capacitors in Parallel', 'Physics', 'Capacitors', 'Capacitors in Parallel', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyxr2dh', 'Energy Stored in a Capacitor', 'Physics', 'Capacitors', 'Energy Stored in a Capacitor', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyylurt', 'Factors Affecting Capacitance', 'Physics', 'Capacitors', 'Factors Affecting Capacitance', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyp0lzj', 'Applications of Capacitors', 'Physics', 'Capacitors', 'Applications of Capacitors', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyjeget', 'Capacitors in Series', 'Physics', 'Capacitors', 'Capacitors in Series', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy1ghr0', 'Internal Resistance and Terminal Voltage', 'Physics', 'Electric Cells', 'Internal Resistance and Terminal Voltage', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9skdg', 'Measuring EMF with a Potentiometer', 'Physics', 'Electric Cells', 'Measuring EMF with a Potentiometer', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyigatj', 'Ohm''s Law', 'Physics', 'Current Electricity', 'Ohm''s Law', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9tze5', 'Resistors in Series and Parallel', 'Physics', 'Current Electricity', 'Resistors in Series and Parallel', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyr5uqp', 'Resistivity', 'Physics', 'Current Electricity', 'Resistivity', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phygb7r3', 'Kirchhoff''s Laws', 'Physics', 'Current Electricity', 'Kirchhoff''s Laws', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyocwbf', 'Electrolysis and Faraday''s Laws', 'Physics', 'Current Electricity', 'Electrolysis and Faraday''s Laws', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyuk9e1', 'Electrical Power', 'Physics', 'Electrical Energy and Power', 'Electrical Power', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyv2isq', 'Domestic Wiring', 'Physics', 'Electrical Energy and Power', 'Domestic Wiring', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyp49kw', 'Fuses and Circuit Protection', 'Physics', 'Electrical Energy and Power', 'Fuses and Circuit Protection', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyv08hh', 'The Wheatstone Bridge', 'Physics', 'Electrical Measuring Instruments', 'The Wheatstone Bridge', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyxfgca', 'Converting a Galvanometer to an Ammeter', 'Physics', 'Electrical Measuring Instruments', 'Converting a Galvanometer to an Ammeter', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyqvkiz', 'The Moving-Coil Galvanometer', 'Physics', 'Electrical Measuring Instruments', 'The Moving-Coil Galvanometer', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyzqy72', 'Force on a Current-Carrying Conductor', 'Physics', 'Magnetic Field', 'Force on a Current-Carrying Conductor', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phywx7pt', 'Angle of Declination', 'Physics', 'Magnetic Field', 'Angle of Declination', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyx63cf', 'Angle of Dip', 'Physics', 'Magnetic Field', 'Angle of Dip', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyl0uke', 'The DC Motor', 'Physics', 'Magnetic Field', 'The DC Motor', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyyz7sr', 'Lenz''s Law', 'Physics', 'Electromagnetic Induction', 'Lenz''s Law', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phycbplj', 'Faraday''s Law of Electromagnetic Induction', 'Physics', 'Electromagnetic Induction', 'Faraday''s Law of Electromagnetic Induction', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyd84u8', 'The AC Generator', 'Physics', 'Electromagnetic Induction', 'The AC Generator', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy9yjb1', 'Transformers', 'Physics', 'Electromagnetic Induction', 'Transformers', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyqx6gv', 'Eddy Currents', 'Physics', 'Electromagnetic Induction', 'Eddy Currents', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phywrdml', 'Self-Inductance', 'Physics', 'Electromagnetic Induction', 'Self-Inductance', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyy4lyk', 'RMS Value of AC', 'Physics', 'Alternating Current', 'RMS Value of AC', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy83tql', 'Capacitive Reactance', 'Physics', 'Alternating Current', 'Capacitive Reactance', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyl8os9', 'Resonance in RLC Circuits', 'Physics', 'Alternating Current', 'Resonance in RLC Circuits', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyxtogn', 'n-type and p-type Semiconductors', 'Physics', 'Semiconductors', 'n-type and p-type Semiconductors', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy1w1ht', 'The p-n Junction Diode', 'Physics', 'Semiconductors', 'The p-n Junction Diode', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy7pze9', 'Rectification', 'Physics', 'Semiconductors', 'Rectification', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyviftt', 'Band Theory of Solids', 'Physics', 'Semiconductors', 'Band Theory of Solids', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyd96qe', 'The Transistor as an Amplifier', 'Physics', 'Semiconductors', 'The Transistor as an Amplifier', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3rzsj', 'Bohr''s Model of the Atom', 'Physics', 'Elementary Modern Physics', 'Bohr''s Model of the Atom', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy49itn', 'De Broglie Wavelength', 'Physics', 'Elementary Modern Physics', 'De Broglie Wavelength', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy7s55j', 'Production of X-Rays', 'Physics', 'Elementary Modern Physics', 'Production of X-Rays', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy2o7s3', 'Heisenberg''s Uncertainty Principle', 'Physics', 'Elementary Modern Physics', 'Heisenberg''s Uncertainty Principle', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phykkv9r', 'Thermionic Emission', 'Physics', 'Elementary Modern Physics', 'Thermionic Emission', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyftmtt', 'Radioactive Decay and Half-Life', 'Physics', 'Nuclear Physics', 'Radioactive Decay and Half-Life', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyqlgzu', 'Properties of Alpha, Beta and Gamma Radiation', 'Physics', 'Nuclear Physics', 'Properties of Alpha, Beta and Gamma Radiation', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyi1b0z', 'Nuclear Fission', 'Physics', 'Nuclear Physics', 'Nuclear Fission', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy3nx39', 'Nuclear Fusion', 'Physics', 'Nuclear Physics', 'Nuclear Fusion', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyrbsv5', 'Radioactive Decay Equations', 'Physics', 'Nuclear Physics', 'Radioactive Decay Equations', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phy5psq0', 'The Photoelectric Effect', 'Physics', 'Energy Quantization', 'The Photoelectric Effect', 1.0, '{}', '{}') on conflict (id) do nothing;
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids) values ('phyoxfq8', 'Stopping Potential', 'Physics', 'Energy Quantization', 'Stopping Potential', 1.0, '{}', '{}') on conflict (id) do nothing;

-- 2. Set topic, subtopic and concept link per question, grouped by concept
update kairo.questions
set topic = 'Measurements and Units',
    subtopic = 'Micrometer Screw Gauge',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyxaji0'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0001');
update kairo.questions
set topic = 'Measurements and Units',
    subtopic = 'Fundamental and Derived Quantities',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyy6dpb'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0002');
update kairo.questions
set topic = 'Measurements and Units',
    subtopic = 'Dimensional Analysis',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyhsahx'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0003', 'physics_0005', 'physics_0007');
update kairo.questions
set topic = 'Measurements and Units',
    subtopic = 'Significant Figures',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phythv3a'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0004');
update kairo.questions
set topic = 'Measurements and Units',
    subtopic = 'Vernier Caliper',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3zmf8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0006');
update kairo.questions
set topic = 'Measurements and Units',
    subtopic = 'Errors in Measurement',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phymdd4v'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0008');
update kairo.questions
set topic = 'Scalars and Vectors',
    subtopic = 'Resultant of Vectors',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy30t9n'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0009', 'physics_0013');
update kairo.questions
set topic = 'Scalars and Vectors',
    subtopic = 'Resolution of Vectors',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyt3w5u'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0010', 'physics_0014');
update kairo.questions
set topic = 'Scalars and Vectors',
    subtopic = 'Scalar and Vector Quantities',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzbikc'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0011');
update kairo.questions
set topic = 'Scalars and Vectors',
    subtopic = 'Relative Velocity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyidkwn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0012');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Equations of Uniformly Accelerated Motion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phynhj7x'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0015');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Motion Under Gravity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyvg0fn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0016');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Motion Graphs',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9xuy4'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0017', 'physics_0027');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Projectile Motion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy1iblj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0018', 'physics_0019');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Newton''s Laws of Motion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyh75lx'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0020', 'physics_0030');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Momentum and Collisions',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyo6qji'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0021');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Impulse and Momentum',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyujv6o'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0022');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Circular Motion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyh9sdb'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0023');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Simple Harmonic Motion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phydw2pc'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0024', 'physics_0025', 'physics_0026');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Speed and Velocity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyn9t84'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0028');
update kairo.questions
set topic = 'Motion',
    subtopic = 'Resonance in Forced Vibration',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyazytj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0029');
update kairo.questions
set topic = 'Gravitational Field',
    subtopic = 'Variation of g with Height',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyxepq8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0031');
update kairo.questions
set topic = 'Gravitational Field',
    subtopic = 'Escape Velocity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5jsg6'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0032');
update kairo.questions
set topic = 'Gravitational Field',
    subtopic = 'Variation of g with Depth',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5kxvf'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0033');
update kairo.questions
set topic = 'Gravitational Field',
    subtopic = 'Satellites and Orbits',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy1t2ta'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0034', 'physics_0036');
update kairo.questions
set topic = 'Gravitational Field',
    subtopic = 'Newton''s Law of Universal Gravitation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyla753'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0035');
update kairo.questions
set topic = 'Gravitational Field',
    subtopic = 'Gravitational Potential',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phylc58d'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0037');
update kairo.questions
set topic = 'Equilibrium of Forces',
    subtopic = 'Triangle of Forces',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyrc11e'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0038', 'physics_0043');
update kairo.questions
set topic = 'Equilibrium of Forces',
    subtopic = 'Moments and Torque',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyrtj5p'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0039', 'physics_0041');
update kairo.questions
set topic = 'Equilibrium of Forces',
    subtopic = 'Lami''s Theorem',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyht0hl'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0040');
update kairo.questions
set topic = 'Equilibrium of Forces',
    subtopic = 'Types of Equilibrium',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9xpse'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0042');
update kairo.questions
set topic = 'Work, Energy and Power',
    subtopic = 'Work Done by a Force',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyimvih'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0045', 'physics_0051');
update kairo.questions
set topic = 'Work, Energy and Power',
    subtopic = 'Electrical Energy Consumption',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phycwi64'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0046');
update kairo.questions
set topic = 'Work, Energy and Power',
    subtopic = 'Power',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyciyhe'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0047');
update kairo.questions
set topic = 'Work, Energy and Power',
    subtopic = 'Kinetic and Potential Energy',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy7ur23'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0048');
update kairo.questions
set topic = 'Work, Energy and Power',
    subtopic = 'Conservation of Energy',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phygdppq'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0049');
update kairo.questions
set topic = 'Work, Energy and Power',
    subtopic = 'Renewable and Non-Renewable Energy',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy0y9do'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0050');
update kairo.questions
set topic = 'Friction',
    subtopic = 'Coefficient of Friction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phym5igq'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0052');
update kairo.questions
set topic = 'Friction',
    subtopic = 'Static and Kinetic Friction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phypki7p'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0053');
update kairo.questions
set topic = 'Friction',
    subtopic = 'Terminal Velocity and Viscosity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5tb94'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0054', 'physics_0055');
update kairo.questions
set topic = 'Friction',
    subtopic = 'Advantages and Disadvantages of Friction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy874fr'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0056');
update kairo.questions
set topic = 'Simple Machines',
    subtopic = 'Mechanical Advantage and Efficiency',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyhocn9'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0044', 'physics_0057', 'physics_0060');
update kairo.questions
set topic = 'Simple Machines',
    subtopic = 'Classes of Levers',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyj2qp8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0058');
update kairo.questions
set topic = 'Simple Machines',
    subtopic = 'Velocity Ratio of Pulleys',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9uzfk'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0059');
update kairo.questions
set topic = 'Elasticity',
    subtopic = 'Hooke''s Law and Spring Constant',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy8ut0c'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0061');
update kairo.questions
set topic = 'Elasticity',
    subtopic = 'Elastic Limit',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyvs4f8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0062');
update kairo.questions
set topic = 'Elasticity',
    subtopic = 'Energy Stored in a Spring',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phycgvyi'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0063');
update kairo.questions
set topic = 'Elasticity',
    subtopic = 'Young''s Modulus',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phye6ivw'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0064');
update kairo.questions
set topic = 'Pressure',
    subtopic = 'Pressure in Fluids',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phypvs7h'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0065');
update kairo.questions
set topic = 'Pressure',
    subtopic = 'Pascal''s Principle',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzioyk'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0066');
update kairo.questions
set topic = 'Pressure',
    subtopic = 'Barometers',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyl1cq9'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0067', 'physics_0070');
update kairo.questions
set topic = 'Pressure',
    subtopic = 'Atmospheric Pressure',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9chj7'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0068');
update kairo.questions
set topic = 'Pressure',
    subtopic = 'Hydraulic Press',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy55nf4'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0069');
update kairo.questions
set topic = 'Liquids at Rest',
    subtopic = 'Archimedes'' Principle',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzw9xa'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0071', 'physics_0072');
update kairo.questions
set topic = 'Liquids at Rest',
    subtopic = 'Relative Density',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3kx7e'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0073');
update kairo.questions
set topic = 'Liquids at Rest',
    subtopic = 'Flotation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyedtjv'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0074');
update kairo.questions
set topic = 'Temperature and its Measurement',
    subtopic = 'Temperature Scales',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzhwjr'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0075');
update kairo.questions
set topic = 'Temperature and its Measurement',
    subtopic = 'Thermometric Properties',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy64dpj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0076');
update kairo.questions
set topic = 'Temperature and its Measurement',
    subtopic = 'Fixed Points of Thermometers',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phya1wj0'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0077');
update kairo.questions
set topic = 'Temperature and its Measurement',
    subtopic = 'Clinical Thermometer',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phytpac5'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0078');
update kairo.questions
set topic = 'Thermal Expansion',
    subtopic = 'Linear Expansivity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy6t4uf'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0079');
update kairo.questions
set topic = 'Thermal Expansion',
    subtopic = 'Relation Between Expansivities',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyel624'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0080');
update kairo.questions
set topic = 'Thermal Expansion',
    subtopic = 'Applications of Thermal Expansion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy6hid2'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0081');
update kairo.questions
set topic = 'Thermal Expansion',
    subtopic = 'Anomalous Expansion of Water',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5owf7'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0082');
update kairo.questions
set topic = 'Thermal Expansion',
    subtopic = 'Real and Apparent Expansivity of Liquids',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5935a'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0083');
update kairo.questions
set topic = 'Gas Laws',
    subtopic = 'General Gas Equation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy0l725'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0084');
update kairo.questions
set topic = 'Gas Laws',
    subtopic = 'Boyle''s Law',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3j2d5'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0085');
update kairo.questions
set topic = 'Gas Laws',
    subtopic = 'Absolute Zero Temperature',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy4i3qk'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0086');
update kairo.questions
set topic = 'Gas Laws',
    subtopic = 'Ideal Gas Equation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2iagl'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0087');
update kairo.questions
set topic = 'Gas Laws',
    subtopic = 'Charles'' Law',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy58kxo'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0088');
update kairo.questions
set topic = 'Gas Laws',
    subtopic = 'Deviation from Ideal Gas Behaviour',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9t7e8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0089');
update kairo.questions
set topic = 'Quantity of Heat',
    subtopic = 'Specific Heat Capacity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyg8jdp'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0090');
update kairo.questions
set topic = 'Quantity of Heat',
    subtopic = 'Newton''s Law of Cooling',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy0lvsn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0095');
update kairo.questions
set topic = 'Change of State',
    subtopic = 'Specific Latent Heat',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyujza7'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0091');
update kairo.questions
set topic = 'Change of State',
    subtopic = 'Boiling and Evaporation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phytz0yn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0092');
update kairo.questions
set topic = 'Change of State',
    subtopic = 'Effect of Pressure on Boiling Point',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phycxll4'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0093', 'physics_0094');
update kairo.questions
set topic = 'Vapours',
    subtopic = 'Relative Humidity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzkloo'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0096');
update kairo.questions
set topic = 'Vapours',
    subtopic = 'Dew Point',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phykep7y'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0097');
update kairo.questions
set topic = 'Vapours',
    subtopic = 'Hygrometers',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy6wkta'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0098');
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    subtopic = 'Brownian Motion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phykpuxq'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0099');
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    subtopic = 'Surface Tension',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyphr62'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0100');
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    subtopic = 'Diffusion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phygdswm'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0101');
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    subtopic = 'Capillarity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy31yih'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0102');
update kairo.questions
set topic = 'Kinetic Theory of Matter',
    subtopic = 'Kinetic Theory of Gases',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyair4c'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0103');
update kairo.questions
set topic = 'Heat Transfer',
    subtopic = 'Radiation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyowgzr'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0104', 'physics_0106');
update kairo.questions
set topic = 'Heat Transfer',
    subtopic = 'Convection',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyixa11'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0105', 'physics_0107');
update kairo.questions
set topic = 'Heat Transfer',
    subtopic = 'Conduction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phydpg8s'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0108');
update kairo.questions
set topic = 'Waves',
    subtopic = 'Wave Equation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phybi4q2'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0109');
update kairo.questions
set topic = 'Waves',
    subtopic = 'Transverse and Longitudinal Waves',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyy9v86'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0110');
update kairo.questions
set topic = 'Waves',
    subtopic = 'Diffraction of Waves',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phywzs3t'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0111');
update kairo.questions
set topic = 'Waves',
    subtopic = 'Polarization of Waves',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy60rji'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0112');
update kairo.questions
set topic = 'Waves',
    subtopic = 'Principle of Superposition',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyw1swj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0113');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Beats',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyckjlt'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0114');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Doppler Effect',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyeiyzc'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0115');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Speed of Sound in Different Media',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyotohp'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0116');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Echoes',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy6vz41'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0117', 'physics_0120');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Pitch, Loudness and Quality',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phynam14'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0118');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Resonance in Pipes',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy8p0tv'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0119');
update kairo.questions
set topic = 'Propagation of Sound Waves',
    subtopic = 'Vibrating Strings',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyhhpbm'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0121');
update kairo.questions
set topic = 'Light Energy',
    subtopic = 'Rectilinear Propagation of Light',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyyofqe'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0122');
update kairo.questions
set topic = 'Light Energy',
    subtopic = 'Electromagnetic Spectrum',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phywaoua'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0133');
update kairo.questions
set topic = 'Reflection of Light',
    subtopic = 'Mirror Formula and Images',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyxeqbn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0123', 'physics_0125');
update kairo.questions
set topic = 'Reflection of Light',
    subtopic = 'Laws of Reflection',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyhl1n1'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0124');
update kairo.questions
set topic = 'Refraction of Light',
    subtopic = 'Laws of Refraction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3jcat'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0126');
update kairo.questions
set topic = 'Refraction of Light',
    subtopic = 'Total Internal Reflection',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9mx2x'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0127', 'physics_0138');
update kairo.questions
set topic = 'Refraction of Light',
    subtopic = 'Critical Angle and Refractive Index',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy18haf'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0128', 'physics_0134');
update kairo.questions
set topic = 'Refraction of Light',
    subtopic = 'Lens Formula',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyeyuhz'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0129', 'physics_0137');
update kairo.questions
set topic = 'Optical Instruments',
    subtopic = 'Defects of Vision',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy1gv0e'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0130', 'physics_0136');
update kairo.questions
set topic = 'Optical Instruments',
    subtopic = 'Power of a Lens',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy38dal'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0135');
update kairo.questions
set topic = 'Optical Instruments',
    subtopic = 'The Astronomical Telescope',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyy8ozc'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0139');
update kairo.questions
set topic = 'Dispersion of Light and Colours',
    subtopic = 'Dispersion by a Prism',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyywd14'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0131');
update kairo.questions
set topic = 'Dispersion of Light and Colours',
    subtopic = 'Primary Colours of Light',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyve92m'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0132');
update kairo.questions
set topic = 'Dispersion of Light and Colours',
    subtopic = 'Formation of a Rainbow',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phypnsm4'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0140');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'Coulomb''s Law',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3d8w3'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0141');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'Charging by Induction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzp08j'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0142');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'Electric Field Lines',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3trp0'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0143');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'Electric Field Intensity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyj43d5'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0144');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'Applications of Electrostatics',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyiqvnb'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0145');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'The Gold-Leaf Electroscope',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy4gh2m'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0146');
update kairo.questions
set topic = 'Electrostatics',
    subtopic = 'Electric Potential',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5zja8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0147');
update kairo.questions
set topic = 'Capacitors',
    subtopic = 'Capacitors in Parallel',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phydzr1y'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0148');
update kairo.questions
set topic = 'Capacitors',
    subtopic = 'Energy Stored in a Capacitor',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyxr2dh'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0149');
update kairo.questions
set topic = 'Capacitors',
    subtopic = 'Factors Affecting Capacitance',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyylurt'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0150');
update kairo.questions
set topic = 'Capacitors',
    subtopic = 'Applications of Capacitors',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyp0lzj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0151');
update kairo.questions
set topic = 'Capacitors',
    subtopic = 'Capacitors in Series',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyjeget'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0152');
update kairo.questions
set topic = 'Electric Cells',
    subtopic = 'Internal Resistance and Terminal Voltage',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy1ghr0'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0153');
update kairo.questions
set topic = 'Electric Cells',
    subtopic = 'Measuring EMF with a Potentiometer',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9skdg'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0158');
update kairo.questions
set topic = 'Current Electricity',
    subtopic = 'Ohm''s Law',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyigatj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0154');
update kairo.questions
set topic = 'Current Electricity',
    subtopic = 'Resistors in Series and Parallel',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9tze5'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0155');
update kairo.questions
set topic = 'Current Electricity',
    subtopic = 'Resistivity',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyr5uqp'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0156');
update kairo.questions
set topic = 'Current Electricity',
    subtopic = 'Kirchhoff''s Laws',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phygb7r3'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0157');
update kairo.questions
set topic = 'Current Electricity',
    subtopic = 'Electrolysis and Faraday''s Laws',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyocwbf'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0180', 'physics_0181');
update kairo.questions
set topic = 'Electrical Energy and Power',
    subtopic = 'Electrical Power',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyuk9e1'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0160');
update kairo.questions
set topic = 'Electrical Energy and Power',
    subtopic = 'Domestic Wiring',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyv2isq'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0161');
update kairo.questions
set topic = 'Electrical Energy and Power',
    subtopic = 'Fuses and Circuit Protection',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyp49kw'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0162');
update kairo.questions
set topic = 'Electrical Measuring Instruments',
    subtopic = 'The Wheatstone Bridge',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyv08hh'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0159');
update kairo.questions
set topic = 'Electrical Measuring Instruments',
    subtopic = 'Converting a Galvanometer to an Ammeter',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyxfgca'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0164');
update kairo.questions
set topic = 'Electrical Measuring Instruments',
    subtopic = 'The Moving-Coil Galvanometer',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyqvkiz'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0174');
update kairo.questions
set topic = 'Magnetic Field',
    subtopic = 'Force on a Current-Carrying Conductor',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyzqy72'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0163');
update kairo.questions
set topic = 'Magnetic Field',
    subtopic = 'Angle of Declination',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phywx7pt'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0169');
update kairo.questions
set topic = 'Magnetic Field',
    subtopic = 'Angle of Dip',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyx63cf'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0170');
update kairo.questions
set topic = 'Magnetic Field',
    subtopic = 'The DC Motor',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyl0uke'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0172');
update kairo.questions
set topic = 'Electromagnetic Induction',
    subtopic = 'Lenz''s Law',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyyz7sr'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0165');
update kairo.questions
set topic = 'Electromagnetic Induction',
    subtopic = 'Faraday''s Law of Electromagnetic Induction',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phycbplj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0166');
update kairo.questions
set topic = 'Electromagnetic Induction',
    subtopic = 'The AC Generator',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyd84u8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0167');
update kairo.questions
set topic = 'Electromagnetic Induction',
    subtopic = 'Transformers',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy9yjb1'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0168');
update kairo.questions
set topic = 'Electromagnetic Induction',
    subtopic = 'Eddy Currents',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyqx6gv'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0171');
update kairo.questions
set topic = 'Electromagnetic Induction',
    subtopic = 'Self-Inductance',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phywrdml'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0173');
update kairo.questions
set topic = 'Alternating Current',
    subtopic = 'RMS Value of AC',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyy4lyk'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0175');
update kairo.questions
set topic = 'Alternating Current',
    subtopic = 'Capacitive Reactance',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy83tql'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0176', 'physics_0178');
update kairo.questions
set topic = 'Alternating Current',
    subtopic = 'Resonance in RLC Circuits',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyl8os9'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0177', 'physics_0179');
update kairo.questions
set topic = 'Semiconductors',
    subtopic = 'n-type and p-type Semiconductors',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyxtogn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0196');
update kairo.questions
set topic = 'Semiconductors',
    subtopic = 'The p-n Junction Diode',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy1w1ht'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0197');
update kairo.questions
set topic = 'Semiconductors',
    subtopic = 'Rectification',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy7pze9'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0198');
update kairo.questions
set topic = 'Semiconductors',
    subtopic = 'Band Theory of Solids',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyviftt'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0199');
update kairo.questions
set topic = 'Semiconductors',
    subtopic = 'The Transistor as an Amplifier',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyd96qe'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0200');
update kairo.questions
set topic = 'Elementary Modern Physics',
    subtopic = 'Bohr''s Model of the Atom',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3rzsj'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0189');
update kairo.questions
set topic = 'Elementary Modern Physics',
    subtopic = 'De Broglie Wavelength',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy49itn'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0190');
update kairo.questions
set topic = 'Elementary Modern Physics',
    subtopic = 'Production of X-Rays',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy7s55j'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0192');
update kairo.questions
set topic = 'Elementary Modern Physics',
    subtopic = 'Heisenberg''s Uncertainty Principle',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy2o7s3'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0193');
update kairo.questions
set topic = 'Elementary Modern Physics',
    subtopic = 'Thermionic Emission',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phykkv9r'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0182');
update kairo.questions
set topic = 'Nuclear Physics',
    subtopic = 'Radioactive Decay and Half-Life',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyftmtt'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0185');
update kairo.questions
set topic = 'Nuclear Physics',
    subtopic = 'Properties of Alpha, Beta and Gamma Radiation',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyqlgzu'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0186', 'physics_0188');
update kairo.questions
set topic = 'Nuclear Physics',
    subtopic = 'Nuclear Fission',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyi1b0z'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0187');
update kairo.questions
set topic = 'Nuclear Physics',
    subtopic = 'Nuclear Fusion',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy3nx39'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0191');
update kairo.questions
set topic = 'Nuclear Physics',
    subtopic = 'Radioactive Decay Equations',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyrbsv5'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0194', 'physics_0195');
update kairo.questions
set topic = 'Energy Quantization',
    subtopic = 'The Photoelectric Effect',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phy5psq0'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0183');
update kairo.questions
set topic = 'Energy Quantization',
    subtopic = 'Stopping Potential',
    concepts_tested = (
      select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('phyoxfq8'::text)))
      from jsonb_array_elements(concepts_tested) elem
    )
where id in ('physics_0184');

-- 3. Fix topic on the 28 legacy per-topic anchor concepts (kept, not deleted)
update kairo.concepts set topic = 'Current Electricity' where id = '5qzbmg';
update kairo.concepts set topic = 'Current Electricity' where id = 'a69fu';
update kairo.concepts set topic = 'Elementary Modern Physics' where id = 'ba5070';
update kairo.concepts set topic = 'Semiconductors' where id = '1jknnw';
update kairo.concepts set topic = 'Refraction of Light' where id = '3kwo9o';
update kairo.concepts set topic = 'Electromagnetic Induction' where id = 'q7e71m';
update kairo.concepts set topic = 'Measurements and Units' where id = '5bvyd8';
update kairo.concepts set topic = 'Change of State' where id = 'yor4xa';
update kairo.concepts set topic = 'Alternating Current' where id = '138vlu';
update kairo.concepts set topic = 'Kinetic Theory of Matter' where id = 'l7dm74';
update kairo.concepts set topic = 'Propagation of Sound Waves' where id = 'o53l4s';
update kairo.concepts set topic = 'Elasticity' where id = '13qtm';
update kairo.concepts set topic = 'Temperature and its Measurement' where id = 'xwpyas';

-- 4. Lock topic to the 39 official JAMB Physics topics, matching the
-- Chemistry/Biology precedent
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'questions_physics_topic_syllabus_check') then
    alter table kairo.questions add constraint questions_physics_topic_syllabus_check
    check (subject <> 'Physics' or topic = any (array[
        'Measurements and Units',
        'Scalars and Vectors',
        'Motion',
        'Gravitational Field',
        'Equilibrium of Forces',
        'Work, Energy and Power',
        'Friction',
        'Simple Machines',
        'Elasticity',
        'Pressure',
        'Liquids at Rest',
        'Temperature and its Measurement',
        'Thermal Expansion',
        'Gas Laws',
        'Quantity of Heat',
        'Change of State',
        'Vapours',
        'Kinetic Theory of Matter',
        'Heat Transfer',
        'Waves',
        'Propagation of Sound Waves',
        'Light Energy',
        'Reflection of Light',
        'Refraction of Light',
        'Optical Instruments',
        'Dispersion of Light and Colours',
        'Electrostatics',
        'Capacitors',
        'Electric Cells',
        'Current Electricity',
        'Electrical Energy and Power',
        'Electrical Measuring Instruments',
        'Magnetic Field',
        'Electromagnetic Induction',
        'Alternating Current',
        'Semiconductors',
        'Elementary Modern Physics',
        'Nuclear Physics',
        'Energy Quantization'
    ]::text[]));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'concepts_physics_topic_syllabus_check') then
    alter table kairo.concepts add constraint concepts_physics_topic_syllabus_check
    check (subject <> 'Physics' or topic = any (array[
        'Measurements and Units',
        'Scalars and Vectors',
        'Motion',
        'Gravitational Field',
        'Equilibrium of Forces',
        'Work, Energy and Power',
        'Friction',
        'Simple Machines',
        'Elasticity',
        'Pressure',
        'Liquids at Rest',
        'Temperature and its Measurement',
        'Thermal Expansion',
        'Gas Laws',
        'Quantity of Heat',
        'Change of State',
        'Vapours',
        'Kinetic Theory of Matter',
        'Heat Transfer',
        'Waves',
        'Propagation of Sound Waves',
        'Light Energy',
        'Reflection of Light',
        'Refraction of Light',
        'Optical Instruments',
        'Dispersion of Light and Colours',
        'Electrostatics',
        'Capacitors',
        'Electric Cells',
        'Current Electricity',
        'Electrical Energy and Power',
        'Electrical Measuring Instruments',
        'Magnetic Field',
        'Electromagnetic Induction',
        'Alternating Current',
        'Semiconductors',
        'Elementary Modern Physics',
        'Nuclear Physics',
        'Energy Quantization'
    ]::text[]));
  end if;
end $$;

-- 5. Safety net
do $$
declare bad_count int;
begin
  select count(*) into bad_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  where q.subject = 'Physics'
  and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
  if bad_count > 0 then
    raise exception 'phy_remap: % question(s) left with a dangling conceptId', bad_count;
  end if;
end $$;

commit;