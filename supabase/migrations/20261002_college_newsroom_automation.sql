-- College-first newsroom metadata and guarded automation.
ALTER TABLE news
  ADD COLUMN IF NOT EXISTS content_category TEXT NOT NULL DEFAULT 'college_news',
  ADD COLUMN IF NOT EXISTS education_levels TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS automation_mode TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS disclosure TEXT;

DO $$ BEGIN
  ALTER TABLE news ADD CONSTRAINT news_content_category_check CHECK (content_category IN ('college_news', 'admission', 'achievement', 'entrance_result', 'event', 'award', 'scholarship', 'ranking_methodology', 'policy'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE news ADD CONSTRAINT news_automation_mode_check CHECK (automation_mode IN ('manual', 'auto_published', 'editor_approved'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE content_ingestion_items
  ADD COLUMN IF NOT EXISTS content_category TEXT NOT NULL DEFAULT 'college_news',
  ADD COLUMN IF NOT EXISTS claim_risk TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS auto_publish_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS generation_version TEXT;

DO $$ BEGIN
  ALTER TABLE content_ingestion_items ADD CONSTRAINT ingestion_claim_risk_check CHECK (claim_risk IN ('low', 'medium', 'high'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE content_sources
  ADD COLUMN IF NOT EXISTS college_focus BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_publish_low_risk BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_news_college_category ON news (content_category, status, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_college_id ON news (college_id, status, published_date DESC) WHERE college_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ingestion_college_review ON content_ingestion_items (claim_risk, status, fetched_at DESC);

COMMENT ON COLUMN content_ingestion_items.claim_risk IS 'High-risk claims include rankings, awards, named ranks, result statistics and placement claims and always require editor review.';
COMMENT ON COLUMN content_ingestion_items.auto_publish_eligible IS 'True only for low-risk factual announcements from an official matched institution source; the collector still applies all publication checks.';
COMMENT ON COLUMN news.disclosure IS 'Editorial, automation or sponsorship disclosure shown with the article.';
