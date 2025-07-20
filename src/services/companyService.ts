// 기업의 기본정보(대표자, 주소 등)를 조회하는 서비스

import { supabaseProxy } from './supabaseProxy';
import { FinancialRatios } from '../types';

export interface CompanyInfo {
  corp_code: string;
  ticker: string;
}

export async function getCompanyInfoByName(companyName: string): Promise<CompanyInfo | null> {
  try {
    console.log('기업명 검색 시작:', companyName);
    
    // 입력값 정규화: 공백 제거, 대문자 변환
    const normalizedInput = companyName.trim().toUpperCase();
    console.log('정규화된 기업명:', normalizedInput);
    
    const result = await supabaseProxy.select('ticker_info', {
      corp_name: normalizedInput
    });

    console.log('Supabase 쿼리 결과:', result);
    console.log('검색된 데이터 개수:', result.data?.length || 0);

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 기업명이 없습니다:', companyName);
      return null;
    }

    const companyData = result.data[0];
    console.log('찾은 기업 정보:', companyData);
    console.log('ticker 형식 확인:', {
      ticker: companyData.ticker,
      ticker_타입: typeof companyData.ticker,
      ticker_길이: companyData.ticker?.length
    });
    
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
    console.log('재무비율 조회 시작:', ticker);
    
    // ticker 정규화: 공백 제거, 대문자 변환
    const normalizedTicker = ticker.trim().toUpperCase();
    console.log('정규화된 ticker:', normalizedTicker);
    
    const result = await supabaseProxy.select('2024_ratio', {
      ticker: normalizedTicker
    });

    console.log('2024_ratio 쿼리 결과:', result);
    console.log('검색된 데이터 개수:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      console.log('찾은 재무비율 정보:', result.data[0]);
      console.log('ticker 비교:', {
        요청_ticker: normalizedTicker,
        DB_ticker: result.data[0].ticker,
        일치: normalizedTicker === result.data[0].ticker
      });
    }

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 ticker의 재무비율이 없습니다:', normalizedTicker);
      
      // 디버깅을 위해 전체 테이블 조회
      console.log('2024_ratio 테이블 전체 조회 시도...');
      const allRatios = await supabaseProxy.select('2024_ratio');
      console.log('전체 재무비율 데이터 개수:', allRatios.data?.length || 0);
      if (allRatios.data && allRatios.data.length > 0) {
        console.log('첫 번째 데이터 예시:', allRatios.data[0]);
      }
      
      return null;
    }

    return result.data[0] as FinancialRatios;
  } catch (error) {
    console.error('재무비율 조회 오류:', error);
    return null;
  }
}
