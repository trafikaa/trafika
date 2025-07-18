// 기업의 기본정보(대표자, 주소 등)를 조회하는 서비스

import { supabase } from '../lib/supabase';

export async function getCorpCodeByCompanyName(companyName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('ticker_info')
    .select('corp_code, corp_name')
    .ilike('corp_name', `%${companyName.trim()}%`)
    .limit(5);

  console.log('Supabase data:', data, '입력값:', companyName);

  if (error) {
    console.error('Supabase 쿼리 오류:', error);
    return null;
  }
  if (!data || data.length === 0) {
    console.warn('DB에 해당 기업명이 없습니다:', companyName);
    return null;
  }
  return data[0].corp_code;
}
