-- Rank all mapped active schools in PostgreSQL instead of sorting an arbitrary API subset.
CREATE OR REPLACE FUNCTION nearby_active_schools(
  search_latitude DOUBLE PRECISION,
  search_longitude DOUBLE PRECISION,
  result_limit INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  district TEXT,
  local_level TEXT,
  verification_status TEXT,
  grades_from SMALLINT,
  grades_to SMALLINT,
  distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    school.id,
    school.name,
    school.slug,
    school.district,
    school.local_level,
    school.verification_status,
    school.grades_from,
    school.grades_to,
    6371 * acos(least(1, greatest(-1,
      cos(radians(search_latitude)) * cos(radians(school.latitude::double precision))
      * cos(radians(school.longitude::double precision) - radians(search_longitude))
      + sin(radians(search_latitude)) * sin(radians(school.latitude::double precision))
    ))) AS distance_km
  FROM schools AS school
  WHERE school.status = 'active'
    AND school.latitude IS NOT NULL
    AND school.longitude IS NOT NULL
  ORDER BY 9 ASC
  LIMIT least(greatest(result_limit, 1), 50);
$$;

GRANT EXECUTE ON FUNCTION nearby_active_schools(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO anon, authenticated;

COMMENT ON FUNCTION nearby_active_schools IS
  'Returns active mapped schools ranked by approximate great-circle distance in kilometres.';
