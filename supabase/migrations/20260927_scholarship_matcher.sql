-- Structured scholarship discovery and verification fields.
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS provider_name TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS scholarship_type TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS education_levels TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS target_groups TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS coverage TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_scholarships_matcher ON scholarships(is_active, deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_levels ON scholarships USING gin(education_levels);
CREATE INDEX IF NOT EXISTS idx_scholarships_targets ON scholarships USING gin(target_groups);

COMMENT ON COLUMN scholarships.target_groups IS 'Non-exclusive discovery tags such as need_based, merit, female, disability, dalit, janajati or remote_area.';
COMMENT ON COLUMN scholarships.last_verified_at IS 'Date the editor checked the scholarship against its primary source.';
