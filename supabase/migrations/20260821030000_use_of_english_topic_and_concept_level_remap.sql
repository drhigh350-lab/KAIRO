begin;

-- Align Use of English to its official JAMB structure. Per the user's
-- explicit note, this subject is NOT organized like the four science
-- subjects: JAMB divides it into 3 sections (A. Comprehension/Summary,
-- B. Lexis and Structure, C. Oral Forms), each listing several named
-- topics. Those 27 listed topics (9 + 11 + 7) become the canonical
-- `topic` field, matching the topic-level granularity used for
-- Chemistry/Biology/Physics/Mathematics.
--
-- The existing 61 raw topic strings (e.g. "Basic Grammar & Concord
-- (Subjunctive)", "Additional Grammar - Subjunctive") were themselves
-- already fine-grained per-grammar-point labels, so each becomes a
-- `subtopic`/concept rather than needing a fresh concept-level pass.
-- `subtopic` was null on every one of the 200 questions -- this fills it
-- in from that existing detail.
--
-- 6 pairs of concepts turned out to be genuine duplicates of the same
-- grammar point seeded twice under different naming schemes ("Basic
-- Grammar & Concord (Subjunctive)" vs "Additional Grammar - Subjunctive",
-- and likewise for Indirect Questions, Reported Speech, Relative
-- Pronouns, Concord, and Tense & Aspect) -- confirmed by reading their
-- stems, which test the identical point. These are consolidated using
-- the same FK-safe merge pattern used for the Chemistry consolidation
-- (dedupe concept_states, relink attempts, then delete the loser).
--
-- 2 concepts covered genuinely mixed content ("Oral Forms - Rhymes &
-- Homophones" mixed rhyme and homophone items; "Oral Forms - Mixed"
-- mixed silent-letter/consonant/vowel items) and are split per-question
-- by stem into their correct distinct topics.

-- 1. New concept for the one genuine content gap (Homophones, split out
-- of the former "Rhymes & Homophones" bucket)
insert into kairo.concepts (id, name, subject, topic, subtopic, difficulty_weight, dependency_ids, question_pool_ids)
values ('uoehomo1', 'Homophones', 'Use of English', 'Homophones', 'Homophones', 1.0, '{}', '{}')
on conflict (id) do nothing;

-- 2. Consolidate 6 duplicate concept pairs (same grammar point seeded twice)
-- 2a. Concord: 59ii9v (10 questions) absorbs k4qxat (2 questions)
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('59ii9v'::text))) from jsonb_array_elements(concepts_tested) elem)
where id in ('use_of_english_0171', 'use_of_english_0173');
delete from kairo.concept_states cs_loser using kairo.concept_states cs_canon
where cs_loser.concept_id = 'k4qxat' and cs_canon.concept_id = '59ii9v' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '59ii9v' where concept_id = 'k4qxat';
update kairo.attempts set concept_id = '59ii9v' where concept_id = 'k4qxat';
delete from kairo.concepts where id = 'k4qxat';

