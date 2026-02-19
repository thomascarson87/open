-- =============================================================================
-- MATCHING DATA READINESS AUDIT
-- Checks whether data required by the matching algorithm is populated
-- =============================================================================

-- 1. CANDIDATE MATCHING READINESS (per dimension)
-- Shows which matching dimensions have enough data to produce real scores
SELECT
  cp.id,
  cp.name,
  -- Skills (10% weight) - needs skills array
  CASE WHEN skills_with_levels IS NOT NULL AND jsonb_array_length(skills_with_levels) > 0 THEN 'READY'
       WHEN skills IS NOT NULL AND jsonb_array_length(skills) > 0 THEN 'PARTIAL'
       ELSE 'NO DATA' END AS skills_dimension,
  -- Salary (8% weight) - needs salary_min
  CASE WHEN salary_min IS NOT NULL THEN 'READY' ELSE 'NO DATA' END AS salary_dimension,
  -- Work Mode (7% weight) - needs preferred_work_mode
  CASE WHEN preferred_work_mode IS NOT NULL AND array_length(preferred_work_mode, 1) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS work_mode_dimension,
  -- Work Style (7% weight) - needs work_style_preferences
  CASE WHEN work_style_preferences IS NOT NULL AND work_style_preferences != '{}'::jsonb THEN 'READY'
       ELSE 'NO DATA' END AS work_style_dimension,
  -- Team Fit (6% weight) - needs team_collaboration_preferences
  CASE WHEN team_collaboration_preferences IS NOT NULL AND team_collaboration_preferences != '{}'::jsonb THEN 'READY'
       ELSE 'NO DATA' END AS team_fit_dimension,
  -- Management Fit (9% weight) - needs management preferences
  CASE WHEN preferred_leadership_style IS NOT NULL
         OR preferred_feedback_frequency IS NOT NULL
         OR preferred_communication_style IS NOT NULL THEN 'READY'
       ELSE 'NO DATA' END AS mgmt_fit_dimension,
  -- Location (5% weight) - needs location
  CASE WHEN location IS NOT NULL AND location != '' THEN 'READY'
       ELSE 'NO DATA' END AS location_dimension,
  -- Language (5% weight) - needs languages
  CASE WHEN languages IS NOT NULL AND jsonb_array_length(languages) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS language_dimension,
  -- Timezone (5% weight) - needs timezone/preferred_timezone
  CASE WHEN timezone IS NOT NULL OR preferred_timezone IS NOT NULL THEN 'READY'
       ELSE 'NO DATA' END AS timezone_dimension,
  -- Industry (5% weight) - needs interested_industries
  CASE WHEN interested_industries IS NOT NULL AND array_length(interested_industries, 1) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS industry_dimension,
  -- Culture/Values (3% weight) - needs values_list
  CASE WHEN values_list IS NOT NULL AND array_length(values_list, 1) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS culture_dimension,
  -- Impact (5% weight) - needs current_impact_scope
  CASE WHEN current_impact_scope IS NOT NULL THEN 'READY'
       ELSE 'NO DATA' END AS impact_dimension
FROM candidate_profiles cp
WHERE (is_mock_data = false OR is_mock_data IS NULL)
  AND (is_test_signup = false OR is_test_signup IS NULL)
ORDER BY created_at DESC;

-- 2. JOB MATCHING READINESS
SELECT
  j.id,
  j.title,
  j.company_name,
  CASE WHEN required_skills_with_levels IS NOT NULL AND jsonb_array_length(required_skills_with_levels) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS skills_ready,
  CASE WHEN salary_min IS NOT NULL OR salary_max IS NOT NULL THEN 'READY'
       ELSE 'NO DATA' END AS salary_ready,
  CASE WHEN work_mode IS NOT NULL THEN 'READY' ELSE 'NO DATA' END AS work_mode_ready,
  CASE WHEN work_style_requirements IS NOT NULL AND work_style_requirements != '{}'::jsonb THEN 'READY'
       ELSE 'NO DATA' END AS work_style_ready,
  CASE WHEN team_requirements IS NOT NULL AND team_requirements != '{}'::jsonb THEN 'READY'
       ELSE 'NO DATA' END AS team_reqs_ready,
  CASE WHEN required_impact_scope IS NOT NULL THEN 'READY'
       ELSE 'NO DATA' END AS impact_ready,
  CASE WHEN preferred_languages IS NOT NULL AND jsonb_array_length(preferred_languages) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS language_ready,
  CASE WHEN required_timezone_overlap IS NOT NULL THEN 'READY'
       ELSE 'NO DATA' END AS timezone_ready
