// 기업의 기본정보(대표자, 주소 등)를 조회하는 서비스

import { supabaseProxy } from './supabaseProxy';

export async function getCorpCodeByCompanyName(companyName: string): Promise<string | null> {
  try {
    console.log('기업명 검색 시작:', companyName);
    
    const result = await supabaseProxy.select('ticker_info', {
      corp_name: `%${companyName.trim()}%`
    });

    console.log('Supabase 쿼리 결과:', result);
    console.log('검색된 데이터 개수:', result.data?.length || 0);

    if (!result.data || result.data.length === 0) {
      console.warn('DB에 해당 기업명이 없습니다:', companyName);
      return null;
    }

    console.log('찾은 기업 정보:', result.data[0]);
    return result.data[0].corp_code;
  } catch (error) {
    console.error('기업 코드 조회 오류:', error);
    return null;
  }
}
