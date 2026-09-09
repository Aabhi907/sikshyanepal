-- Pseudonymous, accountable community: public aliases; private account linkage.
-- Run after 20261005_community_voting.sql.

CREATE TABLE IF NOT EXISTS community_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_alias TEXT NOT NULL,
  alias_key TEXT GENERATED ALWAYS AS (lower(public_alias)) STORED,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_alias_format CHECK (
    char_length(public_alias) BETWEEN 3 AND 24
    AND public_alias ~ '^[A-Za-z0-9_]+$'
  ),
  UNIQUE (alias_key)
);

ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS public_alias TEXT;

ALTER TABLE community_comments
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS public_alias TEXT;

ALTER TABLE community_reports
  ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS community_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('post', 'comment', 'report', 'vote', 'delete', 'appeal')),
  target_id UUID,
  fingerprint_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days')
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON community_comments(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_security_expiry ON community_security_events(expires_at);

ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own community profile" ON community_profiles;
CREATE POLICY "Users read own community profile" ON community_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

COMMENT ON TABLE community_profiles IS 'Public aliases linked privately to authenticated accounts. Never expose user_id through public community APIs.';
COMMENT ON COLUMN community_posts.author_id IS 'Private accountability link. Public queries must select explicit columns and exclude this field.';
COMMENT ON TABLE community_security_events IS 'Private, time-limited security trail. Delete expired rows on a scheduled basis.';

-- Call periodically (for example daily from a protected maintenance job).
CREATE OR REPLACE FUNCTION delete_expired_community_security_events()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE deleted_count INTEGER;
BEGIN
  DELETE FROM community_security_events WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
REVOKE ALL ON FUNCTION delete_expired_community_security_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_expired_community_security_events() TO service_role;
