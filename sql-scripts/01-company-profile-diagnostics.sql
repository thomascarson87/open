-- =============================================================================
-- COMPANY PROFILE DIAGNOSTICS
-- Run in Supabase SQL Editor to detect data integrity issues
-- =============================================================================

-- 1. Company profiles with missing critical fields
SELECT
  id,
  company_name,
  CASE WHEN company_name IS NULL OR company_name = '' THEN 'MISSING' ELSE 'OK' END AS company_name_status,
  CASE WHEN industry IS NULL OR array_length(industry, 1) IS NULL THEN 'EMPTY' ELSE array_length(industry, 1)::text END AS industry_count,
  CASE WHEN values IS NULL OR array_length(values, 1) IS NULL THEN 'EMPTY' ELSE array_length(values, 1)::text END AS values_count,
  CASE WHEN focus_type IS NULL THEN 'NOT SET' ELSE focus_type END AS focus_type,
  CASE WHEN mission_orientation IS NULL THEN 'NOT SET' ELSE mission_orientation END AS mission_orientation,
  CASE WHEN work_style IS NULL THEN 'NOT SET' ELSE work_style END AS work_style,
  CASE WHEN work_style_culture IS NULL OR work_style_culture = '{}'::jsonb THEN 'EMPTY' ELSE 'SET' END AS work_style_culture,
  CASE WHEN team_structure IS NULL OR team_structure = '{}'::jsonb THEN 'EMPTY' ELSE 'SET' END AS team_structure,
  CASE WHEN remote_policy IS NULL THEN 'NOT SET' ELSE remote_policy END AS remote_policy,
  CASE WHEN company_size_range IS NULL THEN 'NOT SET' ELSE company_size_range END AS company_size_range,
  CASE WHEN default_timezone IS NULL THEN 'NOT SET' ELSE default_timezone END AS default_timezone,
  CASE WHEN visa_sponsorship_policy IS NULL THEN 'NOT SET' ELSE visa_sponsorship_policy END AS visa_sponsorship_policy
FROM company_profiles
WHERE is_mock_data = false OR is_mock_data IS NULL
ORDER BY created_at DESC;

-- 2. Check for deprecated 'size' column usage vs 'company_size_range'
SELECT
  id,
  company_name,
  size AS deprecated_size_column,
  company_size_range AS current_size_column,
  CASE
    WHEN size IS NOT NULL AND company_size_range IS NULL THEN 'NEEDS MIGRATION'
    WHEN size IS NOT NULL AND company_size_range IS NOT NULL THEN 'BOTH SET'
    ELSE 'OK'
  END AS migration_status
FROM company_profiles
WHERE size IS NOT NULL;

-- 3. Check for deprecated 'location' column usage vs 'headquarters_location'
SELECT
  id,
  company_name,
  location AS deprecated_location_column,
  headquarters_location AS current_location_column
FROM company_profiles
WHERE location IS NOT NULL AND (headquarters_location IS NULL OR headquarters_location = '');

-- 4. Company profiles with certification/regulatory data
SELECT
  id,
  company_name,
  array_length(required_certifications, 1) AS required_cert_count,
  array_length(preferred_certifications, 1) AS preferred_cert_count,
  array_length(regulatory_domains, 1) AS regulatory_domain_count
FROM company_profiles
WHERE (required_certifications IS NOT NULL AND array_length(required_certifications, 1) > 0)
   OR (preferred_certifications IS NOT NULL AND array_length(preferred_certifications, 1) > 0)
   OR (regulatory_domains IS NOT NULL AND array_length(regulatory_domains, 1) > 0);

-- 5. Validate enum values match CHECK constraints
SELECT id, company_name, remote_policy
FROM company_profiles
WHERE remote_policy IS NOT NULL
  AND remote_policy NOT IN ('Remote-First', 'Remote-Friendly', 'Hybrid', 'Office-First', 'Office-Only');

SELECT id, company_name, company_size_range
FROM company_profiles
WHERE company_size_range IS NOT NULL
  AND company_size_range NOT IN ('SEED', 'EARLY', 'MID', 'LARGE', 'ENTERPRISE');

SELECT id, company_name, focus_type
FROM company_profiles
WHERE focus_type IS NOT NULL
  AND focus_type NOT IN ('product_led', 'consultancy', 'agency', 'hybrid');
