-- Enforce the product boundary:
-- schools = ECD / Grades 1-10; colleges = +2 / Bachelor / Master and above.

-- Mixed Grade 1-12 institutions remain discoverable as schools only for their
-- Grade 1-10 offering. Their +2 offering belongs in the colleges directory.
UPDATE schools SET grades_to = 10 WHERE grades_to > 10 AND COALESCE(grades_from, 0) <= 10;
UPDATE schools SET status = 'pending_review' WHERE grades_from > 10;
UPDATE schools SET school_level = 'secondary' WHERE school_level = 'higher_secondary';

ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_school_level_check;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_grades_from_check;
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_grades_to_check;
ALTER TABLE schools ADD CONSTRAINT schools_school_level_check CHECK (school_level IN ('pre_primary', 'basic', 'secondary', 'multiple'));
ALTER TABLE schools ADD CONSTRAINT schools_grades_from_check CHECK (grades_from BETWEEN 0 AND 10);
ALTER TABLE schools ADD CONSTRAINT schools_grades_to_check CHECK (grades_to BETWEEN 0 AND 10);

ALTER TABLE colleges ADD COLUMN IF NOT EXISTS education_levels TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE colleges DROP CONSTRAINT IF EXISTS colleges_education_levels_check;
ALTER TABLE colleges ADD CONSTRAINT colleges_education_levels_check
  CHECK (education_levels <@ ARRAY['plus_two', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate']::TEXT[]);
CREATE INDEX IF NOT EXISTS idx_colleges_education_levels ON colleges USING gin(education_levels);

-- Backfill level tags from structured program relationships where available.
UPDATE colleges AS college
SET education_levels = inferred.levels
FROM (
  SELECT cp.college_id, array_agg(DISTINCT CASE WHEN p.degree_level = '+2' THEN 'plus_two' ELSE p.degree_level END) AS levels
  FROM college_programs cp JOIN programs p ON p.id = cp.program_id
  WHERE p.degree_level IN ('+2', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate')
  GROUP BY cp.college_id
) AS inferred
WHERE college.id = inferred.college_id AND cardinality(college.education_levels) = 0;

-- Clean legacy admission classifications before enforcing the same boundary.
UPDATE admissions SET education_level = NULL, status = 'draft'
WHERE institution_type = 'school' AND education_level IS NOT NULL AND education_level NOT IN ('ECD / Grade 1-10', 'SEE');
UPDATE admissions SET education_level = NULL, status = 'draft'
WHERE institution_type IN ('college', 'university') AND education_level IS NOT NULL
  AND education_level NOT IN ('+2', 'Diploma', 'Certificate', 'Bachelor', 'Master', 'MPhil', 'PhD');
ALTER TABLE admissions DROP CONSTRAINT IF EXISTS admissions_institution_level_check;
ALTER TABLE admissions ADD CONSTRAINT admissions_institution_level_check CHECK (
  education_level IS NULL OR
  (institution_type = 'school' AND education_level IN ('ECD / Grade 1-10', 'SEE')) OR
  (institution_type IN ('college', 'university') AND education_level IN ('+2', 'Diploma', 'Certificate', 'Bachelor', 'Master', 'MPhil', 'PhD')) OR
  institution_type IN ('training_provider', 'other')
);

COMMENT ON TABLE schools IS 'Nepal institutions providing education from ECD through Grade 10 only.';
COMMENT ON COLUMN colleges.education_levels IS 'Post-SEE levels offered: +2, Bachelor, Master, research degrees, diploma or certificate.';
