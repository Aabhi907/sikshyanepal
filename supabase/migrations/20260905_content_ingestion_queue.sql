-- Source-backed content ingestion and editorial review queue.
-- Scrapers write here; only an authenticated editor promotes content publicly.

CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'official' CHECK (source_type IN ('official', 'institution', 'trusted_media')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  requires_review BOOLEAN NOT NULL DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_ingestion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES content_sources(id) ON DELETE SET NULL,
  scraper_name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('news', 'notice', 'result')),
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_published_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  fingerprint TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'duplicate', 'failed')),
  quality_flags TEXT[] NOT NULL DEFAULT '{}',
  reviewer_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  published_record_id UUID,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingestion_status ON content_ingestion_items(status, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_source ON content_ingestion_items(source_id, fetched_at DESC);
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ingestion_items ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE content_ingestion_items IS 'Quarantine queue for externally collected content. Never publish pending rows directly.';
COMMENT ON COLUMN content_ingestion_items.fingerprint IS 'SHA-256 of normalized target, title and canonical source URL for deduplication.';
