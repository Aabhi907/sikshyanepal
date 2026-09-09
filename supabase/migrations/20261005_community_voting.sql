-- Anonymous, reversible Reddit-style voting with server-side score calculation.
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS vote_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE community_comments ADD COLUMN IF NOT EXISTS vote_score INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (target_type, target_id, fingerprint_hash)
);

CREATE INDEX IF NOT EXISTS idx_community_votes_target ON community_votes(target_type, target_id);
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION cast_community_vote(p_target_type TEXT, p_target_id UUID, p_fingerprint_hash TEXT, p_value SMALLINT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_value SMALLINT;
  new_score INTEGER;
BEGIN
  IF p_target_type NOT IN ('post', 'comment') OR p_value NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'Invalid vote';
  END IF;

  IF p_target_type = 'post' AND NOT EXISTS (SELECT 1 FROM community_posts WHERE id = p_target_id AND status = 'published') THEN
    RAISE EXCEPTION 'Published post not found';
  END IF;
  IF p_target_type = 'comment' AND NOT EXISTS (SELECT 1 FROM community_comments WHERE id = p_target_id AND status = 'published') THEN
    RAISE EXCEPTION 'Published comment not found';
  END IF;

  SELECT value INTO existing_value FROM community_votes
  WHERE target_type = p_target_type AND target_id = p_target_id AND fingerprint_hash = p_fingerprint_hash
  FOR UPDATE;

  IF existing_value = p_value THEN
    DELETE FROM community_votes WHERE target_type = p_target_type AND target_id = p_target_id AND fingerprint_hash = p_fingerprint_hash;
  ELSIF existing_value IS NULL THEN
    INSERT INTO community_votes (target_type, target_id, fingerprint_hash, value)
    VALUES (p_target_type, p_target_id, p_fingerprint_hash, p_value);
  ELSE
    UPDATE community_votes SET value = p_value, updated_at = NOW()
    WHERE target_type = p_target_type AND target_id = p_target_id AND fingerprint_hash = p_fingerprint_hash;
  END IF;

  SELECT COALESCE(SUM(value), 0)::INTEGER INTO new_score FROM community_votes
  WHERE target_type = p_target_type AND target_id = p_target_id;

  IF p_target_type = 'post' THEN
    UPDATE community_posts SET vote_score = new_score WHERE id = p_target_id;
  ELSE
    UPDATE community_comments SET vote_score = new_score WHERE id = p_target_id;
  END IF;
  RETURN new_score;
END;
$$;

REVOKE ALL ON FUNCTION cast_community_vote(TEXT, UUID, TEXT, SMALLINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cast_community_vote(TEXT, UUID, TEXT, SMALLINT) TO service_role;
