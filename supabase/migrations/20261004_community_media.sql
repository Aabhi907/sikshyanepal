-- Photo and short-video support for moderated anonymous community posts.
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IS NULL OR media_type IN ('image', 'video'));

ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_body_check;
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_content_check;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_body_check CHECK (char_length(body) BETWEEN 0 AND 2000);
ALTER TABLE community_posts ADD CONSTRAINT community_posts_content_check CHECK (char_length(body) >= 30 OR media_url IS NOT NULL);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  TRUE,
  31457280,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMENT ON COLUMN community_posts.media_url IS 'Public URL for moderator-approved post media; uploads use unguessable object names.';
