-- =============================================================================
-- CANDIDATE SAVED JOBS & COMPANY FOLLOWS DIAGNOSTICS
-- Related to CHI-34 (FollowedCompanies) and CHI-35 (savedJobService)
-- =============================================================================

-- 1. Saved jobs referencing non-existent jobs
SELECT csj.id, csj.candidate_id, csj.job_id, csj.created_at
FROM candidate_saved_jobs csj
LEFT JOIN jobs j ON j.id = csj.job_id
WHERE j.id IS NULL;

-- 2. Saved jobs for unpublished/draft jobs (may confuse candidates)
SELECT csj.id, csj.candidate_id, csj.job_id, j.title, j.status
FROM candidate_saved_jobs csj
JOIN jobs j ON j.id = csj.job_id
WHERE j.status != 'published';

-- 3. Company follows referencing non-existent companies
SELECT ccf.id, ccf.candidate_id, ccf.company_id
FROM candidate_company_follows ccf
LEFT JOIN company_profiles cp ON cp.id = ccf.company_id
WHERE cp.id IS NULL;

-- 4. Summary counts
SELECT 'Total saved jobs' AS metric, COUNT(*) AS count
FROM candidate_saved_jobs
UNION ALL
SELECT 'Orphaned saved jobs (missing job)', COUNT(*)
FROM candidate_saved_jobs csj
LEFT JOIN jobs j ON j.id = csj.job_id
WHERE j.id IS NULL
UNION ALL
SELECT 'Total company follows', COUNT(*)
FROM candidate_company_follows
UNION ALL
SELECT 'Orphaned follows (missing company)', COUNT(*)
FROM candidate_company_follows ccf
LEFT JOIN company_profiles cp ON cp.id = ccf.company_id
WHERE cp.id IS NULL;
