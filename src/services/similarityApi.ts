export async function fetchRiskSimilarity(ticker: string) {
  const res = await fetch('/.netlify/functions/similarity', {
    method: 'POST',
    body: JSON.stringify({ ticker }),
  });
  if (!res.ok) throw new Error('유사도 분석 실패');
  return await res.json(); // [{ticker, year, similarity}, ...]
}
