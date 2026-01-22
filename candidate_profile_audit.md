# Candidate Profile Field Audit

**Generated:** 2026-01-21
**Codebase:** open-main

---

## 1. Work Style Preferences

**TypeScript Interface:** `WorkStylePreferences` (types.ts:83-94)
**DB Column:** `work_style_preferences` (JSONB)
**Form Component:** `CandidateProfileTabs.tsx` (lines 331-341)

| Field | In DB (JSONB key) | In TypeScript | In Form | In Matching |
|-------|-------------------|---------------|---------|-------------|
| workHours | `workHours` | `workHours` | Yes (select) | Yes (weight: 0.6) |
| workIntensity | `workIntensity` | `workIntensity` | Yes (select) | Yes (weight: 1.0) |
| projectDuration | `projectDuration` | `projectDuration` | **MISSING** | Yes (weight: 0.5) |
| contextSwitching | `contextSwitching` | `contextSwitching` | **MISSING** | Yes (weight: 0.6) |
| autonomyLevel | `autonomyLevel` | `autonomyLevel` | Yes (select) | Yes (weight: 0.9) |
| decisionMaking | `decisionMaking` | `decisionMaking` | **MISSING** | Yes (weight: 0.7) |
| riskTolerance | `riskTolerance` | `riskTolerance` | **MISSING** | Yes (weight: 0.5) |
| innovationStability | `innovationStability` | `innovationStability` | **MISSING** | Yes (weight: 0.5) |
| ambiguityTolerance | `ambiguityTolerance` | `ambiguityTolerance` | Yes (select) | Yes (weight: 0.8) |
| changeFrequency | `changeFrequency` | `changeFrequency` | Yes (select) | Yes (weight: 0.7) |

### Gap Analysis
- **5 fields missing from form:** projectDuration, contextSwitching, decisionMaking, riskTolerance, innovationStability
- Constants exist in `workStyleData.ts` for all 10 fields
- Matching service uses all 10 fields with weights

---

## 2. Team Collaboration Preferences

**TypeScript Interface:** `TeamCollaborationPreferences` (types.ts:96-105)
**DB Column:** `team_collaboration_preferences` (JSONB)
**Form Component:** `CandidateProfileTabs.tsx` (lines 343-348)

| Field | In DB (JSONB key) | In TypeScript | In Form | In Matching |
|-------|-------------------|---------------|---------|-------------|
| teamSizePreference | `teamSizePreference` | `teamSizePreference` | **MISSING** | Yes (weight: 0.7) |
| orgSizePreference | `orgSizePreference` | `orgSizePreference` | **MISSING** | Yes (weight: 0.6) |
| reportingStructure | `reportingStructure` | `reportingStructure` | **MISSING** | Yes (weight: 0.4) |
| collaborationFrequency | `collaborationFrequency` | `collaborationFrequency` | **MISSING** | Yes (weight: 0.7) |
| pairProgramming | `pairProgramming` | `pairProgramming` | **MISSING** | Yes (weight: 0.5) |
| crossFunctional | `crossFunctional` | `crossFunctional` | **MISSING** | Yes (weight: 0.5) |
| teamDistribution | `teamDistribution` | `teamDistribution` | Yes (buttons) | Yes (weight: 0.9) |
| timezoneOverlap | `timezoneOverlap` | `timezoneOverlap` | Yes (buttons) | Yes (weight: 0.9) |

### Gap Analysis
- **6 fields missing from form:** teamSizePreference, orgSizePreference, reportingStructure, collaborationFrequency, pairProgramming, crossFunctional
- Only 2 of 8 fields are exposed in the UI
- Constants exist in `workStyleData.ts` for all 8 fields
- All fields have matching weights defined

---

## 3. Character Traits & Values

### Character Traits
**Source:** `matchingData.ts` (lines 310-319) - `CHARACTER_TRAITS_CATEGORIES`

| Category | Options |
|----------|---------|
| Leadership | Decisive, Inspiring, Strategic, Accountable, Empowering, Visionary |
| Communication | Clear Communicator, Active Listener, Persuasive, Diplomatic, Transparent, Articulate |
| Work Style | Self-Starter, Detail-Oriented, Big Picture, Methodical, Adaptable, Organized, Proactive |
| Problem Solving | Analytical, Creative, Resourceful, Pragmatic, Innovative, Critical Thinker, Data-Driven |
| Interpersonal | Collaborative, Empathetic, Team Player, Mentoring, Conflict Resolver, Inclusive, Supportive |
| Drive | Results-Oriented, Goal-Driven, Persistent, Ambitious, Competitive, Passionate, High Energy |
| Adaptability | Flexible, Resilient, Open-Minded, Learning-Oriented, Change Agent, Agile |
| Technical | Technical Depth, Quick Learner, Systems Thinker, Quality-Focused, Documentation-Oriented |
| EQ | Self-Aware, Patient, Calm Under Pressure, Emotionally Intelligent, Positive, Humble |

