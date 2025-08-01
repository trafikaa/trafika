import { CompanyData, FinancialRatios, RiskAssessment } from '../types';

export const assessRisk = (ratios: FinancialRatios, data: CompanyData): RiskAssessment => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // 영업현금흐름 평가 (가장 위험)
  if (data.operatingCashFlow < 0) {
    riskScore += 40;
    warnings.push('영업현금흐름이 음수로 현금 창출 능력이 부족합니다.');
    recommendations.push('현금 창출 능력 개선 및 운영 효율성 제고가 필요합니다.');
  }

  // 부채비율 평가 (두 번째로 위험)
  if (ratios.debt_ratio && ratios.debt_ratio > 200) {
    riskScore += 35;
    warnings.push('부채비율이 200%를 초과하여 재무위험이 높습니다.');
    recommendations.push('부채 규모 축소 및 자기자본 확충이 필요합니다.');
  }

  // 유동비율 평가 (세 번째로 위험)
  if (ratios.current_ratio && ratios.current_ratio < 100) {
    riskScore += 30;
    warnings.push('유동비율이 100% 미만으로 단기 유동성 위험이 있습니다.');
    recommendations.push('단기 자금 조달 계획을 수립하고 유동자산을 증대시켜야 합니다.');
  }

  // 매출액 성장률 평가 (네 번째로 위험)
  if (ratios.revenue_growth !== null && ratios.revenue_growth < 0) {
    riskScore += 20;
    warnings.push('매출액 성장률이 음수로 매출이 감소하고 있습니다.');
    recommendations.push('매출 증대를 위한 사업 전략 수립이 필요합니다.');
  }

  // 영업이익률 평가 (다섯 번째로 위험)
  if (ratios.operating_margin_on_total_assets !== null && ratios.operating_margin_on_total_assets < 5) {
    riskScore += 20;
    warnings.push('영업이익률이 5% 미만으로 수익성이 낮습니다.');
    recommendations.push('영업 효율성 개선이 필요합니다.');
  }

  // 자기자본비율 평가 (여섯 번째로 위험)
  if (ratios.equity_ratio && ratios.equity_ratio < 30) {
    riskScore += 15;
    warnings.push('자기자본비율이 30% 미만으로 재무구조가 불안정합니다.');
    recommendations.push('자기자본 확충을 통한 재무구조 개선이 시급합니다.');
  }

  // ROE 평가 (일곱 번째로 위험)
  if (ratios.ROE !== null && ratios.ROE < 5) {
    riskScore += 10;
    warnings.push('ROE가 5% 미만으로 수익성이 매우 낮습니다.');
    recommendations.push('수익성 개선을 위한 사업 구조조정이 필요합니다.');
  }

  // 위험도 레벨 결정
  let level: 'safe' | 'caution' | 'danger';
  if (riskScore >= 70) {
    level = 'danger';
  } else if (riskScore >= 40) {
    level = 'caution';
  } else {
    level = 'safe';
  }

  return {
    level,
    score: riskScore,
    warnings,
    recommendations,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};