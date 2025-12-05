
import { supabase } from './supabaseClient';
import { TalentSearchCriteria, TalentSearchResult, CandidateProfile, SavedSearch } from '../types';
import { calculateCandidateMatch } from './matchingService';

class TalentMatcherService {
  
  /**
   * Search for candidates matching the criteria
   */
  async searchTalents(criteria: TalentSearchCriteria, companyId: string): Promise<TalentSearchResult[]> {
    // 1. Fetch all active candidates
    // In a real app with thousands of users, we would filter via SQL.
    // For this implementation, we fetch "actively looking" or "open" candidates and match in-memory.
    
    const { data: candidates, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .neq('status', 'not_looking'); // Exclude those not looking

    if (error) {
        console.error('Error fetching candidates', error);
        return [];
    }

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
        desiredSeniority: c.desired_seniority || []
    })) as CandidateProfile[];

    // 2. Run matching algorithm on each
    const results: TalentSearchResult[] = profiles.map(candidate => {
        const breakdown = calculateCandidateMatch(criteria, candidate);
        return {
            candidate: { ...candidate, matchScore: breakdown.overallScore },
            matchBreakdown: breakdown,
            matchScore: breakdown.overallScore,
            dealBreakersFailed: breakdown.dealBreakers
        };
    });

    // 3. Filter and Sort
    // Filter out those with critical dealbreakers if we want to be strict, or just push them to bottom.
    // Here we just sort by score desc.
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
