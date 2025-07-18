import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL; // 변수명 변경!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here';

// Only create client if properly configured, otherwise use null
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { isSupabaseConfigured };

export interface CompanyRiskData {
  id?: string;
  company_name: string;
  company_code: string;
  risk_score: number;
  risk_level: 'safe' | 'caution' | 'danger';
  analysis_date: string;
  financial_data: any;
  created_at?: string;
}