-- 2b. Indirect Questions: qz2hwj absorbs ippl85
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('qz2hwj'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0075';
delete from kairo.concept_states cs_loser using kairo.concept_states cs_canon
where cs_loser.concept_id = 'ippl85' and cs_canon.concept_id = 'qz2hwj' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'qz2hwj' where concept_id = 'ippl85';
update kairo.attempts set concept_id = 'qz2hwj' where concept_id = 'ippl85';
delete from kairo.concepts where id = 'ippl85';

-- 2c. Subjunctive: j1zj6r (3 questions) absorbs 6ccxo3 (1 question)
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('j1zj6r'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0165';
delete from kairo.concept_states cs_loser using kairo.concept_states cs_canon
where cs_loser.concept_id = '6ccxo3' and cs_canon.concept_id = 'j1zj6r' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'j1zj6r' where concept_id = '6ccxo3';
update kairo.attempts set concept_id = 'j1zj6r' where concept_id = '6ccxo3';
delete from kairo.concepts where id = '6ccxo3';

-- 2d. Reported Speech: k1pf7b absorbs nvhyo3
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('k1pf7b'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0069';
delete from kairo.concept_states cs_loser using kairo.concept_states cs_canon
where cs_loser.concept_id = 'nvhyo3' and cs_canon.concept_id = 'k1pf7b' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'k1pf7b' where concept_id = 'nvhyo3';
update kairo.attempts set concept_id = 'k1pf7b' where concept_id = 'nvhyo3';
delete from kairo.concepts where id = 'nvhyo3';

-- 2e. Relative Pronouns: 85f3u3 absorbs 40c7c3
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('85f3u3'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0067';
delete from kairo.concept_states cs_loser using kairo.concept_states cs_canon
where cs_loser.concept_id = '40c7c3' and cs_canon.concept_id = '85f3u3' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = '85f3u3' where concept_id = '40c7c3';
update kairo.attempts set concept_id = '85f3u3' where concept_id = '40c7c3';
delete from kairo.concepts where id = '40c7c3';

-- 2f. Tense & Aspect: h5mkn9 (4 questions) absorbs jn2akb (1 question)
update kairo.questions
set concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('h5mkn9'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0076';
delete from kairo.concept_states cs_loser using kairo.concept_states cs_canon
where cs_loser.concept_id = 'jn2akb' and cs_canon.concept_id = 'h5mkn9' and cs_canon.student_id = cs_loser.student_id;
update kairo.concept_states set concept_id = 'h5mkn9' where concept_id = 'jn2akb';
update kairo.attempts set concept_id = 'h5mkn9' where concept_id = 'jn2akb';
delete from kairo.concepts where id = 'jn2akb';

-- 3. Rename + retopic the surviving concepts (61 originally, minus the 6 losers deleted above)
update kairo.concepts set name = 'Comprehension and Summary', topic = 'Comprehension', subtopic = 'Comprehension and Summary' where id = '3r5lb7';
update kairo.concepts set name = 'Mini-Comprehension Practice', topic = 'Comprehension', subtopic = 'Mini-Comprehension Practice' where id = 'sgpwwt';
update kairo.concepts set name = 'Novel Comprehension', topic = 'The Lekki Headmaster — Kabir Alabi Garba', subtopic = 'Novel Comprehension' where id = 'gjew7z';

update kairo.concepts set name = 'Figures of Speech', topic = 'Idiomatic expressions', subtopic = 'Figures of Speech' where id = 'lwt4xp';
update kairo.concepts set name = 'Sentence Interpretation (Idiom)', topic = 'Idiomatic expressions', subtopic = 'Sentence Interpretation (Idiom)' where id = '91ez3x';
update kairo.concepts set name = 'Phrasal Verbs', topic = 'Idiomatic expressions', subtopic = 'Phrasal Verbs' where id = '1fuv27';

update kairo.concepts set name = 'Antonyms', topic = 'Synonyms/antonyms', subtopic = 'Antonyms' where id = 'v4agon';
update kairo.concepts set name = 'Synonyms', topic = 'Synonyms/antonyms', subtopic = 'Synonyms' where id = 'r0mfcp';

update kairo.concepts set name = 'Word Classes and Functions', topic = 'Word classes', subtopic = 'Word Classes and Functions' where id = '8sadbd';
update kairo.concepts set name = 'Clause Types', topic = 'Sentence structure', subtopic = 'Clause Types' where id = 'uvri7l';

update kairo.concepts set name = 'Concord (Subject-Verb Agreement)', topic = 'Grammatical usage', subtopic = 'Concord (Subject-Verb Agreement)' where id = '59ii9v';
update kairo.concepts set name = 'Comparatives', topic = 'Grammatical usage', subtopic = 'Comparatives' where id = '1t5q91';
update kairo.concepts set name = 'Conditionals', topic = 'Grammatical usage', subtopic = 'Conditionals' where id = 'fbl55l';
update kairo.concepts set name = 'Gerunds after Prepositions', topic = 'Grammatical usage', subtopic = 'Gerunds after Prepositions' where id = 'e1a7oj';
update kairo.concepts set name = 'Indirect Questions', topic = 'Grammatical usage', subtopic = 'Indirect Questions' where id = 'qz2hwj';
update kairo.concepts set name = 'Infinitives', topic = 'Grammatical usage', subtopic = 'Infinitives' where id = '6t0lib';
update kairo.concepts set name = 'Question Tags', topic = 'Grammatical usage', subtopic = 'Question Tags' where id = 'fmyji5';
update kairo.concepts set name = 'Relative Pronouns', topic = 'Grammatical usage', subtopic = 'Relative Pronouns' where id = '85f3u3';
update kairo.concepts set name = 'Reported Speech', topic = 'Grammatical usage', subtopic = 'Reported Speech' where id = 'k1pf7b';
update kairo.concepts set name = 'Semi-modals', topic = 'Grammatical usage', subtopic = 'Semi-modals' where id = 'h8hnct';
update kairo.concepts set name = 'Subjunctive', topic = 'Grammatical usage', subtopic = 'Subjunctive' where id = 'j1zj6r';
update kairo.concepts set name = 'Tense & Aspect', topic = 'Grammatical usage', subtopic = 'Tense & Aspect' where id = 'h5mkn9';
update kairo.concepts set name = 'Tense Sequencing', topic = 'Grammatical usage', subtopic = 'Tense Sequencing' where id = 'jv7kpv';
update kairo.concepts set name = 'Tense & Aspect (Conditionals)', topic = 'Grammatical usage', subtopic = 'Tense & Aspect (Conditionals)' where id = 'kkrrnh';
update kairo.concepts set name = 'Causative Verbs', topic = 'Grammatical usage', subtopic = 'Causative Verbs' where id = 'r8uqn9';
update kairo.concepts set name = 'Comparatives/Superlatives', topic = 'Grammatical usage', subtopic = 'Comparatives/Superlatives' where id = 'cedms5';
update kairo.concepts set name = 'Concord (Collective Nouns)', topic = 'Grammatical usage', subtopic = 'Concord (Collective Nouns)' where id = 'q64m7x';
update kairo.concepts set name = 'Concord (Uncountable Nouns)', topic = 'Grammatical usage', subtopic = 'Concord (Uncountable Nouns)' where id = 'd2tayt';
update kairo.concepts set name = 'Gerunds vs Infinitives', topic = 'Grammatical usage', subtopic = 'Gerunds vs Infinitives' where id = 'chpexv';
update kairo.concepts set name = 'Inversion', topic = 'Grammatical usage', subtopic = 'Inversion' where id = 'nn0tzl';
update kairo.concepts set name = 'Irregular Plurals', topic = 'Grammatical usage', subtopic = 'Irregular Plurals' where id = 'le9str';
update kairo.concepts set name = 'Modal Perfect (Ought to)', topic = 'Grammatical usage', subtopic = 'Modal Perfect (Ought to)' where id = 'i1kkil';
update kairo.concepts set name = 'Modal Verbs', topic = 'Grammatical usage', subtopic = 'Modal Verbs' where id = 'jvnoh9';
update kairo.concepts set name = 'Prepositional Collocations', topic = 'Grammatical usage', subtopic = 'Prepositional Collocations' where id = 'cepp3x';
update kairo.concepts set name = 'Prepositions', topic = 'Grammatical usage', subtopic = 'Prepositions' where id = '6de5er';
update kairo.concepts set name = 'Pronoun Agreement', topic = 'Grammatical usage', subtopic = 'Pronoun Agreement' where id = '3fkjw3';
update kairo.concepts set name = 'Pronoun Case', topic = 'Grammatical usage', subtopic = 'Pronoun Case' where id = 'ytbzj7';
update kairo.concepts set name = 'Tense', topic = 'Grammatical usage', subtopic = 'Tense' where id = 'hbp4zb';
update kairo.concepts set name = 'Tense (Present Perfect Continuous)', topic = 'Grammatical usage', subtopic = 'Tense (Present Perfect Continuous)' where id = 'y6sb8d';
update kairo.concepts set name = 'Tense, Mood & Special Constructions', topic = 'Grammatical usage', subtopic = 'Tense, Mood & Special Constructions' where id = '4j3g2n';
update kairo.concepts set name = 'Used to / Be Used To', topic = 'Grammatical usage', subtopic = 'Used to / Be Used To' where id = '158w1v';

update kairo.concepts set name = 'Affect/Effect', topic = 'Appropriate word choice', subtopic = 'Affect/Effect' where id = '376rdp';
update kairo.concepts set name = 'Principal/Principle', topic = 'Appropriate word choice', subtopic = 'Principal/Principle' where id = 'a1x5nh';
update kairo.concepts set name = 'Standard/Criterion', topic = 'Appropriate word choice', subtopic = 'Standard/Criterion' where id = 'd2roe1';
update kairo.concepts set name = 'Fewer/Less', topic = 'Appropriate word choice', subtopic = 'Fewer/Less' where id = 'c42c4d';

update kairo.concepts set name = 'Spelling', topic = 'Error identification', subtopic = 'Spelling' where id = 'b6z0ov';
update kairo.concepts set name = 'Punctuation', topic = 'Error identification', subtopic = 'Punctuation' where id = '9qz88z';
update kairo.concepts set name = 'Apostrophes', topic = 'Error identification', subtopic = 'Apostrophes' where id = 'dgluvx';
update kairo.concepts set name = 'Semicolons', topic = 'Error identification', subtopic = 'Semicolons' where id = 'rlf445';

update kairo.concepts set name = 'Vowel Sounds', topic = 'Vowels', subtopic = 'Vowel Sounds' where id = 'namskj';
update kairo.concepts set name = 'Consonant Sounds', topic = 'Consonants', subtopic = 'Consonant Sounds' where id = '3p5hul';
update kairo.concepts set name = 'Word Stress', topic = 'Stress', subtopic = 'Word Stress' where id = 'stfgmb';
update kairo.concepts set name = 'Syllabification', topic = 'Stress', subtopic = 'Syllabification' where id = 'gh7ewf';
update kairo.concepts set name = 'Stress in Loanwords', topic = 'Stress', subtopic = 'Stress in Loanwords' where id = 'de2tcd';
update kairo.concepts set name = 'Emphatic Stress', topic = 'Stress', subtopic = 'Emphatic Stress' where id = 'odd0o9';
update kairo.concepts set name = 'Rhymes', topic = 'Rhymes', subtopic = 'Rhymes' where id = 'uqz7iv';
update kairo.concepts set name = 'Spelling-Pronunciation Mismatch', topic = 'Pronunciation distinctions', subtopic = 'Spelling-Pronunciation Mismatch' where id = 'wokn7l';

-- 4. Question topic/subtopic/concept realignment (grouped by final topic)
update kairo.questions set topic = 'Comprehension', subtopic = 'Comprehension and Summary' where topic = 'Comprehension & Summary';
update kairo.questions set topic = 'Comprehension', subtopic = 'Mini-Comprehension Practice' where topic = 'Final Practice - Mini-Comprehension';
update kairo.questions set topic = 'The Lekki Headmaster — Kabir Alabi Garba', subtopic = 'Novel Comprehension' where topic = 'The Lekki Headmaster (Novel)';

update kairo.questions set topic = 'Idiomatic expressions', subtopic = 'Figures of Speech' where topic = 'Figurative & Idiomatic Usage';
update kairo.questions set topic = 'Idiomatic expressions', subtopic = 'Sentence Interpretation (Idiom)' where topic = 'Lexis & Structure - Sentence Interpretation (Idiom)';
update kairo.questions set topic = 'Idiomatic expressions', subtopic = 'Phrasal Verbs' where id = 'use_of_english_0168';

update kairo.questions set topic = 'Synonyms/antonyms', subtopic = 'Antonyms' where topic = 'Lexis & Structure - Antonyms';
update kairo.questions set topic = 'Synonyms/antonyms', subtopic = 'Synonyms' where topic = 'Lexis & Structure - Synonyms';

update kairo.questions set topic = 'Word classes', subtopic = 'Word Classes and Functions' where topic = 'Word Classes & Functions';
update kairo.questions set topic = 'Sentence structure', subtopic = 'Clause Types' where topic = 'Word Classes & Functions (Clauses)';

update kairo.questions set topic = 'Grammatical usage', subtopic = 'Concord (Subject-Verb Agreement)' where topic in ('Basic Grammar & Concord', 'Additional Grammar - Concord');
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Comparatives' where topic = 'Basic Grammar & Concord (Comparatives)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Conditionals' where topic = 'Basic Grammar & Concord (Conditionals)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Gerunds after Prepositions' where topic = 'Basic Grammar & Concord (Gerunds after prepositions)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Indirect Questions' where topic in ('Basic Grammar & Concord (Indirect Questions)', 'Additional Grammar - Indirect Questions');
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Infinitives' where topic = 'Basic Grammar & Concord (Infinitives)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Question Tags' where topic = 'Basic Grammar & Concord (Question Tags)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Relative Pronouns' where topic in ('Basic Grammar & Concord (Relative Pronouns)', 'Additional Grammar - Relative Pronouns');
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Reported Speech' where topic in ('Basic Grammar & Concord (Reported Speech)', 'Additional Grammar - Reported Speech');
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Semi-modals' where topic = 'Basic Grammar & Concord (Semi-modals)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Subjunctive' where topic in ('Basic Grammar & Concord (Subjunctive)', 'Additional Grammar - Subjunctive');
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Tense & Aspect' where topic in ('Basic Grammar & Concord (Tense & Aspect)', 'Tense & Aspect');
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Tense Sequencing' where topic = 'Basic Grammar & Concord (Tense Sequencing)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Tense & Aspect (Conditionals)' where topic = 'Tense & Aspect (Conditionals)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Causative Verbs' where topic = 'Additional Grammar - Causative Verbs';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Comparatives/Superlatives' where topic = 'Additional Grammar - Comparatives/Superlatives';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Concord (Collective Nouns)' where topic = 'Additional Grammar - Concord (Collective Nouns)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Concord (Uncountable Nouns)' where topic = 'Additional Grammar - Concord (Uncountable Nouns)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Gerunds vs Infinitives' where topic = 'Additional Grammar - Gerunds vs Infinitives';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Inversion' where topic = 'Additional Grammar - Inversion';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Irregular Plurals' where topic = 'Additional Grammar - Irregular Plurals';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Modal Perfect (Ought to)' where topic = 'Additional Grammar - Modal Perfect (Ought to)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Modal Verbs' where topic = 'Additional Grammar - Modal Verbs';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Prepositional Collocations' where topic = 'Additional Grammar - Prepositional Collocations';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Prepositions' where topic = 'Additional Grammar - Prepositions';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Pronoun Agreement' where topic = 'Additional Grammar - Pronoun Agreement';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Pronoun Case' where topic = 'Additional Grammar - Pronoun Case';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Tense' where topic = 'Additional Grammar - Tense';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Tense (Present Perfect Continuous)' where topic = 'Additional Grammar - Tense (Present Perfect Continuous)';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Tense, Mood & Special Constructions' where topic = 'Additional Grammar - Tense, Mood & Special Constructions';
update kairo.questions set topic = 'Grammatical usage', subtopic = 'Used to / Be Used To' where topic = 'Additional Grammar - Used to / Be used to';

update kairo.questions set topic = 'Appropriate word choice', subtopic = 'Affect/Effect' where topic = 'Additional Grammar - Word Usage (Affect/Effect)';
update kairo.questions set topic = 'Appropriate word choice', subtopic = 'Principal/Principle' where topic = 'Additional Grammar - Word Usage (Principal/Principle)';
update kairo.questions set topic = 'Appropriate word choice', subtopic = 'Standard/Criterion' where topic = 'Additional Grammar - Word Usage (Standard/Criterion)';
update kairo.questions set topic = 'Appropriate word choice', subtopic = 'Fewer/Less' where topic = 'Additional Grammar - Fewer/Less';

update kairo.questions set topic = 'Error identification', subtopic = 'Spelling' where topic = 'Mechanics & Spelling';
update kairo.questions set topic = 'Error identification', subtopic = 'Punctuation' where topic = 'Mechanics & Punctuation';
update kairo.questions set topic = 'Error identification', subtopic = 'Apostrophes' where topic = 'Mechanics & Punctuation (Apostrophes)';
update kairo.questions set topic = 'Error identification', subtopic = 'Semicolons' where topic = 'Mechanics & Punctuation (Semicolons)';

update kairo.questions set topic = 'Vowels', subtopic = 'Vowel Sounds' where topic = 'Oral Forms - Vowels';
update kairo.questions set topic = 'Consonants', subtopic = 'Consonant Sounds' where topic = 'Oral Forms - Consonants';
update kairo.questions set topic = 'Stress', subtopic = 'Word Stress' where topic = 'Oral Forms - Word Stress';
update kairo.questions set topic = 'Stress', subtopic = 'Syllabification' where topic = 'Oral Forms - Word Stress (Syllabification)';
update kairo.questions set topic = 'Stress', subtopic = 'Stress in Loanwords' where topic = 'Oral Forms - Word Stress (Loanwords)';
update kairo.questions set topic = 'Stress', subtopic = 'Emphatic Stress' where topic = 'Oral Forms - Emphatic Stress';

-- Rhymes & Homophones split: 0128/0130 rhyme questions keep uqz7iv (now "Rhymes");
-- 0129/0154 homophone questions move to the new Homophones concept
update kairo.questions set topic = 'Rhymes', subtopic = 'Rhymes' where id in ('use_of_english_0128', 'use_of_english_0130');
update kairo.questions
set topic = 'Homophones', subtopic = 'Homophones',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('uoehomo1'::text))) from jsonb_array_elements(concepts_tested) elem)
where id in ('use_of_english_0129', 'use_of_english_0154');

-- Oral Forms - Mixed split by stem: 0146/0147/0149 are letter-vs-sound
-- mismatches (silent letters, inconsistent letter pronunciation) -> keep
-- wokn7l (now "Spelling-Pronunciation Mismatch" under Pronunciation
-- distinctions); 0148 tests actual consonant-sound identification ->
-- reassign to the Consonants concept; 0150 tests vowel-sound grouping ->
-- reassign to the Vowels concept.
update kairo.questions set topic = 'Pronunciation distinctions', subtopic = 'Spelling-Pronunciation Mismatch'
where id in ('use_of_english_0146', 'use_of_english_0147', 'use_of_english_0149');
update kairo.questions
set topic = 'Consonants', subtopic = 'Consonant Sounds',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('3p5hul'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0148';
update kairo.questions
set topic = 'Vowels', subtopic = 'Vowel Sounds',
    concepts_tested = (select jsonb_agg(jsonb_set(elem, '{conceptId}', to_jsonb('namskj'::text))) from jsonb_array_elements(concepts_tested) elem)
where id = 'use_of_english_0150';

-- 5. Lock topic to the 27 official JAMB Use of English topics (3 sections, flattened)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'questions_use_of_english_topic_syllabus_check') then
    alter table kairo.questions add constraint questions_use_of_english_topic_syllabus_check
    check (subject <> 'Use of English' or topic = any (array[
        'Description','Narration','Exposition','Argumentation/Persuasion','Comprehension',
        'Vocabulary and expressions in context','Coherence and logical reasoning',
        'The Lekki Headmaster — Kabir Alabi Garba','Synthesis of ideas from passages',
        'Vocabulary','Word classes','Sentence structure','Grammatical usage','Idiomatic expressions',
        'Appropriate word choice','Synonyms/antonyms','Register','Sentence completion',
        'Error identification','Structural relationships',
        'Vowels','Consonants','Rhymes','Stress','Intonation','Homophones','Pronunciation distinctions'
    ]::text[]));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'concepts_use_of_english_topic_syllabus_check') then
    alter table kairo.concepts add constraint concepts_use_of_english_topic_syllabus_check
    check (subject <> 'Use of English' or topic = any (array[
        'Description','Narration','Exposition','Argumentation/Persuasion','Comprehension',
        'Vocabulary and expressions in context','Coherence and logical reasoning',
        'The Lekki Headmaster — Kabir Alabi Garba','Synthesis of ideas from passages',
        'Vocabulary','Word classes','Sentence structure','Grammatical usage','Idiomatic expressions',
        'Appropriate word choice','Synonyms/antonyms','Register','Sentence completion',
        'Error identification','Structural relationships',
        'Vowels','Consonants','Rhymes','Stress','Intonation','Homophones','Pronunciation distinctions'
    ]::text[]));
  end if;
end $$;

-- 6. Safety net
do $$
declare bad_count int;
declare mismatch_count int;
declare null_subtopic_count int;
begin
  select count(*) into bad_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  where q.subject = 'Use of English'
  and not exists (select 1 from kairo.concepts c where c.id = e->>'conceptId');
  if bad_count > 0 then
    raise exception 'uoe_remap: % question(s) left with a dangling conceptId', bad_count;
  end if;

  select count(*) into mismatch_count
  from kairo.questions q
  cross join lateral jsonb_array_elements(q.concepts_tested) e
  join kairo.concepts c on c.id = e->>'conceptId'
  where q.subject = 'Use of English' and q.topic <> c.topic;
  if mismatch_count > 0 then
    raise exception 'uoe_remap: % question(s) still have topic <> concept.topic', mismatch_count;
  end if;

  select count(*) into null_subtopic_count from kairo.questions where subject = 'Use of English' and subtopic is null;
  if null_subtopic_count > 0 then
    raise exception 'uoe_remap: % question(s) still have a null subtopic', null_subtopic_count;
  end if;
end $$;

commit;
