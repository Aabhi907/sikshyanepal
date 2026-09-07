CREATE TABLE IF NOT EXISTS saved_schools (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, school_id));
CREATE INDEX IF NOT EXISTS idx_saved_schools_user ON saved_schools(user_id, created_at DESC);
ALTER TABLE saved_schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved schools" ON saved_schools FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
