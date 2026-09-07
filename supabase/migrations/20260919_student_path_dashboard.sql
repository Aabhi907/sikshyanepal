-- A private, student-owned planning layer. This does not store marksheets,
-- identity documents, or other sensitive files; it only stores checklist state.

CREATE TABLE IF NOT EXISTS student_path_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL CHECK (current_stage IN ('grade_10', 'plus_two', 'bachelor', 'graduate', 'parent')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_path_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_student_path_tasks_user ON student_path_tasks(user_id, is_completed, created_at);

ALTER TABLE student_path_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_path_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own student path profile" ON student_path_profiles FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own student path tasks" ON student_path_tasks FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE student_path_profiles IS 'Private, selected education stage for the My Path dashboard.';
COMMENT ON TABLE student_path_tasks IS 'Private, non-sensitive planning checklist for the My Path dashboard.';
