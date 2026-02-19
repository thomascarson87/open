-- =============================================================================
-- HM PREFERENCES → JOBS LINKAGE DIAGNOSTICS
-- Verifies that hiring manager preferences can be resolved for published jobs
-- Related to CHI-37: Management fit scoring fix
-- =============================================================================

-- 1. Published jobs with an assigned HM but no matching HM preferences
SELECT
  j.id AS job_id,
  j.title,
  j.company_name,
  j.approvals->'hiringManager'->>'assignedTo' AS hm_user_id,
  j.approvals->'hiringManager'->>'status' AS hm_approval_status,
  CASE
    WHEN j.approvals->'hiringManager'->>'assignedTo' IS NULL THEN 'NO HM ASSIGNED'
    WHEN hmp.id IS NOT NULL THEN 'HM PREFS FOUND'
    ELSE 'HM ASSIGNED BUT NO PREFS'
  END AS hm_prefs_status,
  hmp.name AS hm_prefs_name
FROM jobs j
LEFT JOIN hiring_manager_preferences hmp
  ON hmp.user_id = j.approvals->'hiringManager'->>'assignedTo'
  AND hmp.is_default = true
WHERE j.status = 'published'
ORDER BY j.posted_date DESC;

-- 2. Companies with HM prefs but no published jobs using them
SELECT
  hmp.id AS prefs_id,
  hmp.name AS prefs_name,
  hmp.user_id,
  cp.company_name,
  hmp.is_default,
  COUNT(j.id) AS published_jobs_using
FROM hiring_manager_preferences hmp
LEFT JOIN company_profiles cp ON cp.id = hmp.company_id
LEFT JOIN jobs j
  ON j.approvals->'hiringManager'->>'assignedTo' = hmp.user_id
  AND j.status = 'published'
GROUP BY hmp.id, hmp.name, hmp.user_id, cp.company_name, hmp.is_default
ORDER BY published_jobs_using ASC;

-- 3. Management fit scoring readiness: how many jobs will now get real scores?
SELECT
  'Jobs with HM prefs resolvable' AS metric,
  COUNT(*) FILTER (
    WHERE j.approvals->'hiringManager'->>'assignedTo' IS NOT NULL
      AND hmp.id IS NOT NULL
  ) AS ready_count,
  COUNT(*) FILTER (
    WHERE j.approvals->'hiringManager'->>'assignedTo' IS NOT NULL
      AND hmp.id IS NULL
  ) AS hm_assigned_no_prefs,
  COUNT(*) FILTER (
    WHERE j.approvals->'hiringManager'->>'assignedTo' IS NULL
  ) AS no_hm_assigned,
  COUNT(*) AS total_published
FROM jobs j
LEFT JOIN hiring_manager_preferences hmp
  ON hmp.user_id = j.approvals->'hiringManager'->>'assignedTo'
  AND hmp.is_default = true
WHERE j.status = 'published';
