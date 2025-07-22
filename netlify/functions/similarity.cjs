const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
  try {
    const companyData = JSON.parse(event.body);

    // 1. 유저가 검색한 ticker를 가져옴
    const { ticker } = companyData.ticker;

    // 2. Supabase에서 해당 ticker의 2024_ratio row를 가져옴
    const { data: userRows, error: userError } = await supabase
      .from('2024_ratio')
      .select('*')
      .eq('ticker', ticker)
      .limit(1);

    if (userError) throw userError;
    if (!userRows || userRows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `해당 ticker(${ticker})의 2024_ratio 데이터가 없습니다.` })
      };
    }

    // 3. 7개 지표를 userRatios로 사용
    const userRatios = userRows[0]; // current_ratio, debt_ratio, ROA, ROE, asset_turnover, revenue_growth, asset_growth

    console.log('userRatios:', userRatios); // 유저 ticker의 7개 지표

    // 3. 코사인 유사도 계산
    function cosineSimilarity(a, b, keys) {
      let dot = 0, normA = 0, normB = 0;
      for (const k of keys) {
        if (a[k] == null || b[k] == null || a[k] === '' || b[k] === '' || isNaN(a[k]) || isNaN(b[k])) continue;
        const va = parseFloat(a[k]);
        const vb = parseFloat(b[k]);
        dot += va * vb;
        normA += va * va;
        normB += vb * vb;
      }
      if (normA === 0 || normB === 0) return 0;
      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    const keys = ['current_ratio','debt_ratio','ROA','ROE','asset_turnover','revenue_growth','asset_growth'];
    const similarities = (records || [])
      .map(r => {
        const sim = cosineSimilarity(userRatios, r, keys);
        console.log(`유사도 계산: user(${userRatios.ticker}) vs delisted(${r.ticker}) =`, sim);
        return {
          ticker: r.ticker,
          similarity: (isNaN(sim) || sim === undefined || sim === null) ? 0 : sim
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // 상위 5개

    return {
      statusCode: 200,
      body: JSON.stringify(similarities)
    };
  } catch (err) {
    console.error('Similarity function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' })
    };
  }
};
