// 기업의 기본정보(대표자, 주소 등)를 조회하는 서비스

import { supabaseProxy } from './supabaseProxy';
import { FinancialRatios } from '../types';

export interface CompanyInfo {
  corp_code: string;
  ticker: string;
}

export async function getCompanyInfoByName(companyName: string): Promise<CompanyInfo | null> {
  try {
    // 입력값 정규화: 공백 제거, 대문자 변환
    const normalizedInput = companyName.trim().toUpperCase();
    
    const result = await supabaseProxy.select('ticker_info', {
      corp_name: normalizedInput
    });

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 기업명이 없습니다:', companyName);
      return null;
    }

    const companyData = result.data[0];
    
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
    // ticker 정규화: 공백 제거, 대문자 변환
    const normalizedTicker = ticker.trim().toUpperCase();
    
    const result = await supabaseProxy.select('2024_ratio', {
      ticker: normalizedTicker
    });

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 ticker의 재무비율이 없습니다:', normalizedTicker);
      return null;
    }

    return result.data[0] as FinancialRatios;
  } catch (error) {
    console.error('재무비율 조회 오류:', error);
    return null;
  }
}
