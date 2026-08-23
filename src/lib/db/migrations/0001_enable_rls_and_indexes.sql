-- Indexes for the query patterns the app actually uses (per-user lookups,
-- date-range scans for the planner, and streak/log joins).
CREATE INDEX "categories_user_id_idx" ON "categories" ("user_id");
CREATE INDEX "habits_user_id_idx" ON "habits" ("user_id");
CREATE INDEX "habit_logs_habit_id_date_idx" ON "habit_logs" ("habit_id", "date");
CREATE UNIQUE INDEX "habit_logs_habit_id_date_unique" ON "habit_logs" ("habit_id", "date");
CREATE INDEX "todos_user_id_due_date_idx" ON "todos" ("user_id", "due_date");
CREATE INDEX "journal_entries_user_id_date_idx" ON "journal_entries" ("user_id", "date");

-- RLS as defense-in-depth. The app connects via a privileged Postgres role
-- (the Supabase pooler's "postgres" user) that bypasses RLS, so these
-- policies are not the active enforcement path today -- every query in
-- the app layer filters by user_id explicitly. FORCE ROW LEVEL SECURITY
-- makes the policies apply even to the table owner, so they take effect
-- automatically if a least-privileged role is wired up later (e.g. the
-- app connecting as a non-superuser role, or a future Supabase-client
-- code path authenticated via Clerk's JWT).
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" FORCE ROW LEVEL SECURITY;
CREATE POLICY "categories_own_rows" ON "categories"
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

ALTER TABLE "habits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "habits" FORCE ROW LEVEL SECURITY;
CREATE POLICY "habits_own_rows" ON "habits"
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

ALTER TABLE "habit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "habit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_own_rows" ON "habit_logs"
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

ALTER TABLE "todos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "todos" FORCE ROW LEVEL SECURITY;
CREATE POLICY "todos_own_rows" ON "todos"
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_entries" FORCE ROW LEVEL SECURITY;
CREATE POLICY "journal_entries_own_rows" ON "journal_entries"
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));
