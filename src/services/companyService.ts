import { supabase } from '../lib/supabase';

export async function getCorpCodeByCompanyName(companyName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('ticker_info')
    .select('corp_code')
    .ilike('corp_name', `%${companyName.trim()}%`)
    .maybeSingle();

  if (error) {
    console.error('Supabase 쿼리 오류:', error);
    return null;
  }
  if (!data) {
    console.warn('DB에 해당 기업명이 없습니다:', companyName);
    return null;
  }
  return data.corp_code;
}
