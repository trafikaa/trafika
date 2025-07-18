import { supabase } from '../lib/supabase';

export async function getCorpCodeByCompanyName(companyName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('ticker_info')
    .select('corp_code')
    .eq('corp_name', companyName)
    .single();

  if (error) {
    console.error('Supabase 쿼리 오류:', error);
    return null;
  }
  return data?.corp_code ?? null;
}
