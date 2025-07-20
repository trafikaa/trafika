// 현재 사용하지 않는 데이터베이스 저장 기능
// 필요시 주석 해제하여 사용

/*
import { supabaseProxy } from './supabaseProxy';
import { CompanyRiskData } from '../lib/supabase';

export const riskDatabase = {
  async saveCompanyRisk(data: Omit<CompanyRiskData, 'id' | 'created_at'>): Promise<void> {
    try {
      const result = await supabaseProxy.insert('company_risks', {
        ...data,
        created_at: new Date().toISOString()
      });

      if (result.error) {
        console.error('데이터베이스 저장 오류:', result.error);
      } else {
        console.log('위험도 데이터 저장 성공');
      }
    } catch (error) {
      console.error('데이터베이스 저장 오류:', error);
    }
  },

  async getCompanyRisk(companyCode: string): Promise<CompanyRiskData | null> {
    try {
      const result = await supabaseProxy.select('company_risks', {
        company_code: companyCode
      });

      if (result.data && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (error) {
      console.error('데이터베이스 조회 오류:', error);
      return null;
    }
  },

  async getAllCompanyRisks(): Promise<CompanyRiskData[]> {
    try {
      const result = await supabaseProxy.select('company_risks');
      return result.data || [];
    } catch (error) {
      console.error('데이터베이스 조회 오류:', error);
      return [];
    }
  },

  async getRiskStatistics(): Promise<{
    total: number;
    safe: number;
    caution: number;
    danger: number;
  }> {
    try {
      const result = await supabaseProxy.select('company_risks');
      const data = result.data || [];

      const stats = data.reduce((acc: { total: number; safe: number; caution: number; danger: number }, item: CompanyRiskData) => {
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
};
*/