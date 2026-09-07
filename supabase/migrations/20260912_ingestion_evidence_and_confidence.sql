-- Preserve auditable evidence for every externally collected item.
ALTER TABLE content_ingestion_items
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS raw_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS confidence_score SMALLINT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'source_verified', 'editor_verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS last_source_check_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ingestion_confidence ON content_ingestion_items(status, confidence_score DESC, fetched_at DESC);
COMMENT ON COLUMN content_ingestion_items.raw_snapshot IS 'Source text captured for editorial verification only; it must not be republished verbatim.';
COMMENT ON COLUMN content_ingestion_items.confidence_score IS 'Deterministic extraction confidence. It informs review priority and never alone auto-publishes an item.';