### Usage Verification

| Location | Uses Same Options | Notes |
|----------|-------------------|-------|
| Candidate Form (CandidateProfileTabs.tsx:537) | Yes | Uses `CHARACTER_TRAITS_CATEGORIES` directly |
| HM Preferences (types.ts:153-154) | Yes | `required_traits` and `preferred_traits` are string arrays |
| HM Dealbreakers (hiringManagerData.ts:149-155) | **Different** | Uses coded values like `communication_poor`, not trait names |

### Issue Identified
HM `trait_dealbreakers` use different coded values than the character trait strings. This could cause matching logic issues if comparing directly.

---

## 4. Management Preferences (NEW - Expected Missing)

These fields exist in `HiringManagerPreferences` (types.ts:119-169) but **do NOT exist** in `CandidateProfile`:

| Proposed Field | HM Has It? | Candidate Has It? | Constant Options Available? |
|----------------|------------|-------------------|----------------------------|
| preferred_leadership_style | Yes (`leadership_style`) | **NO** | Yes (hiringManagerData.ts:11-17) |
| preferred_feedback_frequency | Yes (`feedback_frequency`) | **NO** | Yes (hiringManagerData.ts:19-25) |
| preferred_communication_style | Yes (`communication_preference`) | **NO** | Yes (hiringManagerData.ts:27-32) |
| preferred_meeting_culture | Yes (`meeting_culture`) | **NO** | Yes (hiringManagerData.ts:34-39) |
| preferred_conflict_resolution | Yes (`conflict_resolution`) | **NO** | Yes (hiringManagerData.ts:41-46) |
| preferred_mentorship_style | Yes (`mentorship_approach`) | **NO** | Yes (hiringManagerData.ts:59-64) |
| growth_goals | Yes (`growth_expectation`) | **NO** | Yes (hiringManagerData.ts:52-57) |

### Available Options from hiringManagerData.ts

**Leadership Style:**
- `hands_off` - Hands-Off
- `coaching` - Coaching
- `collaborative` - Collaborative
- `directive` - Directive
- `servant_leader` - Servant Leader

**Feedback Frequency:**
- `continuous` - Continuous
- `daily` - Daily
- `weekly` - Weekly
- `biweekly` - Bi-weekly
- `milestone_based` - Milestone-Based

**Communication Preference:**
- `async_first` - Async-First
- `sync_heavy` - Sync-Heavy
- `balanced` - Balanced
- `documentation_driven` - Documentation-Driven

**Meeting Culture:**
- `minimal` - Minimal
- `daily_standup` - Daily Standup
- `regular_syncs` - Regular Syncs
- `as_needed` - As-Needed

**Conflict Resolution:**
- `direct_immediate` - Direct & Immediate
- `mediated` - Mediated
- `consensus_building` - Consensus Building
- `escalation_path` - Escalation Path

**Growth Expectation:**
- `specialist_depth` - Specialist Depth
- `generalist_breadth` - Generalist Breadth
- `leadership_track` - Leadership Track
- `flexible` - Flexible

**Mentorship Approach:**
- `structured_program` - Structured Program
- `informal_adhoc` - Informal/Ad-hoc
- `peer_based` - Peer-Based
- `self_directed` - Self-Directed

---

## 5. Form Save/Load Mapping Issues

**Mapping Function:** `mapCandidateToDatabase()` (CandidateProfileForm.tsx:12-109)

### Verified Correct Mappings

| Frontend (camelCase) | DB (snake_case) | Status |
|---------------------|-----------------|--------|
| workStylePreferences | work_style_preferences | OK |
| teamCollaborationPreferences | team_collaboration_preferences | OK |
| characterTraits | character_traits | OK |
| values | values_list | OK |
| preferredWorkMode | preferred_work_mode | OK |
| desiredPerks | desired_perks | OK |
| nonNegotiables | non_negotiables | OK |
| salaryMin | salary_min | OK |
| salaryMax | salary_max | OK |
| timezone | timezone | OK |
| languages | languages | OK |

### Potential Issues Found

| Issue | Location | Details |
|-------|----------|---------|
| `avatarUrls` vs `avatar_urls` | CandidateProfileForm.tsx:26 | Mapping exists, but field is `avatarUrls` in type vs `avatar_urls` in DB |
| `desiredImpactScopes` vs `desired_impact_scope` | CandidateProfileForm.tsx:55 | Singular vs plural mismatch - DB likely expects array but column name is singular |
| `references` vs `references_list` | CandidateProfileForm.tsx:50 | Rename in DB to avoid SQL reserved word |

