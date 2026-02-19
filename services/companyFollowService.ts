import { supabase } from './supabaseClient';

interface CompanyFollow {
  id: string;
  candidate_id: string;
  company_id: string;
  created_at: string;
  notification_enabled: boolean;
}

interface FollowedCompanyWithProfile extends CompanyFollow {
  company_profiles: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    industry: string | null;
    fundingStage: string | null;
    teamSize: string | null;
    location: string | null;
    followerCount: number;
  };
}

class CompanyFollowService {
  /**
   * Check if a candidate follows a specific company
   */
  async isFollowing(candidateId: string, companyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('candidate_company_follows')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (error) {
      console.error('Error checking follow status:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Toggle follow status for a company
   * Returns the new follow state (true = now following, false = unfollowed)
   */
  async toggleFollow(candidateId: string, companyId: string): Promise<boolean> {
    const isCurrentlyFollowing = await this.isFollowing(candidateId, companyId);

    if (isCurrentlyFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('candidate_company_follows')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('company_id', companyId);

      if (error) {
        console.error('Error unfollowing company:', error);
        throw error;
      }
      return false;
    } else {
      // Follow
      const { error } = await supabase
        .from('candidate_company_follows')
        .insert({
          candidate_id: candidateId,
          company_id: companyId,
          notification_enabled: true
        });

      if (error) {
        console.error('Error following company:', error);
        throw error;
      }
      return true;
    }
  }

  /**
   * Get all companies a candidate follows with full company profile data
   */
  async getFollowedCompanies(candidateId: string): Promise<FollowedCompanyWithProfile[]> {
    const { data, error } = await supabase
      .from('candidate_company_follows')
      .select(`
        id,
        candidate_id,
        company_id,
        created_at,
        notification_enabled,
        company_profiles (
          id,
          company_name,
          logo_url,
          industry,
          funding_stage,
          team_size,
          headquarters_location,
          follower_count
        )
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching followed companies:', error);
      return [];
    }

    // Map snake_case DB columns to camelCase for frontend
    // Supabase returns company_profiles as single object for FK relations,
    // but TS may infer it as array — use 'as any' to handle both cases
    const mapped = data?.map(item => {
      const cp: any = Array.isArray(item.company_profiles)
        ? item.company_profiles[0]
        : item.company_profiles;
      return {
        ...item,
        company_profiles: cp ? {
          id: cp.id,
          companyName: cp.company_name,
          logoUrl: cp.logo_url,
          industry: cp.industry,
          fundingStage: cp.funding_stage,
          teamSize: cp.team_size,
          location: cp.headquarters_location,
          followerCount: cp.follower_count
        } : null
      };
    }) || [];

    return mapped as FollowedCompanyWithProfile[];
  }

  /**
   * Get a Set of company IDs that a candidate follows
   * Useful for batch checking follow status on job listings
   */
  async getFollowedCompanyIds(candidateId: string): Promise<Set<string>> {
    const { data, error } = await supabase
      .from('candidate_company_follows')
      .select('company_id')
      .eq('candidate_id', candidateId);

    if (error) {
      console.error('Error fetching followed company IDs:', error);
      return new Set();
    }

    return new Set(data?.map(f => f.company_id) || []);
  }

  /**
   * Update notification preference for a followed company
   */
  async updateNotificationPreference(
    candidateId: string,
    companyId: string,
    enabled: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('candidate_company_follows')
      .update({ notification_enabled: enabled })
      .eq('candidate_id', candidateId)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error updating notification preference:', error);
      throw error;
    }
  }

  /**
   * Get follower count for a company
   */
  async getFollowerCount(companyId: string): Promise<number> {
    const { data, error } = await supabase
      .from('company_profiles')
      .select('follower_count')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching follower count:', error);
      return 0;
    }

    return data?.follower_count || 0;
  }

  /**
   * Unfollow a company (explicit method for clarity)
   */
  async unfollow(candidateId: string, companyId: string): Promise<void> {
    const { error } = await supabase
      .from('candidate_company_follows')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error unfollowing company:', error);
      throw error;
    }
  }
}

export const companyFollowService = new CompanyFollowService();
