-- Field-level provenance for decision-critical college information.
CREATE TABLE IF NOT EXISTS college_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL CHECK (field_key IN ('affiliation','programs','fee','admission_deadline','scholarship','result','facilities','contact')),
  claim_summary TEXT NOT NULL CHECK (char_length(claim_summary) BETWEEN 3 AND 500),
  source_name TEXT NOT NULL CHECK (char_length(source_name) BETWEEN 2 AND 200),
  source_url TEXT NOT NULL CHECK (source_url ~ '^https://'),
  source_published_at TIMESTAMPTZ,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confidence_score SMALLINT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','source_verified','editor_verified','rejected')),
  extraction_method TEXT NOT NULL DEFAULT 'manual' CHECK (extraction_method IN ('manual','structured_import','automated_extraction')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  superseded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_college_evidence_current_claim ON college_evidence(college_id, field_key, source_url) WHERE superseded_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_college_evidence_public ON college_evidence(college_id, verification_status, checked_at DESC) WHERE superseded_at IS NULL;
ALTER TABLE college_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read verified college evidence" ON college_evidence;
CREATE POLICY "Public can read verified college evidence" ON college_evidence FOR SELECT USING (verification_status IN ('source_verified','editor_verified') AND superseded_at IS NULL);

COMMENT ON TABLE college_evidence IS 'Auditable source evidence for individual college claims. Verification is separate from sponsorship.';
COMMENT ON COLUMN college_evidence.confidence_score IS 'Extraction confidence only; it is not a college quality score and never auto-publishes a claim.';
