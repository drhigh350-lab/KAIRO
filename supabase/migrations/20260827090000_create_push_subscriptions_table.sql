-- Kairo — Web Push Subscriptions
--
-- V1 architecture Batch 3: EnableNotifications.tsx / NotificationSettings.tsx
-- previously only ever called Notification.requestPermission() and recorded
-- consent (kairo.students via grantChannelConsent('push')) — granting OS
-- permission was never followed by an actual browser PushManager
-- subscription, so there was no endpoint for any server-side sender to
-- deliver to. This table is that missing subscription record: one row per
-- browser/device subscription (a student signed in on two devices holds
-- two rows), upserted by lib/pushSubscription.ts whenever the student
-- opts in, and read by whatever server-side process actually sends a Web
-- Push message (out of scope here — this is the storage half only).

create table kairo.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references kairo.students(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_subscriptions_student_id_idx on kairo.push_subscriptions(student_id);

alter table kairo.push_subscriptions enable row level security;

create policy "Insert own push subscriptions" on kairo.push_subscriptions
  for insert
  with check (
    exists (
      select 1 from kairo.students s
      where s.id = push_subscriptions.student_id and s.auth_user_id = auth.uid()
    )
  );

create policy "Read own push subscriptions" on kairo.push_subscriptions
  for select
  using (
    exists (
      select 1 from kairo.students s
      where s.id = push_subscriptions.student_id and s.auth_user_id = auth.uid()
    )
  );

-- A browser rotates its push endpoint occasionally (Chrome/Firefox both do
-- this periodically) — re-subscribing upserts onto the same `endpoint`
-- conflict target, which needs UPDATE, not just INSERT, to actually land.
create policy "Update own push subscriptions" on kairo.push_subscriptions
  for update
  using (
    exists (
      select 1 from kairo.students s
      where s.id = push_subscriptions.student_id and s.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from kairo.students s
      where s.id = push_subscriptions.student_id and s.auth_user_id = auth.uid()
    )
  );

-- Revoking push consent (NotificationSettings.tsx's toggle) removes the
-- subscription server-side too, not just the local permission/consent flag.
create policy "Delete own push subscriptions" on kairo.push_subscriptions
  for delete
  using (
    exists (
      select 1 from kairo.students s
      where s.id = push_subscriptions.student_id and s.auth_user_id = auth.uid()
    )
  );
