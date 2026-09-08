-- Keep the public school directory responsive as the CEHRD registry grows.
-- The existing full-text index does not accelerate the directory's partial-name ILIKE search.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_schools_name_trigram
  ON schools USING gin (name gin_trgm_ops)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_schools_active_directory_order
  ON schools (is_featured DESC, name ASC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_schools_active_geography
  ON schools (province, district, name)
  WHERE status = 'active';

COMMENT ON INDEX idx_schools_name_trigram IS
  'Accelerates case-insensitive partial school-name searches in the public directory.';
