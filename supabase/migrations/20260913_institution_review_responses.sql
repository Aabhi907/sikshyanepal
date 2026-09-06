CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL CHECK (char_length(response_text) BETWEEN 20 AND 3000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id, status);
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published review responses" ON review_responses FOR SELECT TO anon USING (status = 'published');
COMMENT ON TABLE review_responses IS 'Moderated responses from approved institution representatives. Paid promotion does not affect review responses or ratings.';
