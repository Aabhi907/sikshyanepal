CREATE TABLE IF NOT EXISTS search_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN ('search', 'zero_result')),
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 2 AND 120),
  result_count SMALLINT NOT NULL DEFAULT 0 CHECK (result_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_events_created ON search_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_type ON search_events(event_type, created_at DESC);
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE search_events IS 'Privacy-minimised search demand signals. No user identity, IP address, or full session data is stored.';
