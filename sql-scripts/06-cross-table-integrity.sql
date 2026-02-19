-- =============================================================================
-- CROSS-TABLE DATA INTEGRITY CHECKS
-- Run in Supabase SQL Editor to detect referential issues
-- =============================================================================

-- 1. Applications referencing non-existent jobs
SELECT a.id AS app_id, a.job_id, a.status
FROM applications a
LEFT JOIN jobs j ON j.id = a.job_id
WHERE j.id IS NULL;

-- 2. Applications referencing non-existent candidates
SELECT a.id AS app_id, a.candidate_id, a.status
FROM applications a
LEFT JOIN candidate_profiles cp ON cp.id = a.candidate_id
WHERE a.candidate_id IS NOT NULL AND cp.id IS NULL;

-- 3. Team members referencing non-existent companies
SELECT tm.id, tm.email, tm.company_id
FROM team_members tm
LEFT JOIN company_profiles cp ON cp.id = tm.company_id
WHERE cp.id IS NULL;

-- 4. Candidate certifications referencing non-existent certifications
SELECT cc.id, cc.candidate_id, cc.certification_id
FROM candidate_certifications cc
LEFT JOIN certifications c ON c.id = cc.certification_id
WHERE c.id IS NULL;

-- 5. Candidate roles referencing non-existent canonical roles
SELECT cr.id, cr.candidate_id, cr.canonical_role_id
FROM candidate_roles cr
LEFT JOIN canonical_roles r ON r.id = cr.canonical_role_id
WHERE r.id IS NULL;

-- 6. Calendar events with missing references
SELECT ce.id, ce.title,
  CASE WHEN ce.application_id IS NOT NULL AND a.id IS NULL THEN 'ORPHANED APP' ELSE 'OK' END AS app_status,
  CASE WHEN ce.job_id IS NOT NULL AND j.id IS NULL THEN 'ORPHANED JOB' ELSE 'OK' END AS job_status,
  CASE WHEN ce.candidate_id IS NOT NULL AND cp.id IS NULL THEN 'ORPHANED CANDIDATE' ELSE 'OK' END AS cand_status
FROM calendar_events ce
LEFT JOIN applications a ON a.id = ce.application_id
LEFT JOIN jobs j ON j.id = ce.job_id
LEFT JOIN candidate_profiles cp ON cp.id = ce.candidate_id
WHERE (ce.application_id IS NOT NULL AND a.id IS NULL)
   OR (ce.job_id IS NOT NULL AND j.id IS NULL)
   OR (ce.candidate_id IS NOT NULL AND cp.id IS NULL);

-- 7. Profiles without corresponding role-specific profiles
SELECT p.id, p.email, p.role,
  CASE
    WHEN p.role = 'candidate' AND cp.id IS NULL THEN 'MISSING CANDIDATE PROFILE'
    WHEN p.role = 'recruiter' AND comp.id IS NULL THEN 'MISSING COMPANY PROFILE'
    ELSE 'OK'
  END AS profile_status
FROM profiles p
LEFT JOIN candidate_profiles cp ON cp.id = p.id AND p.role = 'candidate'
LEFT JOIN company_profiles comp ON comp.id = p.id AND p.role = 'recruiter'
WHERE (p.role = 'candidate' AND cp.id IS NULL)
   OR (p.role = 'recruiter' AND comp.id IS NULL);

-- 8. Saved searches referencing non-existent companies
SELECT ss.id, ss.name, ss.company_id
FROM saved_searches ss
LEFT JOIN company_profiles cp ON cp.id = ss.company_id
WHERE ss.company_id IS NOT NULL AND cp.id IS NULL;

-- 9. Candidate follows referencing non-existent companies
SELECT ccf.id, ccf.candidate_id, ccf.company_id
FROM candidate_company_follows ccf
LEFT JOIN company_profiles cp ON cp.id = ccf.company_id
WHERE cp.id IS NULL;

-- 10. Widget configs for non-existent companies
SELECT wc.id, wc.company_id
FROM widget_configurations wc
LEFT JOIN company_profiles cp ON cp.id = wc.company_id
WHERE wc.company_id IS NOT NULL AND cp.id IS NULL;
