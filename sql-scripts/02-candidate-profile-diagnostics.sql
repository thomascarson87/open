-- =============================================================================
-- CANDIDATE PROFILE DIAGNOSTICS
-- Run in Supabase SQL Editor to detect data integrity issues
-- =============================================================================

-- 1. Candidate profiles with missing critical fields for matching
SELECT
  id,
  name,
  CASE WHEN name IS NULL OR name = '' THEN 'MISSING' ELSE 'OK' END AS name_status,
  CASE WHEN skills IS NULL OR skills = '[]'::jsonb THEN 'EMPTY' ELSE jsonb_array_length(skills)::text END AS skills_count,
  CASE WHEN skills_with_levels IS NULL OR skills_with_levels = '[]'::jsonb THEN 'EMPTY' ELSE jsonb_array_length(skills_with_levels)::text END AS skills_with_levels_count,
  CASE WHEN work_style_preferences IS NULL OR work_style_preferences = '{}'::jsonb THEN 'EMPTY' ELSE 'SET' END AS work_style_prefs,
  CASE WHEN team_collaboration_preferences IS NULL OR team_collaboration_preferences = '{}'::jsonb THEN 'EMPTY' ELSE 'SET' END AS team_collab_prefs,
  CASE WHEN current_impact_scope IS NULL THEN 'NOT SET' ELSE current_impact_scope::text END AS impact_scope,
  CASE WHEN salary_min IS NULL THEN 'NOT SET' ELSE salary_min::text END AS salary_min,
  CASE WHEN preferred_work_mode IS NULL OR array_length(preferred_work_mode, 1) IS NULL THEN 'EMPTY' ELSE 'SET' END AS work_mode,
  onboarding_stage
FROM candidate_profiles
WHERE (is_mock_data = false OR is_mock_data IS NULL)
  AND (is_test_signup = false OR is_test_signup IS NULL)
ORDER BY created_at DESC;

-- 2. Candidate management preferences completeness
SELECT
  id,
  name,
  CASE WHEN preferred_leadership_style IS NULL THEN 0 ELSE 1 END +
  CASE WHEN preferred_feedback_frequency IS NULL THEN 0 ELSE 1 END +
  CASE WHEN preferred_communication_style IS NULL THEN 0 ELSE 1 END +
  CASE WHEN preferred_meeting_culture IS NULL THEN 0 ELSE 1 END +
  CASE WHEN preferred_conflict_resolution IS NULL THEN 0 ELSE 1 END +
  CASE WHEN preferred_mentorship_style IS NULL THEN 0 ELSE 1 END +
  CASE WHEN growth_goals IS NULL THEN 0 ELSE 1 END AS mgmt_prefs_set_count,
  preferred_leadership_style,
  preferred_feedback_frequency,
  preferred_communication_style,
  preferred_meeting_culture,
  preferred_conflict_resolution,
  preferred_mentorship_style,
  growth_goals
FROM candidate_profiles
WHERE (is_mock_data = false OR is_mock_data IS NULL)
ORDER BY created_at DESC;

-- 3. Candidate enrichment fields completeness
SELECT
  id,
  name,
  CASE WHEN preferred_company_focus IS NULL OR array_length(preferred_company_focus, 1) IS NULL THEN 'EMPTY' ELSE array_length(preferred_company_focus, 1)::text END AS company_focus_count,
  CASE WHEN preferred_mission_orientation IS NULL OR array_length(preferred_mission_orientation, 1) IS NULL THEN 'EMPTY' ELSE array_length(preferred_mission_orientation, 1)::text END AS mission_orientation_count,
  CASE WHEN preferred_work_style IS NULL OR array_length(preferred_work_style, 1) IS NULL THEN 'EMPTY' ELSE array_length(preferred_work_style, 1)::text END AS work_style_count,
  CASE WHEN regulatory_experience IS NULL OR array_length(regulatory_experience, 1) IS NULL THEN 'EMPTY' ELSE array_length(regulatory_experience, 1)::text END AS reg_exp_count
FROM candidate_profiles
WHERE (is_mock_data = false OR is_mock_data IS NULL)
ORDER BY created_at DESC;

-- 4. Check skills vs skills_with_levels consistency
SELECT
  id,
  name,
  jsonb_array_length(COALESCE(skills, '[]'::jsonb)) AS skills_count,
  jsonb_array_length(COALESCE(skills_with_levels, '[]'::jsonb)) AS skills_with_levels_count,
  CASE
    WHEN jsonb_array_length(COALESCE(skills, '[]'::jsonb)) != jsonb_array_length(COALESCE(skills_with_levels, '[]'::jsonb))
    THEN 'MISMATCH'
    ELSE 'OK'
  END AS consistency
FROM candidate_profiles
WHERE (skills IS NOT NULL AND jsonb_array_length(skills) > 0)
   OR (skills_with_levels IS NOT NULL AND jsonb_array_length(skills_with_levels) > 0);

-- 5. Validate desired_impact_scope contains valid integers
SELECT
  id,
  name,
  desired_impact_scope
FROM candidate_profiles
WHERE desired_impact_scope IS NOT NULL
  AND array_length(desired_impact_scope, 1) > 0;

-- 6. Check for regulatory_experience containing valid UUIDs
SELECT
  cp.id,
  cp.name,
  unnest(cp.regulatory_experience) AS reg_uuid,
  rd.name AS domain_name
FROM candidate_profiles cp
CROSS JOIN LATERAL unnest(cp.regulatory_experience) AS reg_uuid
LEFT JOIN regulatory_domains rd ON rd.id = reg_uuid
WHERE cp.regulatory_experience IS NOT NULL
  AND array_length(cp.regulatory_experience, 1) > 0
  AND rd.id IS NULL;
