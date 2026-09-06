-- Private admission-planning state. No documents, marksheets or identity files are uploaded or stored.
CREATE TABLE IF NOT EXISTS student_admission_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'documents_ready', 'applied', 'entrance', 'enrolled')),
  checklist JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, admission_id)
);
CREATE INDEX IF NOT EXISTS idx_student_admission_plans_user ON student_admission_plans(user_id, updated_at DESC);
ALTER TABLE student_admission_plans ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own admission plans" ON student_admission_plans FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON TABLE student_admission_plans IS 'Private admission progress. Do not store document files or sensitive identity data.';
