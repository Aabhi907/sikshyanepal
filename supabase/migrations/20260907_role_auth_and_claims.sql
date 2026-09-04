-- Role-based accounts, institution claims, memberships and audit history.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'representative', 'reviewer', 'editor', 'owner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS institution_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('school', 'college')), entity_id UUID NOT NULL,
  institution_name TEXT NOT NULL, claimant_name TEXT NOT NULL, claimant_role TEXT NOT NULL,
  official_email TEXT NOT NULL, official_phone TEXT, evidence_url TEXT, evidence_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id), reviewer_notes TEXT, reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);
CREATE TABLE IF NOT EXISTS institution_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('school', 'college')), entity_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'representative' CHECK (role IN ('representative', 'manager')),
  granted_by UUID REFERENCES auth.users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN INSERT INTO public.profiles (id, full_name) VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', '')) ON CONFLICT (id) DO NOTHING; RETURN new; END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_claims_status ON institution_claims(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON institution_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; ALTER TABLE institution_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_memberships ENABLE ROW LEVEL SECURITY; ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users read own profile" ON profiles FOR SELECT TO authenticated USING (id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users submit own claims" ON institution_claims FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users read own claims" ON institution_claims FOR SELECT TO authenticated USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users read own memberships" ON institution_memberships FOR SELECT TO authenticated USING (user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMENT ON TABLE institution_claims IS 'Evidence-backed requests to manage school or college profiles; approval is always manual.';
COMMENT ON TABLE audit_logs IS 'Append-only record of privileged actions performed through the application.';
