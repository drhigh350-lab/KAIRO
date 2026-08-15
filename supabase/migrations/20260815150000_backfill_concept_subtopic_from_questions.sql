-- Kairo — Backfill kairo.concepts.subtopic from kairo.questions.subtopic
--
-- Every concept in kairo.concepts had subtopic = null for Biology,
-- Chemistry, Physics, and Use of English (checked directly against
-- production — only the newly-seeded Mathematics batch had real
-- subtopics). This silently broke subtopic narrowing everywhere it
-- mattered: TopicPracticeEngine.getTopicJourney()/getRealSubtopics()
-- explicitly skip any concept with subtopic == null (a real null, not
-- the string "null", to avoid a worse bug), so the SubtopicSelect screen
-- showed zero subtopic options for every topic in these four subjects —
-- "Narrow it down, or practise the whole topic" never had anything to
-- narrow down to.
--
-- kairo.questions.subtopic DOES carry real values for Biology (copied
-- from the source PDF's section headers, e.g. "Section E: Evolution")
-- but is null on essentially every Chemistry/Physics/Use of English
-- question too — there's nothing to backfill from for those three; that
-- gap needs real subtopic content authored, out of scope here. This
-- migration backfills every concept whose (subject, topic) has a real,
-- majority subtopic value on its questions — in practice, restores
-- subtopic narrowing for all 93 Biology concepts.

with ranked as (
  select subject, topic, subtopic, count(*) as n,
         row_number() over (partition by subject, topic order by count(*) desc) as rn
  from kairo.questions
  where subtopic is not null
  group by subject, topic, subtopic
)
update kairo.concepts c
set subtopic = r.subtopic, updated_at = now()
from ranked r
where r.rn = 1
  and c.subject = r.subject
  and c.topic = r.topic
  and c.subtopic is null;
