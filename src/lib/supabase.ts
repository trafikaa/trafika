// 클라이언트 사이드 Supabase 제거 - API 키 노출 방지
export const supabase = null;
export const isSupabaseConfigured = false;

// 디버그 로그 제거
// console.log 제거

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