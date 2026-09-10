-- Link new reviews privately to an authenticated account without exposing email publicly.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_author ON reviews(author_id, created_at DESC);
COMMENT ON COLUMN reviews.author_id IS 'Private accountability link. Never expose through public review queries.';
