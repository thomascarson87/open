-- =============================================================================
-- JOBS DIAGNOSTICS
-- Run in Supabase SQL Editor to detect data integrity issues
-- =============================================================================

-- 1. Published jobs with missing critical fields
SELECT
  j.id,
  j.title,
  j.company_name,
  j.status,
  CASE WHEN j.title IS NULL OR j.title = '' THEN 'MISSING' ELSE 'OK' END AS title_status,
  CASE WHEN j.description IS NULL OR j.description = '' THEN 'MISSING' ELSE 'OK' END AS desc_status,
  CASE WHEN j.required_skills IS NULL OR j.required_skills = '[]'::jsonb THEN 'EMPTY' ELSE jsonb_array_length(j.required_skills)::text END AS skills_count,
  CASE WHEN j.required_skills_with_levels IS NULL OR j.required_skills_with_levels = '[]'::jsonb THEN 'EMPTY' ELSE jsonb_array_length(j.required_skills_with_levels)::text END AS skills_levels_count,
  CASE WHEN j.work_style_requirements IS NULL OR j.work_style_requirements = '{}'::jsonb THEN 'EMPTY' ELSE 'SET' END AS work_style_reqs,
  CASE WHEN j.team_requirements IS NULL OR j.team_requirements = '{}'::jsonb THEN 'EMPTY' ELSE 'SET' END AS team_reqs,
  CASE WHEN j.required_languages IS NULL OR j.required_languages = '[]'::jsonb THEN 'EMPTY' ELSE 'SET' END AS required_langs,
  CASE WHEN j.preferred_languages IS NULL OR j.preferred_languages = '[]'::jsonb THEN 'EMPTY' ELSE 'SET' END AS preferred_langs,
  CASE WHEN j.timezone_requirements IS NULL THEN 'NOT SET' ELSE j.timezone_requirements END AS tz_reqs,
  j.required_timezone_overlap,
  j.canonical_role_id
FROM jobs j
WHERE j.status = 'published'
ORDER BY j.posted_date DESC;

-- 2. Check required_skills vs required_skills_with_levels consistency
SELECT
  id,
  title,
  jsonb_array_length(COALESCE(required_skills, '[]'::jsonb)) AS basic_skills_count,
  jsonb_array_length(COALESCE(required_skills_with_levels, '[]'::jsonb)) AS leveled_skills_count,
  CASE
    WHEN required_skills_with_levels IS NOT NULL AND jsonb_array_length(required_skills_with_levels) > 0
         AND (required_skills IS NULL OR jsonb_array_length(required_skills) = 0)
    THEN 'ONLY_LEVELED'
    WHEN required_skills IS NOT NULL AND jsonb_array_length(required_skills) > 0
         AND (required_skills_with_levels IS NULL OR jsonb_array_length(required_skills_with_levels) = 0)
    THEN 'ONLY_BASIC'
    WHEN jsonb_array_length(COALESCE(required_skills, '[]'::jsonb)) != jsonb_array_length(COALESCE(required_skills_with_levels, '[]'::jsonb))
    THEN 'COUNT_MISMATCH'
    ELSE 'OK'
  END AS consistency
FROM jobs
WHERE status = 'published';

-- 3. Jobs with orphaned desired_myers_briggs or desired_disc_profile data
SELECT
  id,
  title,
  desired_myers_briggs,
  desired_disc_profile,
  desired_disc_profile_legacy
FROM jobs
WHERE (desired_myers_briggs IS NOT NULL AND array_length(desired_myers_briggs, 1) > 0)
   OR desired_disc_profile IS NOT NULL
   OR desired_disc_profile_legacy IS NOT NULL;

-- 4. Validate certification UUIDs reference actual certifications
SELECT
  j.id AS job_id,
  j.title,
  unnest(j.required_certifications) AS cert_uuid,
  c.name AS cert_name
FROM jobs j
CROSS JOIN LATERAL unnest(j.required_certifications) AS cert_uuid
LEFT JOIN certifications c ON c.id = cert_uuid
WHERE j.required_certifications IS NOT NULL
  AND array_length(j.required_certifications, 1) > 0
  AND c.id IS NULL;

-- 5. Validate regulatory_domains UUIDs reference actual domains
SELECT
  j.id AS job_id,
  j.title,
  unnest(j.regulatory_domains) AS domain_uuid,
  rd.name AS domain_name
FROM jobs j
CROSS JOIN LATERAL unnest(j.regulatory_domains) AS domain_uuid
LEFT JOIN regulatory_domains rd ON rd.id = domain_uuid
WHERE j.regulatory_domains IS NOT NULL
  AND array_length(j.regulatory_domains, 1) > 0
  AND rd.id IS NULL;

-- 6. Language data structure check (verify shape of preferred_languages JSON)
SELECT
  id,
  title,
  preferred_languages,
  CASE
    WHEN preferred_languages IS NOT NULL
         AND jsonb_array_length(preferred_languages) > 0
         AND NOT (preferred_languages->0 ? 'minimumLevel')
         AND (preferred_languages->0 ? 'minProficiency')
    THEN 'OLD_FORMAT (minProficiency)'
    WHEN preferred_languages IS NOT NULL
         AND jsonb_array_length(preferred_languages) > 0
         AND (preferred_languages->0 ? 'minimumLevel')
    THEN 'CURRENT_FORMAT (minimumLevel)'
    ELSE 'EMPTY_OR_NULL'
  END AS language_format
FROM jobs
WHERE preferred_languages IS NOT NULL
  AND preferred_languages != '[]'::jsonb;

-- 7. Jobs missing company_id reference
SELECT j.id, j.title, j.company_id
FROM jobs j
LEFT JOIN company_profiles cp ON cp.id = j.company_id
WHERE cp.id IS NULL;
