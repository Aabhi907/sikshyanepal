-- Verified school directory foundation
-- Safe to apply to an existing SikshyaNepal Supabase project.

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iemis_code TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  ownership_type TEXT CHECK (ownership_type IN ('community', 'institutional', 'religious', 'public', 'private', 'other')),
  school_level TEXT CHECK (school_level IN ('pre_primary', 'basic', 'secondary', 'higher_secondary', 'multiple')),
  grades_from SMALLINT CHECK (grades_from BETWEEN 0 AND 12),
  grades_to SMALLINT CHECK (grades_to BETWEEN 0 AND 12),
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  local_level TEXT,
  ward_number SMALLINT CHECK (ward_number BETWEEN 1 AND 99),
  location TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_url TEXT,
  principal_name TEXT,
  medium_of_instruction TEXT[],
  streams TEXT[],
  facilities TEXT[],
  student_count INTEGER CHECK (student_count >= 0),
  teacher_count INTEGER CHECK (teacher_count >= 0),
  established_year INTEGER CHECK (established_year BETWEEN 1800 AND 2200),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_review', 'inactive')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'source_verified', 'institution_verified')),
  source_name TEXT,
  source_url TEXT,
  source_published_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  verified_by TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (grades_from IS NULL OR grades_to IS NULL OR grades_from <= grades_to)
);

-- Give college profiles the same trust and geographic vocabulary.
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS local_level TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS ward_number SMALLINT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE colleges ADD COLUMN IF NOT EXISTS verified_by TEXT;

CREATE TABLE IF NOT EXISTS data_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('school', 'college')),
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  correction_type TEXT NOT NULL CHECK (correction_type IN ('incorrect_information', 'contact_update', 'program_update', 'closed_or_moved', 'claim_profile', 'other')),
  details TEXT NOT NULL CHECK (char_length(details) BETWEEN 10 AND 4000),
  source_url TEXT,
  reporter_name TEXT,
  reporter_email TEXT NOT NULL,
  reporter_role TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_location ON schools(province, district, local_level);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(ownership_type, school_level);
CREATE INDEX IF NOT EXISTS idx_schools_verified ON schools(verification_status, last_verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_schools_name_search ON schools USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_data_corrections_status ON data_corrections(status, created_at DESC);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_corrections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read active schools" ON schools
    FOR SELECT TO anon USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can report corrections" ON data_corrections
    FOR INSERT TO anon WITH CHECK (status = 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE schools IS 'Verified directory of Nepal schools sourced primarily from official IEMIS/CEHRD data.';
COMMENT ON COLUMN schools.source_url IS 'Primary URL supporting the published record.';
COMMENT ON COLUMN schools.last_verified_at IS 'Most recent time a human or trusted source confirmed the record.';

