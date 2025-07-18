import { supabase, CompanyRiskData } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';

export class RiskDatabaseService {
  private isConfigured(): boolean {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  }

  // 기업 위험도 데이터 저장
  async saveCompanyRisk(data: Omit<CompanyRiskData, 'id' | 'created_at'>): Promise<void> {
    if (!this.isConfigured()) {
      console.log('Supabase not configured, skipping database save');
      return;
    }

    try {
      const { error } = await supabase
        .from('company_risks')
        .upsert({
          ...data,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'company_code'
        });

      if (error) {
        console.error('위험도 데이터 저장 오류:', error);
      }
    } catch (error) {
      console.error('데이터베이스 저장 오류:', error);
    }
  }

  // 기업 위험도 데이터 조회
  async getCompanyRisk(companyCode: string): Promise<CompanyRiskData | null> {
    if (!this.isConfigured()) {
      console.log('Supabase not configured, returning null');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('company_risks')
        .select('*')
        .eq('company_code', companyCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('위험도 데이터 조회 오류:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('데이터베이스 조회 오류:', error);
      return null;
    }
  }

  // 위험 기업 목록 조회
  async getRiskCompanies(riskLevel?: 'safe' | 'caution' | 'danger'): Promise<CompanyRiskData[]> {
    if (!this.isConfigured()) {
      console.log('Supabase not configured, returning empty array');
      return [];
    }

    try {
      let query = supabase
        .from('company_risks')
        .select('*')
        .order('risk_score', { ascending: false });

      if (riskLevel) {
        query = query.eq('risk_level', riskLevel);
      }

      const { data, error } = await query;

      if (error) {
        console.error('위험 기업 목록 조회 오류:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('데이터베이스 조회 오류:', error);
      return [];
    }
  }

  // 통계 데이터 조회
  async getRiskStatistics(): Promise<{
    total: number;
    safe: number;
    caution: number;
    danger: number;
  }> {
    if (!this.isConfigured()) {
      console.log('Supabase not configured, returning default stats');
      return { total: 0, safe: 0, caution: 0, danger: 0 };
    }

    try {
      const { data, error } = await supabase
        .from('company_risks')
        .select('risk_level');

      if (error) {
        console.error('통계 데이터 조회 오류:', error);
        return { total: 0, safe: 0, caution: 0, danger: 0 };
      }

      const stats = data.reduce((acc, item) => {
        acc.total++;
        acc[item.risk_level]++;
        return acc;
      }, { total: 0, safe: 0, caution: 0, danger: 0 });

      return stats;
    } catch (error) {
      console.error('통계 조회 오류:', error);
      return { total: 0, safe: 0, caution: 0, danger: 0 };
    }
  }
}

export const riskDatabase = new RiskDatabaseService();