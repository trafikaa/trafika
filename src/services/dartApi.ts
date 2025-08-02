// 현재 사용되지 않는 DART API 관련 파일
// 향후 DART API 재활용 시 주석 해제하여 사용

/*
import { DART_DEFAULT_YEAR } from '../constants/finance';

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
  account_nm: string;      // ← "자산총계", "부채총계" 등 항목명
  account_detail: string;
  thstrm_nm: string;
  thstrm_amount: string; 
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
  constructor() {
    // 생성자에서 특별한 초기화 작업 없음
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
        return data.list || [];
      } else {
        console.error('DART API 검색 실패:', data.message);
        return [];
      }
    } catch (error) {
      console.error('프록시 함수 기업 검색 오류:', error);
      return [];
    }
  }

  // 재무제표 데이터 조회
  async getFinancialStatement(corpCode: string, year: string = '2024'): Promise<Partial<CompanyData> | null> {
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
        // return this.parseFinancialData(data.list); // 주석 처리됨
        return null; // 임시로 null 반환
      } else {
        console.error('DART API 재무제표 조회 실패:', data.message);
        return null;
      }
    } catch (error) {
      console.error('프록시 함수 재무제표 조회 오류:', error);
      return null;
    }
  }

  // 현재 사용되지 않는 함수 - Supabase 기반 데이터 소스로 변경됨
  // private parseFinancialData(rawData: DartFinancialData[]): Partial<CompanyData> {
  //   const financialData = {
  //     totalAssets: 0,
  //     totalLiabilities: 0,
  //     equity: 0,
  //     currentAssets: 0,
  //     currentLiabilities: 0,
  //     revenue: 0,
  //     netIncome: 0,
  //     operatingCashFlow: 0
  //   };

  //   if (!rawData || !Array.isArray(rawData)) {
  //     return financialData;
  //   }

  //   rawData.forEach(item => {
  //     const amount = parseInt(item.thstrm_amount.replace(/,/g, '')) || 0;
      
  //     switch (item.account_nm) {
  //       case '자산총계':
  //         financialData.totalAssets = Math.floor(amount / 100000000); // 억원 단위
  //         break;
  //       case '부채총계':
  //         financialData.totalLiabilities = Math.floor(amount / 100000000);
  //         break;
  //       case '자본총계':
  //         financialData.equity = Math.floor(amount / 100000000);
  //         break;
  //       case '유동자산':
  //         financialData.currentAssets = Math.floor(amount / 100000000);
  //         break;
  //       case '유동부채':
  //         financialData.currentLiabilities = Math.floor(amount / 100000000);
  //         break;
  //       case '매출액':
  //         financialData.revenue = Math.floor(amount / 100000000);
  //         break;
  //       case '당기순이익':
  //         financialData.netIncome = Math.floor(amount / 100000000);
  //         break;
  //       case '영업활동현금흐름':
  //         financialData.operatingCashFlow = Math.floor(amount / 100000000);
  //         break;
  //     }
  //   });

  //   return financialData;
  // }
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

// 사용되지 않는 함수 - 주석 처리
// function extractCompanyDataFromDart(dartInfo: { list: DartFinancialData[] }): Partial<CompanyData> {
//   const result: Partial<CompanyData> = {};
//   if (!dartInfo.list || !Array.isArray(dartInfo.list)) return result;

//   dartInfo.list.forEach((item) => {
//     const amount = parseInt(item.thstrm_amount.replace(/,/g, '') || '0', 10) / 100000000;
//     switch (item.account_nm) {
//       case '자산총계': result.totalAssets = amount; break;
//       case '부채총계': result.totalLiabilities = amount; break;
//       case '자본총계': result.equity = amount; break;
//       case '유동자산': result.currentAssets = amount; break;
//       case '유동부채': result.currentLiabilities = amount; break;
//       case '매출액': result.revenue = amount; break;
//       case '당기순이익': result.netIncome = amount; break;
//       case '영업활동현금흐름': result.operatingCashFlow = amount; break;
//     }
//   });

//   return result;
// }
*/