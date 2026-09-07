-- Verified syllabi and past-question resource library.
CREATE TABLE IF NOT EXISTS syllabus (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE, university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE, semester TEXT, title TEXT NOT NULL, file_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS old_questions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE, university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE, semester TEXT, year INTEGER, subject TEXT NOT NULL, file_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE syllabus ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE old_questions ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE old_questions ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE old_questions ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_syllabus_public ON syllabus(is_published, program_id, university_id);
CREATE INDEX IF NOT EXISTS idx_old_questions_public ON old_questions(is_published, program_id, university_id, year DESC);
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE old_questions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Public read verified syllabus" ON syllabus FOR SELECT TO anon, authenticated USING (is_published = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Public read verified old questions" ON old_questions FOR SELECT TO anon, authenticated USING (is_published = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
