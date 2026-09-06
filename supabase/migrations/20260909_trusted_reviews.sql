-- Trust-focused college reviews. Private evidence is deliberately stored outside
-- the public reviews table so approved review reads never expose it.

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS teaching_rating SMALLINT CHECK (teaching_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS facilities_rating SMALLINT CHECK (facilities_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS administration_rating SMALLINT CHECK (administration_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS value_rating SMALLINT CHECK (value_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS placement_rating SMALLINT CHECK (placement_rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'submitted', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS review_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  evidence_url TEXT,
  evidence_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_reviews_verification_status ON reviews(verification_status, created_at DESC);
ALTER TABLE review_verifications ENABLE ROW LEVEL SECURITY;

-- No public policy: verification proof is reviewed only through privileged APIs.
COMMENT ON TABLE review_verifications IS 'Private student-status evidence. Never select this table in public pages or APIs.';
COMMENT ON COLUMN reviews.verification_status IS 'Only staff may mark a review verified; institutions may not purchase or self-assign this status.';
