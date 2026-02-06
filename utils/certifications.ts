
import { supabase } from '../services/supabaseClient';
import type { Certification, RegulatoryDomain } from '../types';

export async function fetchCertifications(): Promise<Certification[]> {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchRegulatoryDomains(): Promise<RegulatoryDomain[]> {
  const { data, error } = await supabase
    .from('regulatory_domains')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export function groupCertificationsByCategory(certifications: Certification[]) {
  return certifications.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = [];
    }
    acc[cert.category].push(cert);
    return acc;
  }, {} as Record<string, Certification[]>);
}
