-- Require traceable editorial and source metadata for future news publishing.
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'SikshyaNepal Editorial',
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';

DO $$ BEGIN
  ALTER TABLE news ADD CONSTRAINT news_status_check CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_news_publication_status
  ON news (status, published_date DESC);

COMMENT ON COLUMN news.source_url IS 'Direct original source supporting the article; required by the application before publication.';
COMMENT ON COLUMN news.last_verified_at IS 'Time the editor last checked the article against its named source.';
