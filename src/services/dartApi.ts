import axios from 'axios';
import { DART_DEFAULT_YEAR } from '../constants/finance';

const DART_API_BASE_URL = 'https://opendart.fss.or.kr/api';
// DART API 키 관련 코드 삭제

export interface DartCompanyInfo {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  modify_date: string;
}

export interface DartFinancialData {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  sj_div: string;
  sj_nm: string;
  account_id: string;
  account_nm: string;      // ← 이게 "자산총계", "부채총계" 등 항목명
  account_detail: string;
  thstrm_nm: string;
  thstrm_amount: string;   // ← 이게 실제 금액(문자열)
  frmtrm_nm: string;
  frmtrm_amount: string;
  bfefrmtrm_nm: string;
  bfefrmtrm_amount: string;
  ord: string;
  currency: string;
}

// CompanyData 타입 정의 추가
export interface CompanyData {
  name: string;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  currentAssets: number;
  currentLiabilities: number;
  revenue: number;
  netIncome: number;
  operatingCashFlow: number;
}

class DartApiService {
  // DART API 키 관련 멤버 삭제

  constructor() {
    // DART API 키 관련 경고 삭제
  }

  // 기업 기본정보 검색
  async searchCompany(companyName: string): Promise<DartCompanyInfo[]> {
    try {
      const params = new URLSearchParams({
        endpoint: 'company.json',
        corp_name: companyName
      });

      const response = await fetch(`/.netlify/functions/dartProxy?${params.toString()}`);
      const data = await response.json();

      if (data.status === '000') {
        // 실제 데이터 파싱 로직 필요
        return data.list;
      } else {
        return this.getMockCompanyData(companyName);
      }
    } catch (error) {
      console.error('프록시 함수 기업 검색 오류:', error);
      return this.getMockCompanyData(companyName);
    }
  }

  // 재무제표 데이터 조회
  async getFinancialStatement(corpCode: string, year: string = '2024'): Promise<any> {
    try {
      const params = new URLSearchParams({
        endpoint: 'fnlttSinglAcntAll.json',
        corp_code: corpCode,
        bsns_year: year,
        reprt_code: '11011',
        fs_div: 'CFS'
      });

      const response = await fetch(`/.netlify/functions/dartProxy?${params.toString()}`);
      const data = await response.json();

      if (data.status === '000') {
        return this.parseFinancialData(data.list);
      } else {
        return this.getMockFinancialData();
      }
    } catch (error) {
      console.error('프록시 함수 재무제표 조회 오류:', error);
      return this.getMockFinancialData();
    }
  }

  private parseFinancialData(rawData: DartFinancialData[]): any {
    const financialData = {
      totalAssets: 0,
      totalLiabilities: 0,
      equity: 0,
      currentAssets: 0,
      currentLiabilities: 0,
      revenue: 0,
      netIncome: 0,
      operatingCashFlow: 0
    };

    rawData.forEach(item => {
      const amount = parseInt(item.thstrm_amount.replace(/,/g, '')) || 0;
      
      switch (item.account_nm) {
        case '자산총계':
          financialData.totalAssets = Math.floor(amount / 100000000); // 억원 단위
          break;
        case '부채총계':
          financialData.totalLiabilities = Math.floor(amount / 100000000);
          break;
        case '자본총계':
          financialData.equity = Math.floor(amount / 100000000);
          break;
        case '유동자산':
          financialData.currentAssets = Math.floor(amount / 100000000);
          break;
        case '유동부채':
          financialData.currentLiabilities = Math.floor(amount / 100000000);
          break;
        case '매출액':
          financialData.revenue = Math.floor(amount / 100000000);
          break;
        case '당기순이익':
          financialData.netIncome = Math.floor(amount / 100000000);
          break;
        case '영업활동현금흐름':
          financialData.operatingCashFlow = Math.floor(amount / 100000000);
          break;
      }
    });

    return financialData;
  }

  // Mock 데이터 (개발/테스트용)
  private getMockCompanyData(companyName: string): DartCompanyInfo[] {
    const mockCompanies = [
      { corp_code: '00126380', corp_name: '삼성전자', stock_code: '005930', modify_date: '20241201' },
      { corp_code: '00164779', corp_name: 'LG전자', stock_code: '066570', modify_date: '20241201' },
      { corp_code: '00113570', corp_name: 'SK하이닉스', stock_code: '000660', modify_date: '20241201' },
      { corp_code: '00401731', corp_name: '네이버', stock_code: '035420', modify_date: '20241201' },
      { corp_code: '00164742', corp_name: '카카오', stock_code: '035720', modify_date: '20241201' }
    ];

    return mockCompanies.filter(company => 
      company.corp_name.includes(companyName) || companyName.includes(company.corp_name)
    );
  }

  private getMockFinancialData(): any {
    return {
      totalAssets: 4278,
      totalLiabilities: 1047,
      equity: 3231,
      currentAssets: 1876,
      currentLiabilities: 623,
      revenue: 3020,
      netIncome: 265,
      operatingCashFlow: 412
    };
  }
}

export const dartApi = new DartApiService();

export async function fetchDartCompanyInfo(corpCode: string) {
  const params = new URLSearchParams({
    endpoint: 'company.json',
    corp_code: corpCode
  });

  const response = await fetch(`/.netlify/functions/dartProxy?${params.toString()}`);
  const data = await response.json();
  return data;
}

export async function fetchDartFinancialStatement(corpCode: string, year: string = DART_DEFAULT_YEAR) {
  const params = new URLSearchParams({
    endpoint: 'fnlttSinglAcntAll.json',
    corp_code: corpCode,
    bsns_year: year,
    reprt_code: '11011',
    fs_div: 'CFS'
  });
  const response = await fetch(`/.netlify/functions/dartProxy?${params.toString()}`);
  return await response.json();
}

function extractCompanyDataFromDart(dartInfo: { list: DartFinancialData[] }): Partial<CompanyData> {
  const result: Partial<CompanyData> = {};
  if (!dartInfo.list || !Array.isArray(dartInfo.list)) return result;

  dartInfo.list.forEach((item) => {
    const amount = parseInt(item.thstrm_amount.replace(/,/g, '') || '0', 10) / 100000000;
    switch (item.account_nm) {
      case '자산총계': result.totalAssets = amount; break;
      case '부채총계': result.totalLiabilities = amount; break;
      case '자본총계': result.equity = amount; break;
      case '유동자산': result.currentAssets = amount; break;
      case '유동부채': result.currentLiabilities = amount; break;
      case '매출액': result.revenue = amount; break;
      case '당기순이익': result.netIncome = amount; break;
      case '영업활동현금흐름': result.operatingCashFlow = amount; break;
    }
  });

  return result;
}