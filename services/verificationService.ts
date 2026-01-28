
import { supabase } from './supabaseClient';
import { ProfessionalVerification } from '../types';

class VerificationService {
  
  async getVerifications(candidateId: string): Promise<ProfessionalVerification[]> {
    const { data, error } = await supabase
      .from('professional_verifications')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching verifications:', error);
        return [];
    }
    return data || [];
  }

  async getVerificationByToken(token: string): Promise<ProfessionalVerification | null> {
    const { data, error } = await supabase
      .from('professional_verifications')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (error) {
      console.error('Error fetching verification by token:', error);
      return null;
    }
    return data;
  }

  async createVerificationRequest(data: Partial<ProfessionalVerification>) {
    const token = crypto.randomUUID();
    
    // Invalidate previous pending requests for this referee/candidate pair to avoid clutter/conflicts
    await supabase
        .from('professional_verifications')
        .update({ status: 'expired' })
        .eq('candidate_id', data.candidate_id)
        .eq('referee_email', data.referee_email)
        .eq('status', 'pending');

    const { data: result, error } = await supabase
      .from('professional_verifications')
      .insert([{
        ...data,
        verification_token: token,
        status: 'pending',
        is_visible_publicly: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
      }])
      .select()
      .single();

    if (error) throw error;

    // Simulate sending email
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chime.works';
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${data.referee_email}`);
    console.log(`Subject: Verify ${data.referee_name}'s professional background`);
    console.log(`Link: ${origin}/verify/${token}`);
    console.log('------------------------');

    return result;
  }

  async submitVerification(token: string, data: any) {
    const { error } = await supabase
      .from('professional_verifications')
      .update({
        ...data,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('verification_token', token);

    if (error) throw error;
  }

  async toggleVisibility(verificationId: string, isVisible: boolean) {
    const { error } = await supabase
      .from('professional_verifications')
      .update({ is_visible_publicly: isVisible })
      .eq('id', verificationId);
    
    if (error) throw error;
  }
}

export const verificationService = new VerificationService();
