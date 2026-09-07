-- Preserve deadline changes so students can see when an admission date moved.
CREATE TABLE IF NOT EXISTS admission_deadline_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admission_id UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  previous_deadline TIMESTAMPTZ,
  new_deadline TIMESTAMPTZ,
  reason TEXT,
  source_url TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admission_deadline_history_admission ON admission_deadline_history(admission_id, changed_at DESC);
ALTER TABLE admission_deadline_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read admission deadline history" ON admission_deadline_history FOR SELECT TO anon USING (true);
COMMENT ON TABLE admission_deadline_history IS 'Immutable student-facing history of application deadline changes.';
