create table kairo.planner_topic_map (
  subject_slug   text not null,
  topic_title    text not null,
  engine_subject text not null,
  engine_topics  text[] not null,
  confidence     text not null default 'reviewed' check (confidence in ('reviewed', 'candidate')),
  created_at     timestamptz not null default now(),
  primary key (subject_slug, topic_title)
);

comment on table kairo.planner_topic_map is 'Kairo V1 Planner Handshake: bridges Study Planner topics (subjectSlug/topicTitle from kairo-app/src/lib/planner/syllabus.ts, PlannedTopic.key shape) to RecommendationEngine''s subject/topic strings (kairo.concepts/kairo.questions). One-to-many by design: Mathematics and Use of English have a genuine granularity mismatch against the Blueprint (not just wording) and are deliberately left unmapped (quarantined, treated as no-signal) until manually authored — see scripts/generate-planner-topic-map-candidates.js and its reviewed output. A Planner topic absent from this table must never be guessed at by fuzzy-matching at runtime; RecommendationEngine.getPlannerSignal() treats a miss as "no signal available," never a fallback guess.';
comment on column kairo.planner_topic_map.engine_topics is 'One or more kairo.questions.topic values this Planner topic corresponds to. An array specifically because Mathematics/Use of English (and possibly individual sciences topics like Physics'' "Vapours" or Biology''s "Soil", flagged as unclaimed by the candidate generator) may need more than one engine topic per Planner topic once authored.';
comment on column kairo.planner_topic_map.confidence is 'reviewed = a human confirmed this row before insert (the only value that should ever exist once this table is actually populated). candidate = a generator''s unreviewed proposal — never read by getPlannerSignal(), present only so a candidate-import script and a review UI can share the same table if that ever becomes useful instead of purely a JSON review file.';

-- RLS: read-only reference data, not per-student — every authenticated
-- student can read it (needed for getPlannerSignal() to run client-side),
-- nobody client-side can write it (content-authoring only, via service role).
alter table kairo.planner_topic_map enable row level security;

create policy "planner_topic_map_select_authenticated"
  on kairo.planner_topic_map for select
  to authenticated
  using (true);