### Missing from Mapping (exist in CandidateProfile type but not mapped)

1. `personalityAssessments` - Not mapped (separate fields `myers_briggs`, `disc_profile`, `enneagram_type` are mapped instead)
2. `matchScore` - Not mapped (computed field, not stored)
3. `isUnlocked` - Not mapped (computed field)
4. `verification_stats` - Not mapped (aggregated from verifications table)

---

## 6. Files That Need Updates

### High Priority - Add Missing Form Fields

| File | Change Needed |
|------|---------------|
| `components/CandidateProfileTabs.tsx` | Add UI for 5 missing WorkStyle fields: projectDuration, contextSwitching, decisionMaking, riskTolerance, innovationStability |
| `components/CandidateProfileTabs.tsx` | Add UI for 6 missing TeamCollab fields: teamSizePreference, orgSizePreference, reportingStructure, collaborationFrequency, pairProgramming, crossFunctional |
| `components/CandidateOnboarding.tsx` | Consider adding key fields to onboarding flow (currently only has workIntensity, autonomyLevel, teamDistribution, timezoneOverlap) |

### Medium Priority - Add Management Preferences

| File | Change Needed |
|------|---------------|
| `types.ts` | Add `ManagementPreferences` interface to `CandidateProfile` with 7 new fields |
| `components/CandidateProfileForm.tsx` | Add mapping for new management preferences JSONB column |
| `components/CandidateProfileTabs.tsx` | Add new "Management Style" section in Career tab |
| `services/matchingService.ts` | Add management preference matching logic |
| `services/workStyleMatchingService.ts` | Add `calculateManagementMatch()` function |
| **Database** | Add `management_preferences JSONB` column to `candidate_profiles` table |

### Low Priority - Cleanup

| File | Change Needed |
|------|---------------|
| `constants/hiringManagerData.ts` | Export options for reuse in candidate form |
| `hiringManagerData.ts` | Rename trait dealbreakers to align with CHARACTER_TRAITS strings or create mapping |

---

## 7. Summary Statistics

| Category | Total Fields | In TypeScript | In Form | In Matching | Missing from Form |
|----------|--------------|---------------|---------|-------------|-------------------|
| Work Style | 10 | 10 | 5 | 10 | 5 (50%) |
| Team Collab | 8 | 8 | 2 | 8 | 6 (75%) |
| Management | 7 | 0 | 0 | 0 | 7 (100%) |
| **Total** | **25** | **18** | **7** | **18** | **18 (72%)** |

### Recommended Implementation Order

1. **Phase 1:** Add missing WorkStyle and TeamCollab fields to form (11 fields)
2. **Phase 2:** Add Management Preferences as new JSONB column + form section (7 fields)
3. **Phase 3:** Update matching service to include management preference scoring
4. **Phase 4:** Align trait dealbreaker strings between HM and candidate

---

## Appendix: Database Column Reference

Based on `mapCandidateToDatabase()` function, expected DB columns for `candidate_profiles` table:

```sql
-- Existing columns (inferred from mapping)
work_style_preferences JSONB
team_collaboration_preferences JSONB
character_traits TEXT[]
values_list TEXT[]
preferred_work_mode TEXT[]
desired_perks TEXT[]
non_negotiables TEXT[]
contract_types TEXT[]
interested_industries TEXT[]
desired_seniority TEXT[]
experience JSONB
portfolio JSONB
references_list JSONB
languages JSONB
current_impact_scope INTEGER
desired_impact_scope INTEGER[]
salary_min INTEGER
salary_max INTEGER
salary_currency TEXT
salary_expectation TEXT
open_to_equity BOOLEAN
current_bonuses TEXT
notice_period TEXT
timezone TEXT
preferred_timezone TEXT
preferred_company_size TEXT[]
willing_to_relocate BOOLEAN
legal_status TEXT
education_level TEXT
education_field TEXT
education_institution TEXT
education_graduation_year INTEGER
myers_briggs TEXT
disc_profile JSONB
enneagram_type TEXT
theme_color TEXT
theme_font TEXT
total_years_experience NUMERIC
current_seniority TEXT
primary_role_id UUID
primary_role_name TEXT
secondary_roles JSONB
interested_roles JSONB
onboarding_completed BOOLEAN
call_ready BOOLEAN
call_link TEXT
updated_at TIMESTAMPTZ

-- PROPOSED NEW COLUMN
management_preferences JSONB  -- For Phase 2
```
