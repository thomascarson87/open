
import { supabase } from './supabaseClient';
import { TalentSearchCriteria, TalentSearchResult, CandidateProfile, CompanyProfile, SavedSearch } from '../types';
import { calculateCandidateMatch, calculateRoleAlignment } from './matchingService';

interface CandidateRole {
  candidate_id: string;
  canonical_role_id: string;
  is_primary: boolean;
  family_id?: string;
}

class TalentMatcherService {

  /**
   * Get expanded role IDs including related roles from same family
   */
  private async getExpandedRoleIds(roleIds: string[], includeRelated: boolean): Promise<Set<string>> {
    const roleIdSet = new Set(roleIds);

    if (!includeRelated || roleIds.length === 0) {
      return roleIdSet;
    }

    // Get family IDs for selected roles
    const { data: selectedRoles } = await supabase
      .from('canonical_roles')
      .select('family_id')
      .in('id', roleIds);

    if (!selectedRoles || selectedRoles.length === 0) {
      return roleIdSet;
    }

    const familyIds = [...new Set(selectedRoles.map(r => r.family_id))];

    // Get all roles in those families
    const { data: relatedRoles } = await supabase
      .from('canonical_roles')
      .select('id')
      .in('family_id', familyIds);

    if (relatedRoles) {
      relatedRoles.forEach(r => roleIdSet.add(r.id));
    }

    return roleIdSet;
  }

  /**
   * Search for candidates matching the criteria
   */
  async searchTalents(criteria: TalentSearchCriteria, companyId: string): Promise<TalentSearchResult[]> {
    // 1. Get candidate role mappings if role filter is active
    let candidateRolesMap = new Map<string, CandidateRole[]>();
    let expandedRoleIds = new Set<string>();
    let candidateIdsWithMatchingRoles = new Set<string>();

    if (criteria.roleIds && criteria.roleIds.length > 0) {
      // Expand role IDs if includeRelatedRoles is true
      expandedRoleIds = await this.getExpandedRoleIds(
        criteria.roleIds,
        criteria.includeRelatedRoles || false
      );

      // Fetch candidate_roles for matching
      const { data: candidateRoles } = await supabase
        .from('candidate_roles')
        .select('candidate_id, canonical_role_id, is_primary')
        .in('canonical_role_id', Array.from(expandedRoleIds));

      if (candidateRoles) {
        candidateRoles.forEach((cr: any) => {
          candidateIdsWithMatchingRoles.add(cr.candidate_id);
          const existing = candidateRolesMap.get(cr.candidate_id) || [];
          existing.push(cr);
          candidateRolesMap.set(cr.candidate_id, existing);
        });
      }
    }

    // 2. Fetch company profile for culture alignment
    let companyProfile: CompanyProfile | undefined;
    const { data: companyData } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('id', companyId)
      .maybeSingle();

    if (companyData) {
      companyProfile = {
        ...companyData,
        companyName: companyData.company_name,
        focusType: companyData.focus_type || null,
        missionOrientation: companyData.mission_orientation || null,
        workStyle: companyData.work_style || null,
        industry: companyData.industry || [],
        companySizeRange: companyData.company_size_range,
      } as CompanyProfile;
    }

    // 2b. Fetch candidates
    let query = supabase
      .from('candidate_profiles')
      .select('*')
      .neq('status', 'not_looking');

    const { data: candidates, error } = await query;

    if (error) {
      console.error('Error fetching candidates', error);
      return [];
    }

    // 2b. Fetch candidate certifications in bulk
    const candidateCertMap = new Map<string, string[]>();
    const { data: allCandidateCerts } = await supabase
      .from('candidate_certifications')
      .select('candidate_id, certification_id')
      .eq('status', 'active');

    if (allCandidateCerts) {
      allCandidateCerts.forEach((cc: any) => {
        const existing = candidateCertMap.get(cc.candidate_id) || [];
        existing.push(cc.certification_id);
        candidateCertMap.set(cc.candidate_id, existing);
      });
    }

    // 3. Map to profiles with role data
    const profiles = candidates.map((c: any) => ({
      ...c,
      avatarUrls: c.avatar_urls || [],
      skills: c.skills || [],
      contractTypes: c.contract_types || [],
      preferredWorkMode: c.preferred_work_mode || [],
      desiredPerks: c.desired_perks || [],
      interestedIndustries: c.interested_industries || [],
      characterTraits: c.character_traits || [],
      values: c.values_list || [],
      nonNegotiables: c.non_negotiables || [],
      experience: c.experience || [],
      desiredSeniority: c.desired_seniority || [],
      // Role data from our mapping
      primaryRoleId: c.primary_role_id,
      primaryRoleName: c.primary_role_name,
      secondaryRoles: c.secondary_roles || [],
      regulatoryExperience: c.regulatory_experience || [],
      preferredCompanyFocus: c.preferred_company_focus || [],
      preferredMissionOrientation: c.preferred_mission_orientation || [],
      preferredWorkStyle: c.preferred_work_style || [],
    })) as CandidateProfile[];

    // 4. Run matching algorithm on each (pass company + cert data for sub-factor scoring)
    const results: TalentSearchResult[] = profiles.map(candidate => {
      const candCertIds = candidateCertMap.get(candidate.id) || [];
      const breakdown = calculateCandidateMatch(criteria, candidate, companyProfile, candCertIds);

      // Calculate role alignment if role filter is active
      let roleAlignmentScore = 100; // Default if no role filter
      let roleMatchType: 'exact' | 'related' | 'none' = 'none';

      if (criteria.roleIds && criteria.roleIds.length > 0) {
        const candidateRoleIds = [
          candidate.primaryRoleId,
          ...(candidate.secondaryRoles?.map(r => r.id) || [])
        ].filter(Boolean) as string[];

        const alignment = calculateRoleAlignment(
          candidateRoleIds,
          criteria.roleIds,
          criteria.includeRelatedRoles || false
        );
        roleAlignmentScore = alignment.score;
        roleMatchType = alignment.matchType;

        // Blend role alignment into overall score (15% weight)
        const adjustedScore = Math.round(
          (breakdown.overallScore * 0.85) + (roleAlignmentScore * 0.15)
        );
        breakdown.overallScore = adjustedScore;
        breakdown.details.roleAlignment = {
          score: roleAlignmentScore,
          reason: roleMatchType === 'exact'
            ? 'Exact role match'
            : roleMatchType === 'related'
            ? 'Related role in same family'
            : 'No role match'
        };
      }

      return {
        candidate: {
          ...candidate,
          matchScore: breakdown.overallScore,
          roleMatchType
        },
        matchBreakdown: breakdown,
        matchScore: breakdown.overallScore,
        dealBreakersFailed: breakdown.dealBreakers
      };
    });

    // 5. Sort by match score (role matches will naturally rank higher)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Save a search
   */
  async saveSearch(search: Omit<SavedSearch, 'id' | 'created_at' | 'last_run' | 'results_count'>): Promise<SavedSearch | null> {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{
            user_id: search.user_id,
            company_id: search.company_id,
            name: search.name,
            criteria: search.criteria,
            alert_enabled: search.alert_enabled,
            last_run: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
          console.error("Failed to save search", error);
          return null;
      }
      return data;
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) return [];
      return data;
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
      await supabase.from('saved_searches').delete().eq('id', searchId);
  }

  /**
   * Toggle alerts
   */
  async updateSearchAlerts(searchId: string, enabled: boolean): Promise<void> {
      await supabase.from('saved_searches').update({ alert_enabled: enabled }).eq('id', searchId);
  }
}

export const talentMatcherService = new TalentMatcherService();
