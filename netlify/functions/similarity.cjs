const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
  try {
    const userData = JSON.parse(event.body);
    // 1. Supabase에서 3개 연도 테이블 모두 불러오기
    const years = ['2022', '2023', '2024'];
    let allRecords = [];
    for (const year of years) {
      const { data, error } = await supabase
        .from(`financial_${year}`)
        .select('*');
      if (error) throw error;
      allRecords = allRecords.concat((data || []).map(row => ({ ...row, year })));
    }

    // 2. 유저 데이터에서 7개 지표 계산
    function coalesce(...cols) {
      for (const col of cols) {
        if (col !== undefined && col !== null && !isNaN(col)) return col;
      }
      return null;
    }
    function calcRatios(data) {
      return {
        current_ratio: data.currentAssets / data.currentLiabilities,
        debt_ratio: data.totalLiabilities / data.equity,
        ROA: data.netIncome / data.totalAssets,
        ROE: data.netIncome / data.equity,
        asset_turnover: data.revenue / data.totalAssets,
        revenue_growth: data.revenue_growth, // 필요시 프론트에서 계산해서 넘김
        asset_growth: data.asset_growth      // 필요시 프론트에서 계산해서 넘김
      };
    }
    const userRatios = calcRatios(userData);

    // 3. 부실기업 데이터에서 7개 지표 추출
    const records = allRecords.map(r => {
      return {
        ticker: r.ticker,
        year: r.year,
        current_ratio: coalesce(r['ifrs-full_CurrentAssets']) / coalesce(r['ifrs-full_CurrentLiabilities']),
        debt_ratio: coalesce(r['ifrs-full_Assets']) / coalesce(r['ifrs-full_Liabilities']),
        ROA: coalesce(r['ifrs-full_ProfitLoss']) / coalesce(r['ifrs-full_Assets']),
        ROE: coalesce(r['ifrs-full_ProfitLoss']) / coalesce(r['ifrs-full_Equity']),
        asset_turnover: coalesce(r['ifrs-full_Revenue']) / coalesce(r['ifrs-full_Assets']),
        revenue_growth: r.revenue_growth, // 컬럼이 있으면 사용
        asset_growth: r.asset_growth      // 컬럼이 있으면 사용
      };
    });

    // 4. 코사인 유사도 계산
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
    const similarities = records
      .map(r => ({
        ticker: r.ticker,
        year: r.year,
        similarity: cosineSimilarity(userRatios, r, keys)
      }))
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
