-- Keep a contact trail for public school-directory submissions.
ALTER TABLE schools ADD COLUMN IF NOT EXISTS submitted_by TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS submitter_role TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS submitter_contact TEXT;

COMMENT ON COLUMN schools.submitter_contact IS 'Private verification contact from a public listing submission; do not display publicly.';
