-- Governance and health metadata for every automated content source.
ALTER TABLE content_sources
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS trust_level SMALLINT NOT NULL DEFAULT 80 CHECK (trust_level BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS permitted_targets TEXT[] NOT NULL DEFAULT ARRAY['news', 'notice', 'result'],
  ADD COLUMN IF NOT EXISTS fetch_frequency_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS parsing_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS robots_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error TEXT;

CREATE INDEX IF NOT EXISTS idx_content_sources_health ON content_sources(is_active, consecutive_failures DESC, last_success_at DESC);
COMMENT ON COLUMN content_sources.trust_level IS 'Operational trust score for source governance; it is not permission to auto-publish.';
COMMENT ON COLUMN content_sources.permitted_targets IS 'Content types this source is approved to provide.';
