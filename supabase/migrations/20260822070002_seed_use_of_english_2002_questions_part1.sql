INSERT INTO kairo.questions (id, subject, topic, subtopic, learning_objective, concepts_tested, prerequisite_concepts, difficulty_rating, cognitive_level, estimated_solving_time_sec, reading_load, calculation_load, distractors, skills_assessed, source, year, exam_body, related_question_ids, stem, options, correct_option, explanation, lifecycle_state, empirical_stats) VALUES
('use_of_english_0201', 'Use of English', 'Synonyms/antonyms', 'Antonyms', NULL, '[{"weight": 1, "conceptId": "v4agon"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Embarrassing'' describes an awkward feeling, not the moral opposite of dishonourable conduct.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Extraordinary'' is unrelated to the moral dimension the word ''ignoble'' tests.", "misconceptionId": "guessed_no_reasoning"}, {"option": "D", "explanation": "''Dishonourable'' is a synonym of ''ignoble'', not its opposite — a classic synonym/antonym mix-up.", "misconceptionId": "misunderstood_terminology"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option opposite in meaning to the underlined word(s).

The principal took exception to the

ignoble

role the teacher played in the matter?', '[{"label": "A", "text": "embarrassing", "isCorrect": false}, {"label": "B", "text": "honourable", "isCorrect": true}, {"label": "C", "text": "extraordinary", "isCorrect": false}, {"label": "D", "text": "dishonourable", "isCorrect": false}]'::jsonb, 'B', '''Ignoble'' means dishonourable or base; its opposite is ''honourable''.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0202', 'Use of English', 'Synonyms/antonyms', 'Antonyms', NULL, '[{"weight": 1, "conceptId": "v4agon"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "B", "explanation": "''Economy'' is a near-synonym of frugality (careful use of resources), not its opposite.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Recklessness'' describes carelessness in general, not specifically wasteful spending — close but not the precise antonym.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "''Prudence'' is essentially a synonym of frugality (careful judgement), not its opposite.", "misconceptionId": "misunderstood_terminology"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option opposite in meaning to the underlined word(s).

The high cost of living these days calls for a lot of

frugality

?', '[{"label": "A", "text": "extravagance", "isCorrect": true}, {"label": "B", "text": "economy", "isCorrect": false}, {"label": "C", "text": "recklessness", "isCorrect": false}, {"label": "D", "text": "prudence", "isCorrect": false}]'::jsonb, 'A', '''Frugality'' means careful, economical use of money; its direct opposite is ''extravagance'' (wasteful spending).', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0203', 'Use of English', 'Stress', 'Emphatic Stress', NULL, '[{"weight": 1, "conceptId": "odd0o9"}]'::jsonb, '{}', 2, 'application', 60, 'low', 'none', '[{"option": "A", "explanation": "Swaps the subject ''university'' for ''campus'' instead of only contrasting the stressed word.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "Swaps ''closed'' for ''open'', changing the meaning of the sentence instead of just the stressed adverb.", "misconceptionId": "confused_similar_concepts"}, {"option": "D", "explanation": "Uses ''college'' instead of ''university'' and keeps ''temporarily'' instead of contrasting it with ''permanently''.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'The word in capital letters has the emphatic stress. Choose the option that best fits the expression in the sentence.

The university has been TEMPORARILY closed.', '[{"label": "A", "text": "Has the campus been permanently closed?", "isCorrect": false}, {"label": "B", "text": "Has the university been permanently open?", "isCorrect": false}, {"label": "C", "text": "Has the university been permanently closed?", "isCorrect": true}, {"label": "D", "text": "Has the college been temporarily closed?", "isCorrect": false}]'::jsonb, 'C', 'The stress on TEMPORARILY signals a contrast with its opposite, ''permanently'', while every other word in the sentence (subject ''university'', verb ''closed'') must stay unchanged.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0204', 'Use of English', 'Synonyms/antonyms', 'Synonyms', NULL, '[{"weight": 1, "conceptId": "r0mfcp"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "B", "explanation": "''Erroneous'' means factually wrong, a different concept from being irrelevant to the topic.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Relevant'' is the opposite of extraneous, not a synonym — a classic antonym/synonym confusion.", "misconceptionId": "misunderstood_terminology"}, {"option": "D", "explanation": "''Main'' also means the opposite (central/essential) of extraneous (unimportant/peripheral).", "misconceptionId": "misunderstood_terminology"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option nearest in meaning to the underlined word(s).

I wonder what will be left of his essay when the

extraneous

material is deleted?', '[{"label": "A", "text": "irrelevant", "isCorrect": true}, {"label": "B", "text": "erroneous", "isCorrect": false}, {"label": "C", "text": "relevant", "isCorrect": false}, {"label": "D", "text": "main", "isCorrect": false}]'::jsonb, 'A', '''Extraneous'' means irrelevant or not essential to the subject; ''irrelevant'' is its nearest match.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0205', 'Use of English', 'Grammatical usage', 'Prepositional Collocations', NULL, '[{"weight": 1, "conceptId": "cepp3x"}]'::jsonb, '{}', 2, 'application', 60, 'low', 'none', '[{"option": "A", "explanation": "Neither the preposition ''at'' nor the noun ''equality'' forms the standard idiom.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''In...standing'' sounds plausible but is not the fixed collocation; the correct preposition is ''on'', not ''in''.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "''In...advantage'' is not a recognised idiom and doesn''t fit the intended meaning of equal treatment.", "misconceptionId": "guessed_no_reasoning"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Fill each gap with the most appropriate option from the lists provided.

One advantage of the English language in Nigeria is that it puts everyone ........ a common ........ ?', '[{"label": "A", "text": "at / equality", "isCorrect": false}, {"label": "B", "text": "on / footing", "isCorrect": true}, {"label": "C", "text": "in / standing", "isCorrect": false}, {"label": "D", "text": "in / advantage", "isCorrect": false}]'::jsonb, 'B', 'The fixed idiom is ''to put someone on a common footing'' (i.e. on equal terms).', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0206', 'Use of English', 'Comprehension', 'Cloze/Gap-fill in Context', NULL, '[{"weight": 1, "conceptId": "hbrpoi"}]'::jsonb, '{}', 2, 'application', 60, 'high', 'none', '[{"option": "A", "explanation": "''Research'' is broader than the specific procedure being referred back to.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Tool'' suggests a physical instrument, not the described procedure of using controls.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "''Rationale'' means the reasoning behind something, not the procedure itself.", "misconceptionId": "misunderstood_terminology"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'The passage below has gaps numbered 11 to 20. Immediately following each gap, four options are provided. Choose the most appropriate option for each gap.

It is the business of the scientist to accumulate knowledge about the universe and all that is in it and to find if he is able, common

……11…..[A. experiment B. instruments C. approaches D. factors]

which underlie and account for the facts that he knows. He chooses when he can, the method of the controlled

…….12…..[A. respondent B. experiment C. system D. data]

. If he wants to find out the effect of light on growing plants, he takes many plants, as alike as possible. Some he stands in the sun, some in the shade, some in the dark, all the time keeping all other

.....13.....[A. studies B. procedures C. objects D. conditions]

(temperature, moisture, nourishments) the same. In this way, by keeping other variables

……..14……[A. constant B. good C. dark D. natural]

and by varying the light only, the effect of light on plants can be clearly seen. This

…….15…..[A. research B. method C. tool D. rationale]

of using ‘controls’ can be applied to a variety of situations and can be used to find the answers to questions as widely different as ‘must moisture be present if

…….16….[A. an alloy B. gold C. bar D. iron]

is to rust?’ and which variety of beans give the greatest yield in one

……17…..[A. climate B. period C. season D. weather]?

In the course of his

……18…..[A. finding B. queries C. experiment D. inquiries]

, the scientist may find what he thinks is one common explanation for an increasing number of facts the explanation, if it seems consistently to fit the various facts, is called

…….19……[A. an antithesis B. a principle C. a thesis D. a hypothesis]

. If this continues to stand the test of numerous experiments and remains unshaken, it becomes a

……20…..[A. deduction B. law C. notion D. thesis].

In question number 15 above, choose the best option from letters A-D that best completes the gap.', '[{"label": "A", "text": "research", "isCorrect": false}, {"label": "B", "text": "method", "isCorrect": true}, {"label": "C", "text": "tool", "isCorrect": false}, {"label": "D", "text": "rationale", "isCorrect": false}]'::jsonb, 'B', 'The passage refers back to ''the method of the controlled experiment'' described earlier, so ''method'' is the word that logically continues that thread: ''This method of using controls...''.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0207', 'Use of English', 'Consonants', 'Consonant Sounds', NULL, '[{"weight": 1, "conceptId": "3p5hul"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "In ''question'', the ''t'' is part of the /tʃ/ cluster (''-stion''), a different consonant sound from a plain /t/.", "misconceptionId": "confused_similar_concepts"}, {"option": "B", "explanation": "In ''castle'', the ''t'' is silent, not pronounced /t/ at all.", "misconceptionId": "misunderstood_terminology"}, {"option": "D", "explanation": "In ''lotion'', the ''t'' is pronounced /ʃ/ as part of ''-tion'', not /t/.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option that has the same consonant sound as the one represented by the underlined letter(s).

Preach

ed

?', '[{"label": "A", "text": "question", "isCorrect": false}, {"label": "B", "text": "castle", "isCorrect": false}, {"label": "C", "text": "walked", "isCorrect": true}, {"label": "D", "text": "lotion", "isCorrect": false}]'::jsonb, 'C', 'The ''-ed'' in ''preached'' is pronounced /t/ (after the voiceless ''ch''). ''Walked'' also ends with /t/ (after the voiceless ''k'').', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0208', 'Use of English', 'Synonyms/antonyms', 'Antonyms', NULL, '[{"weight": 1, "conceptId": "v4agon"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Justifies'' is about giving a reason, a different concept from emphasis.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "''Emphasizes'' is a synonym of underscores, not its opposite.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Summarizes'' is unrelated to the idea of emphasis versus de-emphasis.", "misconceptionId": "guessed_no_reasoning"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option opposite in meaning to the underlined word(s).

Tunde''s reaction

underscores

the point I was making?', '[{"label": "A", "text": "justifies", "isCorrect": false}, {"label": "B", "text": "emphasizes", "isCorrect": false}, {"label": "C", "text": "summarizes", "isCorrect": false}, {"label": "D", "text": "minimizes", "isCorrect": true}]'::jsonb, 'D', '''Underscores'' means to emphasize or highlight; its opposite is ''minimizes'' (to play down).', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0209', 'Use of English', 'Grammatical usage', 'Some/Any Pronouns', NULL, '[{"weight": 1, "conceptId": "g8f1cb"}]'::jsonb, '{}', 2, 'application', 60, 'low', 'none', '[{"option": "B", "explanation": "''Someone'' presupposes a specific, known individual rather than the general ''any-'' form questions require.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Somebody'' has the same ''some-'' issue as ''someone'' in a question context.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "''Everyone'' wrongly implies all people did it, rather than the intended general ''any-'' meaning.", "misconceptionId": "misunderstood_terminology"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Fill each gap with the most appropriate option from the lists provided.

Didn''t ......... draw your attention to the entry requirements?', '[{"label": "A", "text": "anybody", "isCorrect": true}, {"label": "B", "text": "someone", "isCorrect": false}, {"label": "C", "text": "somebody", "isCorrect": false}, {"label": "D", "text": "everyone", "isCorrect": false}]'::jsonb, 'A', 'In questions (including rhetorical negative questions like this one), the prescriptive rule tested by JAMB favours ''any-'' compounds over ''some-'' compounds.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0210', 'Use of English', 'Consonants', 'Consonant Sounds', NULL, '[{"weight": 1, "conceptId": "3p5hul"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "In ''though'', the ''gh'' is silent.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "In ''thoroughly'', the ''gh'' is silent (British pronunciation).", "misconceptionId": "confused_similar_concepts"}, {"option": "D", "explanation": "''Of'' has no ''gh'' at all and its ''f'' letter is pronounced /v/, an unrelated sound.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option that has the same consonant sound as the one represented by the underlined letter(s).

cou

gh

?', '[{"label": "A", "text": "though", "isCorrect": false}, {"label": "B", "text": "thoroughly", "isCorrect": false}, {"label": "C", "text": "enough", "isCorrect": true}, {"label": "D", "text": "of", "isCorrect": false}]'::jsonb, 'C', 'The ''gh'' in ''cough'' is pronounced /f/. ''Enough'' also has ''gh'' pronounced /f/.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0211', 'Use of English', 'Vowels', 'Vowel Sounds', NULL, '[{"weight": 1, "conceptId": "namskj"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "B", "explanation": "''Dog'' shares /ɒ/ with cough and rot — picking it as the odd one confuses spelling with sound.", "misconceptionId": "overgeneralized_rule"}, {"option": "C", "explanation": "''Cough'' also shares /ɒ/ despite its different spelling (''ough'').", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "''Rot'' shares /ɒ/ with the other two as well.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option that has a different vowel sound from the others?', '[{"label": "A", "text": "code", "isCorrect": true}, {"label": "B", "text": "dog", "isCorrect": false}, {"label": "C", "text": "cough", "isCorrect": false}, {"label": "D", "text": "rot", "isCorrect": false}]'::jsonb, 'A', '''Dog'', ''cough'' and ''rot'' all share the short vowel sound /ɒ/. ''Code'' has the different diphthong /əʊ/.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0212', 'Use of English', 'Synonyms/antonyms', 'Synonyms', NULL, '[{"weight": 1, "conceptId": "r0mfcp"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Directors'' implies a management role, not distinction/eminence.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "''Power'' confuses influence with the idea of being a distinguished figure.", "misconceptionId": "confused_similar_concepts"}, {"option": "D", "explanation": "''Practitioners'' is too generic — it describes anyone who practises law, missing the ''eminent/leading'' nuance of luminaries.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option nearest in meaning to the underlined word(s).

They are considered to be legal

luminaries', '[{"label": "A", "text": "directors", "isCorrect": false}, {"label": "B", "text": "power", "isCorrect": false}, {"label": "C", "text": "eminent experts", "isCorrect": true}, {"label": "D", "text": "practioners", "isCorrect": false}]'::jsonb, 'C', '''Luminaries'' means distinguished, eminent figures in a field; ''eminent experts'' is the closest match.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0213', 'Use of English', 'Synonyms/antonyms', 'Synonyms', NULL, '[{"weight": 1, "conceptId": "r0mfcp"}]'::jsonb, '{}', 1, 'recall', 60, 'low', 'none', '[{"option": "B", "explanation": "''Sound'' refers to the generic sound of music, not its healing property.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Lyrical'' refers to the words/lyrics of music, unrelated to healing.", "misconceptionId": "misunderstood_terminology"}, {"option": "D", "explanation": "''Rhythmic'' refers to rhythm, not the healing effect the word is testing.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option nearest in meaning to the underlined word(s).

Teachers of music believes in its

therap.eutic

effect?', '[{"label": "A", "text": "healing", "isCorrect": true}, {"label": "B", "text": "sound", "isCorrect": false}, {"label": "C", "text": "lyrical", "isCorrect": false}, {"label": "D", "text": "rhythmic", "isCorrect": false}]'::jsonb, 'A', '''Therapeutic'' means having a healing effect; ''healing'' is its nearest match.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0214', 'Use of English', 'Synonyms/antonyms', 'Synonyms', NULL, '[{"weight": 1, "conceptId": "r0mfcp"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Observe a truce'' describes a possible outcome of parleying, not the act of parleying itself.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Sign a treaty'' is a possible eventual result, not the meaning of ''parley''.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "''Suspend hostilities'' is also an outcome/related idea, not the act of talking itself.", "misconceptionId": "misunderstood_terminology"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option nearest in meaning to the underlined word(s).

The warring tribes have been told to

parley

with each other.', '[{"label": "A", "text": "observe a truce", "isCorrect": false}, {"label": "B", "text": "hold talks", "isCorrect": true}, {"label": "C", "text": "sign a treaty", "isCorrect": false}, {"label": "D", "text": "suspend hostilities", "isCorrect": false}]'::jsonb, 'B', '''Parley'' means to hold a discussion or negotiation, especially between opposing sides; ''hold talks'' is the nearest match to the act itself.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0215', 'Use of English', 'Comprehension', 'Cloze/Gap-fill in Context', NULL, '[{"weight": 1, "conceptId": "hbrpoi"}]'::jsonb, '{}', 2, 'application', 60, 'high', 'none', '[{"option": "A", "explanation": "''An antithesis'' means an opposing idea, not a tentative explanation.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "''A principle'' is a general rule, not the tentative, testable explanation being described.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''A thesis'' is a general proposition/argument; ''hypothesis'' is the more precise scientific term for an untested explanation.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'The passage below has gaps numbered 11 to 20. Immediately following each gap, four options are provided. Choose the most appropriate option for each gap.

It is the business of the scientist to accumulate knowledge about the universe and all that is in it and to find if he is able, common

……11…..[A. experiment B. instruments C. approaches D. factors]

which underlie and account for the facts that he knows. He chooses when he can, the method of the controlled

…….12…..[A. respondent B. experiment C. system D. data]

. If he wants to find out the effect of light on growing plants, he takes many plants, as alike as possible. Some he stands in the sun, some in the shade, some in the dark, all the time keeping all other

.....13.....[A. studies B. procedures C. objects D. conditions]

(temperature, moisture, nourishments) the same. In this way, by keeping other variables

……..14……[A. constant B. good C. dark D. natural]

and by varying the light only, the effect of light on plants can be clearly seen. This

…….15…..[A. research B. method C. tool D. rationale]

of using ‘controls’ can be applied to a variety of situations and can be used to find the answers to questions as widely different as ‘must moisture be present if

…….16….[A. an alloy B. gold C. bar D. iron]

is to rust?’ and which variety of beans give the greatest yield in one

……17…..[A. climate B. period C. season D. weather]?

In the course of his

……18…..[A. finding B. queries C. experiment D. inquiries]

, the scientist may find what he thinks is one common explanation for an increasing number of facts the explanation, if it seems consistently to fit the various facts, is called

…….19……[A. an antithesis B. a principle C. a thesis D. a hypothesis]

. If this continues to stand the test of numerous experiments and remains unshaken, it becomes a

……20…..[A. deduction B. law C. notion D. thesis].

In question number 19 above, choose the best option from letters A-D that best completes the gap.', '[{"label": "A", "text": "an antithesis", "isCorrect": false}, {"label": "B", "text": "a principle", "isCorrect": false}, {"label": "C", "text": "a thesis", "isCorrect": false}, {"label": "D", "text": "a hypothesis", "isCorrect": true}]'::jsonb, 'D', 'An explanation that consistently fits an increasing number of facts is precisely what a scientific ''hypothesis'' is.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0216', 'Use of English', 'Synonyms/antonyms', 'Antonyms', NULL, '[{"weight": 1, "conceptId": "v4agon"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Unprepared'' is a synonym of extemporaneous, not its opposite.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "''Fascinating'' describes a quality unrelated to preparation.", "misconceptionId": "confused_similar_concepts"}, {"option": "D", "explanation": "''Unfavourable'' relates to reception, not to preparation, so it is not the tested opposite.", "misconceptionId": "guessed_no_reasoning"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option opposite in meaning to the underlined word(s).

The President gave another

extemporaneous

speech last Friday.', '[{"label": "A", "text": "unprepared", "isCorrect": false}, {"label": "B", "text": "fascinating", "isCorrect": false}, {"label": "C", "text": "well-rehearsed", "isCorrect": true}, {"label": "D", "text": "unfavourable", "isCorrect": false}]'::jsonb, 'C', '''Extemporaneous'' means unprepared/impromptu; its opposite is ''well-rehearsed'' (prepared in advance).', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0217', 'Use of English', 'Synonyms/antonyms', 'Antonyms', NULL, '[{"weight": 1, "conceptId": "v4agon"}]'::jsonb, '{}', 3, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Popular'' can still describe someone famous for bad reasons, so it isn''t the precise opposite.", "misconceptionId": "overgeneralized_rule"}, {"option": "B", "explanation": "''Unknown'' opposes ''famous'' generally but misses the specific ''bad reputation'' nuance of notorious.", "misconceptionId": "misunderstood_terminology"}, {"option": "C", "explanation": "''Well known'' is essentially a synonym of notorious (both mean widely known), not its opposite.", "misconceptionId": "confused_similar_concepts"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option opposite in meaning to the underlined word(s).

He is

notorious

for his drunkenness', '[{"label": "A", "text": "popular", "isCorrect": false}, {"label": "B", "text": "unknown", "isCorrect": false}, {"label": "C", "text": "well known", "isCorrect": false}, {"label": "D", "text": "reputable", "isCorrect": true}]'::jsonb, 'D', '''Notorious'' means famous for something bad; its opposite is ''reputable'' (having a good reputation).', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0218', 'Use of English', 'Vocabulary and expressions in context', 'Sentence Interpretation (Idiom)', NULL, '[{"weight": 1, "conceptId": "fno6b9"}]'::jsonb, '{}', 3, 'application', 60, 'high', 'none', '[{"option": "A", "explanation": "Overstates the meaning as inevitable (''cannot escape'') rather than merely probable.", "misconceptionId": "overgeneralized_rule"}, {"option": "B", "explanation": "Shifts the focus to the listener''s rights, missing what the phrase actually describes.", "misconceptionId": "misunderstood_terminology"}, {"option": "C", "explanation": "States the opposite meaning — ''inconceivable'' means very unlikely, not likely.", "misconceptionId": "confused_similar_concepts"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'If our thoughts is to be clear and we are to succeed in communicating it to other people, we must have some method of fixing the meaning of the words we use. When we use a word whose meaning is not certain, we may well be asked to define it. There is a usual traditional device for doing this by indicating the class to which whatever is indicated by the term belongs and also other particular property which distinguishes it from all other members of the same class. Thus we may define a whale as a ‘marine animal that spouts’. ‘Marine animals’ in this definition indicates the general class to which the whale belongs and ‘spouts’ indicates the particular property that distinguishes whales from other such marine animals as fishes, seals, jellyfish and lobsters. In the same way, we can define an even number as a finite integer divisible by two or a democracy as a system of government in which the people themselves rule.

there are other ways, of course of indicating the meaning of words. We may for example, find it hard to make a suitable definition of the word ‘animal’, as we say that an animal is such a thing as a rabbit, dog fish or goat. Similarly, we may say that religion is such a system as Christianity, Islam, Judaism and Buddhism. This way of indicating the meaning of a term by enumerating examples of what it includes is obviously of limited usefulness. If we indicate our use of the word ‘animal’ as above, our hearers might for example be doubtful whether a sea-anemone or a slug was to be included in the class of animals. It is however, a useful way of supplementing a definition if the definition itself id definite without being easily understandable. Failure of an attempt at definition to serve its purpose may result from giving as distinguishing mark one which either does not belong to all the things the definition id intended to include, or does belong to some members of the same general class which the definition is intended to exclude.

The expression ''we may well be asked'' as used in the passage means', '[{"label": "A", "text": "we cannot escape being asked", "isCorrect": false}, {"label": "B", "text": "the listener is always justified to ask questions", "isCorrect": false}, {"label": "C", "text": "it is inconceivable that we will be asked", "isCorrect": false}, {"label": "D", "text": "we can reasonably expect to be asked", "isCorrect": true}]'::jsonb, 'D', '''May well be asked'' expresses probability (''it is quite likely that...''), not certainty or impossibility.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0219', 'Use of English', 'Stress', 'Emphatic Stress', NULL, '[{"weight": 1, "conceptId": "odd0o9"}]'::jsonb, '{}', 2, 'application', 60, 'low', 'none', '[{"option": "A", "explanation": "Changes both the subject (''brother'' instead of ''uncle'') and the verb (''resign'' instead of ''retire'').", "misconceptionId": "confused_similar_concepts"}, {"option": "B", "explanation": "Changes both the subject (''sister'') and the verb (''resign''), just like option A.", "misconceptionId": "misunderstood_terminology"}, {"option": "D", "explanation": "Keeps the correct verb ''retire'' but wrongly changes the subject to ''brother''.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'The word in capital letters has emphatic stress. Choose the option that best fits the expression in the sentence.

My uncle retired from the POLICE?', '[{"label": "A", "text": "Did your brother resign from the police?", "isCorrect": false}, {"label": "B", "text": "Did your sister resign from the police?", "isCorrect": false}, {"label": "C", "text": "Did your uncle retire from the police?", "isCorrect": true}, {"label": "D", "text": "Did your brother retire from the police?", "isCorrect": false}]'::jsonb, 'C', 'The stress on POLICE signals a contrast on that element, so the matching question must keep the exact subject (''uncle'') and verb (''retire'') and query the destination.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0220', 'Use of English', 'Synonyms/antonyms', 'Synonyms', NULL, '[{"weight": 1, "conceptId": "r0mfcp"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "A", "explanation": "''Know'' implies certainty, stronger than the tentative opinion ''think'' expresses here.", "misconceptionId": "overgeneralized_rule"}, {"option": "B", "explanation": "''Understand'' implies comprehension of facts, not simply holding an opinion.", "misconceptionId": "misunderstood_terminology"}, {"option": "C", "explanation": "''Consider'' is tempting but grammatically awkward here without a direct object/complement, unlike ''believe''.", "misconceptionId": "confused_similar_concepts"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Choose the option nearest in meaning to the underlined word(s).

Practicing medicine is not as lucrative as many people

think

?', '[{"label": "A", "text": "know", "isCorrect": false}, {"label": "B", "text": "understand", "isCorrect": false}, {"label": "C", "text": "consider", "isCorrect": false}, {"label": "D", "text": "believe", "isCorrect": true}]'::jsonb, 'D', '''Think'' here means to hold an opinion; ''believe'' is the closest natural substitute (''not as lucrative as many people believe'').', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0221', 'Use of English', 'Idiomatic expressions', 'Sentence Interpretation (Idiom)', NULL, '[{"weight": 1, "conceptId": "91ez3x"}]'::jsonb, '{}', 2, 'recall', 60, 'low', 'none', '[{"option": "B", "explanation": "Misreads ''bounds'' literally as bandages/binding of wounds.", "misconceptionId": "misunderstood_terminology"}, {"option": "C", "explanation": "Misreads ''leaps'' literally as physical jumping exercise.", "misconceptionId": "confused_similar_concepts"}, {"option": "D", "explanation": "Connects ''leaps'' to running/jogging, another literal misreading of the idiom.", "misconceptionId": "overgeneralized_rule"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Select the option that best explain the information conveyed in the sentence.

After the successful operation, he recovered by leaps and bounds?', '[{"label": "A", "text": "He recovered very rapidly", "isCorrect": true}, {"label": "B", "text": "His well-bound wounds aided his recovery", "isCorrect": false}, {"label": "C", "text": "He did a lot of keep-fit exercises", "isCorrect": false}, {"label": "D", "text": "He used to jog regularly", "isCorrect": false}]'::jsonb, 'A', '''By leaps and bounds'' is an idiom meaning ''very rapidly'', not a literal description of jumping or exercise.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0222', 'Use of English', 'Synthesis of ideas from passages', 'Comprehension and Summary', NULL, '[{"weight": 1, "conceptId": "m80o2r"}]'::jsonb, '{}', 3, 'application', 60, 'high', 'none', '[{"option": "A", "explanation": "Captures only the NNPC-efficiency part of the argument, omitting the competition/price benefit.", "misconceptionId": "confused_similar_concepts"}, {"option": "B", "explanation": "Overgeneralizes to ''every aspect'' of the economy, when the passage only discusses the oil sector.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "Captures only the competition part, omitting the wastage/corruption-reduction argument.", "misconceptionId": "confused_similar_concepts"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Those who have been following the argument for and against the deregulation of the oil industry in Nigeria may have got the impression that deregulation connotes lack of control or indifference on the part of the government. But there is nothing so far from official quarters to suggest that deregulation will cause the government to relinquish its control of the oil industry because the absence of direct control does not mean that it will surrender all its rights to the entrepreneurs who may want to participate in the industry. Yet the opposition expressed so far against stems from the fear that the government would leave Nigerians at the mercy of a heartless cartel who would command the heights of the oil industry and cause pump price of fuel to rise above the means of most Nigerians.

`As a result of such fears, many Nigerians have become resentful of deregulation and in fact the Nigeria Labour Congress  (NLC) has threatened to ‘deregulate’ the government if it should go ahead with the deregulation plan. But Nigerians have not fared any better with the economy totally in government control. Until recently, the most important sectors of the economy were in the hands of the government. Today, the deregulation of some of these sectors has broken its monopoly and introduced healthy competition to make a little easier for Nigerians. A good example is the breaking of the stifling monopoly of Nigeria Airways. Today, the traveller is king at the domestic airports as opposed to the struggle that air travels used to be under Nigeria Airways monopoly. Before, it was almost easier for a camel to pass through the eye of a needle than for travellers to board a plane.

Following from this, the apostles of deregulation rightly heap all the blame for the problems associated with petroleum products distribution in this country squarely on the government, which owns all the refineries and which sells fuel to local consumers through its agency, the Nigerian National Petroleum Corporation (NNPC). In the same way, the government argues that if the current NNPC monopoly were broken with the introduction of entrepreneurs to the refining and sale of petroleum products in the country, the Nigerian people would be all the better for it. It stands to reason that once the government continues to fix maximum prices would be all the better for it. It stands to reason that once the government continues to fix maximum prices for petroleum products in this country, the deregulation of the oil sector should bring some relief to the people by ensuring that wastage, corruption and inefficiency are reduced to the minimum. Consumers will also have the last laugh because competition will result in the availability of the products at reasonable prices. This appears to be the sense in deregulation.

Which of these correctly summaries the arguments adduced by the advocate of deregulation?', '[{"label": "A", "text": "dereuglating the economy will make the NNPC more efficient and less wasteful", "isCorrect": false}, {"label": "B", "text": "the government should deregulate every aspect of the nigerian economy", "isCorrect": false}, {"label": "C", "text": "breaking the NNPC''s monopoly and introducing competition among entrepreneurs will reduce wastage, corruption and inefficiency and make petroleum products more available at reasonable prices", "isCorrect": true}, {"label": "D", "text": "competition should be allowed in the production and distribution of petroleum products", "isCorrect": false}]'::jsonb, 'C', 'The passage''s pro-deregulation argument combines both the efficiency gain from breaking NNPC''s monopoly AND the price/availability benefit from competition — option C is the only one that captures both parts of the argument.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0223', 'Use of English', 'Comprehension', 'Comprehension and Summary', NULL, '[{"weight": 1, "conceptId": "3r5lb7"}]'::jsonb, '{}', 3, 'application', 60, 'high', 'none', '[{"option": "A", "explanation": "Misattributes the doubt to the ''speaker'' when the passage specifically says it is the ''hearers'' who are left doubtful.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "Not supported by the passage, which never discusses listed items having differing characteristics.", "misconceptionId": "guessed_no_reasoning"}, {"option": "D", "explanation": "Overstates the disadvantage as ''important members left out'' rather than the passage''s actual point about uncertain boundaries.", "misconceptionId": "confused_similar_concepts"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'If our thoughts is to be clear and we are to succeed in communicating it to other people, we must have some method of fixing the meaning of the words we use. When we use a word whose meaning is not certain, we may well be asked to define it. There is a usual traditional device for doing this by indicating the class to which whatever is indicated by the term belongs and also other particular property which distinguishes it from all other members of the same class. Thus we may define a whale as a ‘marine animal that spouts’. ‘Marine animals’ in this definition indicates the general class to which the whale belongs and ‘spouts’ indicates the particular property that distinguishes whales from other such marine animals as fishes, seals, jellyfish and lobsters. In the same way, we can define an even number as a finite integer divisible by two or a democracy as a system of government in which the people themselves rule.

there are other ways, of course of indicating the meaning of words. We may for example, find it hard to make a suitable definition of the word ‘animal’, as we say that an animal is such a thing as a rabbit, dog fish or goat. Similarly, we may say that religion is such a system as Christianity, Islam, Judaism and Buddhism. This way of indicating the meaning of a term by enumerating examples of what it includes is obviously of limited usefulness. If we indicate our use of the word ‘animal’ as above, our hearers might for example be doubtful whether a sea-anemone or a slug was to be included in the class of animals. It is however, a useful way of supplementing a definition if the definition itself id definite without being easily understandable. Failure of an attempt at definition to serve its purpose may result from giving as distinguishing mark one which either does not belong to all the things the definition id intended to include, or does belong to some members of the same general class which the definition is intended to exclude.

From the passage, which of these is a disadvantage of defining by enumerating?', '[{"label": "A", "text": "enumeration always leave doubts in the mind of the speaker", "isCorrect": false}, {"label": "B", "text": "the words or objects listed may not all share similar characteristics", "isCorrect": false}, {"label": "C", "text": "listeners may remain uncertain whether certain borderline items belong to the class being defined", "isCorrect": true}, {"label": "D", "text": "many important members of the group may be left out of the enumeration", "isCorrect": false}]'::jsonb, 'C', 'The passage''s own example (doubt about whether a sea-anemone or slug counts as an ''animal'') shows the disadvantage is that hearers/listeners are left uncertain about borderline inclusion — not that the speaker doubts, or that items are omitted.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0224', 'Use of English', 'Comprehension', 'Cloze/Gap-fill in Context', NULL, '[{"weight": 1, "conceptId": "hbrpoi"}]'::jsonb, '{}', 2, 'application', 60, 'high', 'none', '[{"option": "A", "explanation": "''Studies'' doesn''t fit — temperature/moisture/nourishment are conditions, not studies.", "misconceptionId": "misunderstood_terminology"}, {"option": "B", "explanation": "''Procedures'' describes steps taken, not the conditions being held the same.", "misconceptionId": "confused_similar_concepts"}, {"option": "C", "explanation": "''Objects'' doesn''t fit — temperature/moisture aren''t physical objects.", "misconceptionId": "guessed_no_reasoning"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'The passage below has gaps numbered 11 to 20. Immediately following each gap, four options are provided. Choose the most appropriate option for each gap.

It is the business of the scientist to accumulate knowledge about the universe and all that is in it and to find if he is able, common

……11…..[A. experiment B. instruments C. approaches D. factors]

which underlie and account for the facts that he knows. He chooses when he can, the method of the controlled

…….12…..[A. respondent B. experiment C. system D. data]

. If he wants to find out the effect of light on growing plants, he takes many plants, as alike as possible. Some he stands in the sun, some in the shade, some in the dark, all the time keeping all other

.....13.....[A. studies B. procedures C. objects D. conditions]

(temperature, moisture, nourishments) the same. In this way, by keeping other variables

……..14……[A. constant B. good C. dark D. natural]

and by varying the light only, the effect of light on plants can be clearly seen. This

…….15…..[A. research B. method C. tool D. rationale]

of using ‘controls’ can be applied to a variety of situations and can be used to find the answers to questions as widely different as ‘must moisture be present if

…….16….[A. an alloy B. gold C. bar D. iron]

is to rust?’ and which variety of beans give the greatest yield in one

……17…..[A. climate B. period C. season D. weather]?

In the course of his

……18…..[A. finding B. queries C. experiment D. inquiries]

, the scientist may find what he thinks is one common explanation for an increasing number of facts the explanation, if it seems consistently to fit the various facts, is called

…….19……[A. an antithesis B. a principle C. a thesis D. a hypothesis]

. If this continues to stand the test of numerous experiments and remains unshaken, it becomes a

……20…..[A. deduction B. law C. notion D. thesis].

In question number 13 above, choose the best option from letters A-D that best completes the gap.', '[{"label": "A", "text": "studies", "isCorrect": false}, {"label": "B", "text": "procedures", "isCorrect": false}, {"label": "C", "text": "objects", "isCorrect": false}, {"label": "D", "text": "conditions", "isCorrect": true}]'::jsonb, 'D', 'The listed items (temperature, moisture, nourishments) are experimental ''conditions'' being held constant.', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb),
('use_of_english_0225', 'Use of English', 'Comprehension', 'Comprehension and Summary', NULL, '[{"weight": 1, "conceptId": "3r5lb7"}]'::jsonb, '{}', 3, 'application', 60, 'high', 'none', '[{"option": "B", "explanation": "The passage says personal writing can be just as objective, not ''more'' objective — an overstatement.", "misconceptionId": "overgeneralized_rule"}, {"option": "C", "explanation": "Too absolute — the passage says the choice depends on the formality of the situation, not that personal writing suits ''all'' business situations.", "misconceptionId": "overgeneralized_rule"}, {"option": "D", "explanation": "Conflates a related but secondary point (interest value) with the more directly and explicitly stated argument.", "misconceptionId": "confused_similar_concepts"}]'::jsonb, '{}', 'jamb_past_question', 2002, 'JAMB', '{}', 'Recgnizing the need for objectivity in their work, the early report writers to develop a writing style which convey this attitude. They reasoned that the source of the subjective quality in a report is the human being.  And they reasoned that objectivity is best attained by emphasizing the factual material of a report rather 5than the personalities involved. So they worked to remove the human being from their writing. Impersonal writing style was the result. By impersonal writing is meant writing in the third person-without I’s, we’s or you’s.

In recent years, impersonal writing has been strenuously questioned by many writers. These writers point out that personal writing is more forceful and direct than is impersonal writing. They contend that writing which brings both reader and writer into the picture is more like conversation and therefore more interesting. And the answer to the point on objectivity when written in personal style as when in impersonal style. Frequently, they counter with the argument that impersonal writing leads to an overuse of passive voice and a generally dull writing style. This last argument however lacks substances. Impersonal writing can and should be interesting. Any dullness it may have is wholly the fault of the writer. As proof, one has only to look at the lovely styles used by the writers for newspapers, news magazines and journals. Most of this writing is impersonal and usually it is not dull.

As in most cases of controversy, there is some merit to the arguments on both sides. There are situations in which personal writing is best. There are situations in which impersonal writing is best. And there are situations in which either style is appropriate. The writer must decide at the outset of his work which style is best for his own situation.

Her decision should be based on the circumstances of each report situation. First, he should consider the expectations or desires of those for whom he is preparing the report. More than likely he will find a preference for impersonal style for like most human beings; businessman has been slow to break tradition. Next, the writer should consider the formality of the report situation. If the situation is informal, as when the report is really a personal communication of information between business associates, personal writing is appropriate. But if the situation is formal, as is case with most reports, the conventional impersonal style is best.

One argument given in support of personal writing is that it', '[{"label": "A", "text": "is more forceful and direct than impersonal writing", "isCorrect": true}, {"label": "B", "text": "can be more objective than impersonal writing", "isCorrect": false}, {"label": "C", "text": "is the style to use in all situations involving businessmen", "isCorrect": false}, {"label": "D", "text": "has informal features which make it more diverting than impersonal writing", "isCorrect": false}]'::jsonb, 'A', 'The passage explicitly states this argument: ''personal writing is more forceful and direct than is impersonal writing.''', 'live', '{"totalAttempts": 0, "correctCount": 0, "avgResponseTimeMs": 0, "distractorSelectionCounts": {}}'::jsonb);