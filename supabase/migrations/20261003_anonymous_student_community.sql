-- Anonymous student community with mandatory editorial moderation.
-- Public users never receive submission fingerprints or moderation notes.

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 10 AND 120),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 30 AND 2000),
  topic TEXT NOT NULL CHECK (topic IN ('college-life', 'admissions', 'programs', 'entrance-exams', 'scholarships', 'study-help', 'wellbeing', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'hidden')),
  fingerprint_hash TEXT NOT NULL,
  moderation_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 2 AND 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'hidden')),
  fingerprint_hash TEXT NOT NULL,
  moderation_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('personal-information', 'bullying', 'spam', 'unsafe-advice', 'false-information', 'other')),
  details TEXT CHECK (details IS NULL OR char_length(details) <= 500),
  fingerprint_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_posts_public ON community_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_rate ON community_posts(fingerprint_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_public ON community_comments(post_id, status, published_at);
CREATE INDEX IF NOT EXISTS idx_community_comments_rate ON community_comments(fingerprint_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_open ON community_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_rate ON community_reports(fingerprint_hash, created_at DESC);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published community posts are public" ON community_posts;
CREATE POLICY "Published community posts are public" ON community_posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Published community comments are public" ON community_comments;
CREATE POLICY "Published community comments are public" ON community_comments FOR SELECT USING (status = 'published');

COMMENT ON COLUMN community_posts.fingerprint_hash IS 'One-way abuse-control fingerprint. Never return through a public API.';
COMMENT ON TABLE community_reports IS 'Private moderation reports. Service-role access only.';
