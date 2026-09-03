-- Structured admissions and deadline engine.
-- Apply after 20260903_verified_school_directory.sql.

CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  institution_type TEXT NOT NULL CHECK (institution_type IN ('school', 'college', 'university', 'training_provider', 'other')),
  institution_name TEXT NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  programs TEXT[] NOT NULL DEFAULT '{}',
  education_level TEXT,
  admission_type TEXT NOT NULL DEFAULT 'general' CHECK (admission_type IN ('general', 'entrance', 'scholarship', 'quota', 'transfer', 'other')),
  summary TEXT,
  details TEXT,
  eligibility TEXT,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  application_open_at TIMESTAMPTZ,
  application_deadline TIMESTAMPTZ,
  entrance_exam_at TIMESTAMPTZ,
  application_fee DECIMAL(12, 2) CHECK (application_fee >= 0),
  available_seats INTEGER CHECK (available_seats >= 0),
  application_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'source_verified' CHECK (verification_status IN ('unverified', 'source_verified', 'institution_verified')),
  last_verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  sponsor_label TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (school_id IS NULL OR college_id IS NULL),
  CHECK (NOT is_sponsored OR sponsor_label IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_admissions_deadline ON admissions(status, application_deadline);
CREATE INDEX IF NOT EXISTS idx_admissions_institution ON admissions(institution_type, institution_name);
CREATE INDEX IF NOT EXISTS idx_admissions_school ON admissions(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_college ON admissions(college_id) WHERE college_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_search ON admissions USING gin(to_tsvector('simple', title || ' ' || institution_name));

ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read published admissions" ON admissions
    FOR SELECT TO anon USING (status = 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE admissions IS 'Source-backed admission opportunities and deadlines for Nepal education institutions.';
COMMENT ON COLUMN admissions.is_sponsored IS 'Commercial placement flag; sponsored records must remain visibly labelled.';

