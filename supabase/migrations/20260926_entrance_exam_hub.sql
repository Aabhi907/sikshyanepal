-- Verified entrance exam calendar for post-SEE study routes.
CREATE TABLE IF NOT EXISTS entrance_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  program TEXT,
  exam_date TIMESTAMPTZ,
  application_deadline TIMESTAMPTZ,
  fee DECIMAL(10, 2),
  description TEXT,
  exam_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS exam_body TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS syllabus_url TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE entrance_exams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE entrance_exams ADD CONSTRAINT entrance_exams_status_check
    CHECK (status IN ('draft', 'published', 'closed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_entrance_exams_dates ON entrance_exams(status, application_deadline, exam_date);
ALTER TABLE entrance_exams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read published entrance exams" ON entrance_exams
    FOR SELECT TO anon, authenticated USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE entrance_exams IS 'Source-backed application deadlines and exam dates; only published records are public.';
