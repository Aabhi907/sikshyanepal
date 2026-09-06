CREATE TABLE IF NOT EXISTS student_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('internship','apprenticeship','fellowship','competition','course','volunteering','project')),
  organisation TEXT NOT NULL, location TEXT, eligibility TEXT, summary TEXT NOT NULL, application_url TEXT NOT NULL,
  deadline TIMESTAMPTZ, is_verified BOOLEAN NOT NULL DEFAULT FALSE, is_published BOOLEAN NOT NULL DEFAULT FALSE,
  source_url TEXT, last_verified_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opportunities_public ON student_opportunities(is_published, deadline);
ALTER TABLE student_opportunities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Public reads published opportunities" ON student_opportunities FOR SELECT USING (is_published = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
COMMENT ON TABLE student_opportunities IS 'Editorially verified external opportunities. Never publish an item without a direct official application source.';
