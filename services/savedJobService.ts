import { supabase } from './supabaseClient';
import { JobPosting } from '../types';

interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  notes: string | null;
}

interface SavedJobWithDetails extends SavedJob {
  jobs: JobPosting;
}

class SavedJobService {
  /**
   * Check if a candidate has saved a specific job
   */
  async isSaved(candidateId: string, jobId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('candidate_saved_jobs')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      console.error('Error checking saved status:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Toggle saved status for a job
   * Returns the new saved state (true = now saved, false = unsaved)
   */
  async toggleSaved(candidateId: string, jobId: string): Promise<boolean> {
    const isCurrentlySaved = await this.isSaved(candidateId, jobId);

    if (isCurrentlySaved) {
      // Unsave
      const { error } = await supabase
        .from('candidate_saved_jobs')
        .delete()
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId);

      if (error) {
        console.error('Error unsaving job:', error);
        throw error;
      }
      return false;
    } else {
      // Save
      const { error } = await supabase
        .from('candidate_saved_jobs')
        .insert({
          candidate_id: candidateId,
          job_id: jobId
        });

      if (error) {
        console.error('Error saving job:', error);
        throw error;
      }
      return true;
    }
  }

  /**
   * Get all jobs a candidate has saved with full job details
   */
  async getSavedJobs(candidateId: string): Promise<SavedJobWithDetails[]> {
    const { data, error } = await supabase
      .from('candidate_saved_jobs')
      .select(`
        id,
        candidate_id,
        job_id,
        created_at,
        notes,
        jobs (*)
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved jobs:', error);
      return [];
    }

    return (data as SavedJobWithDetails[]) || [];
  }

  /**
   * Get a Set of job IDs that a candidate has saved
   * Useful for batch checking saved status on job listings
   */
  async getSavedJobIds(candidateId: string): Promise<Set<string>> {
    const { data, error } = await supabase
      .from('candidate_saved_jobs')
      .select('job_id')
      .eq('candidate_id', candidateId);

    if (error) {
      console.error('Error fetching saved job IDs:', error);
      return new Set();
    }

    return new Set(data?.map(s => s.job_id) || []);
  }

  /**
   * Unsave a job (explicit method)
   */
  async unsave(candidateId: string, jobId: string): Promise<void> {
    const { error } = await supabase
      .from('candidate_saved_jobs')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  }

  /**
   * Add notes to a saved job
   */
  async updateNotes(candidateId: string, jobId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('candidate_saved_jobs')
      .update({ notes })
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId);

    if (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  }
}

export const savedJobService = new SavedJobService();
