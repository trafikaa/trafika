import axios from 'axios';

const DART_API_BASE_URL = 'https://opendart.fss.or.kr/api';
const API_KEY = import.meta.env.VITE_DART_API_KEY;

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
  account_nm: string;
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

class DartApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEY || '';
    if (!this.apiKey) {
      console.warn('DART API key is not configured');
    }
  }

  // 기업 기본정보 검색
  async searchCompany(companyName: string): Promise<DartCompanyInfo[]> {
    try {
      const response = await axios.get(`${DART_API_BASE_URL}/corpCode.xml`, {
        params: {
          crtfc_key: this.apiKey,
        },
        responseType: 'text'
      });

      // XML 파싱 로직 (실제로는 더 정교한 파싱이 필요)
      // 여기서는 Mock 데이터를 반환
      return this.getMockCompanyData(companyName);
    } catch (error) {
      console.error('DART API 기업 검색 오류:', error);
      return this.getMockCompanyData(companyName);
    }
  }

  // 재무제표 데이터 조회
  async getFinancialStatement(corpCode: string, year: string = '2023'): Promise<any> {
    try {
      const response = await axios.get(`${DART_API_BASE_URL}/fnlttSinglAcntAll.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_code: corpCode,
          bsns_year: year,
          reprt_code: '11011', // 사업보고서
          fs_div: 'CFS' // 연결재무제표
        }
      });

      if (response.data.status === '000') {
        return this.parseFinancialData(response.data.list);
      } else {
        return this.getMockFinancialData();
      }
    } catch (error) {
      console.error('DART API 재무제표 조회 오류:', error);
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
      { corp_code: '00126380', corp_name: '삼성전자', stock_code: '005930', modify_date: '20231201' },
      { corp_code: '00164779', corp_name: 'LG전자', stock_code: '066570', modify_date: '20231201' },
      { corp_code: '00113570', corp_name: 'SK하이닉스', stock_code: '000660', modify_date: '20231201' },
      { corp_code: '00401731', corp_name: '네이버', stock_code: '035420', modify_date: '20231201' },
      { corp_code: '00164742', corp_name: '카카오', stock_code: '035720', modify_date: '20231201' }
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