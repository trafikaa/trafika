export async function fetchRiskSimilarity(companyData) {
  const res = await fetch('/.netlify/functions/similarity', {
    method: 'POST',
    body: JSON.stringify(companyData),
  });
  if (!res.ok) throw new Error('유사도 분석 실패');
  return await res.json(); // [{ticker, year, similarity}, ...]
}
