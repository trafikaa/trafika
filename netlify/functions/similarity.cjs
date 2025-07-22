const fs = require('fs');
const path = require('path');
const csvParse = require('csv-parse/lib/sync');

exports.handler = async function(event, context) {
  const userData = JSON.parse(event.body); // CompanyData 형태

  // 1. CSV 읽기
  const csvPath = path.join(__dirname, '../../data/delisted_financials_with_metrics.csv');
  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const records = csvParse(csvData, { columns: true });

  // 2. 유저 데이터에서 7개 지표 계산
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

  // 3. 코사인 유사도 계산
  function cosineSimilarity(a, b, keys) {
    let dot = 0, normA = 0, normB = 0;
    for (const k of keys) {
      if (a[k] == null || b[k] == null || a[k] === '' || b[k] === '') continue;
      const va = parseFloat(a[k]);
      const vb = parseFloat(b[k]);
      dot += va * vb;
      normA += va * va;
      normB += vb * vb;
    }
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
};
