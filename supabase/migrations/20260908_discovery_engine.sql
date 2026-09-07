-- College and program discovery foundation.

ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_degree_level_check;
ALTER TABLE programs ADD CONSTRAINT programs_degree_level_check
  CHECK (degree_level IN ('+2', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate'));
ALTER TABLE programs ADD COLUMN IF NOT EXISTS overview TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS eligibility TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS entrance_requirements TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS curriculum_highlights TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS career_paths TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS average_fee_min DECIMAL(12,2) CHECK (average_fee_min >= 0);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS average_fee_max DECIMAL(12,2) CHECK (average_fee_max >= 0);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_fee_range_check;
ALTER TABLE programs ADD CONSTRAINT programs_fee_range_check CHECK (average_fee_min IS NULL OR average_fee_max IS NULL OR average_fee_min <= average_fee_max);

ALTER TABLE colleges ADD COLUMN IF NOT EXISTS facilities TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_colleges_geography ON colleges(province, district);
CREATE INDEX IF NOT EXISTS idx_colleges_verification ON colleges(verification_status);
CREATE INDEX IF NOT EXISTS idx_college_programs_fee ON college_programs(fee);
CREATE INDEX IF NOT EXISTS idx_college_programs_scholarship ON college_programs(scholarship_available) WHERE scholarship_available = TRUE;

CREATE TABLE IF NOT EXISTS saved_colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, college_id)
);
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read saved colleges" ON saved_colleges FOR SELECT TO authenticated USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users save colleges" ON saved_colleges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users remove saved colleges" ON saved_colleges FOR DELETE TO authenticated USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON COLUMN programs.source_url IS 'Official curriculum or awarding-body source used to verify program information.';
