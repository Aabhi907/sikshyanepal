-- Allow visitors to read published college profiles.
-- SQL Editor/admin queries bypass RLS, so rows can exist while the website sees none.

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read active college directory"
    ON colleges
    FOR SELECT
    TO anon, authenticated
    USING (status = 'active');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Directory enrichment is public, while writes remain protected by RLS.
DO $$ BEGIN
  CREATE POLICY "Public read college program links"
    ON college_programs
    FOR SELECT
    TO anon, authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public read college program catalogue"
    ON programs
    FOR SELECT
    TO anon, authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public read approved college reviews"
    ON reviews
    FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON POLICY "Public read active college directory" ON colleges IS
  'Exposes active college profiles to the public directory; pending and inactive profiles remain private.';
