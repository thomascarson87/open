-- =============================================================================
-- HIRING MANAGER PREFERENCES DIAGNOSTICS
-- Run in Supabase SQL Editor to detect data integrity issues
-- =============================================================================

-- 1. HM Preferences completeness overview
SELECT
  hmp.id,
  hmp.name,
  cp.company_name,
  CASE WHEN hmp.leadership_style IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.feedback_frequency IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.communication_preference IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.meeting_culture IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.conflict_resolution IS NULL THEN 0 ELSE 1 END AS leadership_set,
  CASE WHEN hmp.work_intensity IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.autonomy_level IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.decision_making IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.ambiguity_tolerance IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.change_frequency IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.risk_tolerance IS NULL THEN 0 ELSE 1 END AS work_style_set,
  CASE WHEN hmp.collaboration_frequency IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.pair_programming IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.cross_functional IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.team_size IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.reporting_structure IS NULL THEN 0 ELSE 1 END AS team_collab_set,
  CASE WHEN hmp.growth_expectation IS NULL THEN 0 ELSE 1 END +
  CASE WHEN hmp.mentorship_approach IS NULL THEN 0 ELSE 1 END AS growth_set,
  array_length(hmp.required_traits, 1) AS required_traits_count,
  array_length(hmp.preferred_traits, 1) AS preferred_traits_count,
  array_length(hmp.work_style_dealbreakers, 1) AS ws_dealbreaker_count,
  array_length(hmp.team_dealbreakers, 1) AS team_dealbreaker_count,
  array_length(hmp.trait_dealbreakers, 1) AS trait_dealbreaker_count,
  hmp.impact_scope_min,
  hmp.impact_scope_max
FROM hiring_manager_preferences hmp
LEFT JOIN company_profiles cp ON cp.id = hmp.company_id
ORDER BY hmp.updated_at DESC;

-- 2. Check for HM prefs where impact_scope_min > impact_scope_max
SELECT
  id,
  name,
  impact_scope_min,
  impact_scope_max,
  'MIN > MAX' AS issue
FROM hiring_manager_preferences
WHERE impact_scope_min IS NOT NULL
  AND impact_scope_max IS NOT NULL
  AND impact_scope_min > impact_scope_max;

-- 3. Companies without any HM preferences
SELECT
  cp.id,
  cp.company_name,
  'NO HM PREFERENCES' AS issue
FROM company_profiles cp
LEFT JOIN hiring_manager_preferences hmp ON hmp.company_id = cp.id
WHERE hmp.id IS NULL
  AND (cp.is_mock_data = false OR cp.is_mock_data IS NULL);