FROM jobs j
WHERE status = 'published'
ORDER BY posted_date DESC;

-- 3. COMPANY PROFILE MATCHING READINESS (for company-level matching)
SELECT
  cp.id,
  cp.company_name,
  CASE WHEN industry IS NOT NULL AND array_length(industry, 1) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS industry_ready,
  CASE WHEN values IS NOT NULL AND array_length(values, 1) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS values_ready,
  CASE WHEN desired_traits IS NOT NULL AND array_length(desired_traits, 1) > 0 THEN 'READY'
       ELSE 'NO DATA' END AS traits_ready,
  CASE WHEN work_style_culture IS NOT NULL AND work_style_culture != '{}'::jsonb THEN 'READY'
       ELSE 'NO DATA' END AS work_style_culture_ready,
  CASE WHEN team_structure IS NOT NULL AND team_structure != '{}'::jsonb THEN 'READY'
       ELSE 'NO DATA' END AS team_structure_ready,
  CASE WHEN focus_type IS NOT NULL THEN 'READY' ELSE 'NO DATA' END AS focus_type_ready,
  CASE WHEN mission_orientation IS NOT NULL THEN 'READY' ELSE 'NO DATA' END AS mission_orientation_ready,
  CASE WHEN remote_policy IS NOT NULL THEN 'READY' ELSE 'NO DATA' END AS remote_policy_ready,
  CASE WHEN headquarters_location IS NOT NULL AND headquarters_location != '' THEN 'READY'
       ELSE 'NO DATA' END AS location_ready,
  CASE WHEN funding_stage IS NOT NULL THEN 'READY' ELSE 'NO DATA' END AS funding_stage_ready
FROM company_profiles cp
WHERE (is_mock_data = false OR is_mock_data IS NULL)
ORDER BY updated_at DESC;

-- 4. OVERALL SUMMARY COUNTS
SELECT
  'Candidates with skills data' AS metric,
  COUNT(*) FILTER (WHERE skills_with_levels IS NOT NULL AND jsonb_array_length(skills_with_levels) > 0) AS ready_count,
  COUNT(*) AS total_count
FROM candidate_profiles WHERE (is_mock_data = false OR is_mock_data IS NULL)
UNION ALL
SELECT
  'Candidates with work style prefs',
  COUNT(*) FILTER (WHERE work_style_preferences IS NOT NULL AND work_style_preferences != '{}'::jsonb),
  COUNT(*)
FROM candidate_profiles WHERE (is_mock_data = false OR is_mock_data IS NULL)
UNION ALL
SELECT
  'Candidates with mgmt prefs',
  COUNT(*) FILTER (WHERE preferred_leadership_style IS NOT NULL),
  COUNT(*)
FROM candidate_profiles WHERE (is_mock_data = false OR is_mock_data IS NULL)
UNION ALL
SELECT
  'Companies with focus_type',
  COUNT(*) FILTER (WHERE focus_type IS NOT NULL),
  COUNT(*)
FROM company_profiles WHERE (is_mock_data = false OR is_mock_data IS NULL)
UNION ALL
SELECT
  'Companies with work_style_culture',
  COUNT(*) FILTER (WHERE work_style_culture IS NOT NULL AND work_style_culture != '{}'::jsonb),
  COUNT(*)
FROM company_profiles WHERE (is_mock_data = false OR is_mock_data IS NULL)
UNION ALL
SELECT
  'Published jobs with work_style_requirements',
  COUNT(*) FILTER (WHERE work_style_requirements IS NOT NULL AND work_style_requirements != '{}'::jsonb),
  COUNT(*)
FROM jobs WHERE status = 'published'
UNION ALL
SELECT
  'HM preference sets',
  COUNT(*),
  COUNT(*)
FROM hiring_manager_preferences;
