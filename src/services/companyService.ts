// 기업의 기본정보(대표자, 주소 등)를 조회하는 서비스

import { supabaseProxy } from './supabaseProxy';
import { FinancialRatios, CompanyData } from '../types';

export interface CompanyInfo {
  corp_code: string;
  ticker: string;
}

export async function getCompanyInfoByName(companyName: string): Promise<CompanyInfo | null> {
  try {
    // 입력값 정규화: 공백 제거 + 영어는 대문자 변환
    const normalizedInput = companyName.trim().replace(/\s+/g, '').toUpperCase();
    
    console.log('검색할 기업명:', normalizedInput);
    
    // 먼저 테이블 구조 확인을 위해 전체 데이터 조회
    // const allData = await supabaseProxy.select('ticker_info');
    // console.log('ticker_info 테이블 전체 데이터 (처음 5개):', allData.data?.slice(0, 5));
    
    // 정확한 매칭만 시도
    const result = await supabaseProxy.select('ticker_info', {
      corp_name: normalizedInput
    });

    console.log('검색 결과:', result);

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 기업명이 없습니다:', companyName);
      console.log('Supabase 응답:', result);
      return null;
    }

    const companyData = result.data[0];
    console.log('찾은 기업:', companyData);
    
    return {
      corp_code: companyData.corp_code,
      ticker: companyData.ticker
    };
  } catch (error) {
    console.error('기업 코드 조회 오류:', error);
    return null;
  }
}

export async function getFinancialRatiosByTicker(ticker: string): Promise<FinancialRatios | null> {
  try {
    // ticker는 정규화하지 않음
    const result = await supabaseProxy.select('2024_ratio', {
      ticker: ticker
    });

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 ticker의 재무비율이 없습니다:', ticker);
      return null;
    }

    return result.data[0] as FinancialRatios;
  } catch (error) {
    console.error('재무비율 조회 오류:', error);
    return null;
  }
}

// Supabase에서 재무 데이터를 가져오는 새로운 함수
export async function getFinancialDataByTicker(ticker: string): Promise<Partial<CompanyData> | null> {
  try {
    // ticker는 정규화하지 않음
    
    // 2024년 데이터부터 순서대로 조회
    const result = await supabaseProxy.select('financial_2024', {
      ticker: ticker
    });

    // if (!result.data || result.data.length === 0) {
    //   // 2024년 데이터가 없으면 2023년 조회
    //   result = await supabaseProxy.select('financial_2023', {
    //     ticker: ticker
    //   });
    // }

    // if (!result.data || result.data.length === 0) {
    //   // 2023년 데이터가 없으면 2022년 조회
    //   result = await supabaseProxy.select('financial_2022', {
    //     ticker: ticker
    //   });
    // }

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 ticker의 재무 데이터가 없습니다:', ticker);
      return null;
    }

    const financialData = result.data[0];
    
    // Supabase 데이터를 CompanyData 형식으로 변환
    return {
      totalAssets: financialData['ifrs-full_Assets'] || 0,
      totalLiabilities: financialData['ifrs-full_Liabilities'] || 0,
      equity: financialData['ifrs-full_Equity'] || 0,
      currentAssets: financialData['ifrs-full_CurrentAssets'] || 0,
      currentLiabilities: financialData['ifrs-full_CurrentLiabilities'] || 0,
      revenue: financialData['ifrs-full_Revenue'] || financialData['ifrs-full_GrossProfit'] || 0,
      operatingIncome: financialData['dart_OperatingIncomeLoss'] || 0,
      netIncome: financialData['ifrs-full_ProfitLoss'] || 0,
      operatingCashFlow: financialData['ifrs-full_CashFlowsFromUsedInOperatingActivities'] || 0
    };
  } catch (error) {
    console.error('재무 데이터 조회 오류:', error);
    return null;
  }
}
