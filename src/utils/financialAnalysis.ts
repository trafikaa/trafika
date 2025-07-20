import { CompanyData, FinancialRatios, RiskAssessment } from '../types';

export const assessRisk = (ratios: FinancialRatios, data: CompanyData): RiskAssessment => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 0;

  // 부채비율 평가 (70% 이상 위험)
  if (ratios.debt_ratio && ratios.debt_ratio > 70) {
    riskScore += 30;
    warnings.push('부채비율이 70%를 초과하여 재무위험이 높습니다.');
    recommendations.push('부채 규모 축소 및 자기자본 확충이 필요합니다.');
  } else if (ratios.debt_ratio && ratios.debt_ratio > 50) {
    riskScore += 15;
    warnings.push('부채비율이 50%를 초과하여 주의가 필요합니다.');
    recommendations.push('부채 관리 계획 수립을 권장합니다.');
  }

  // 유동비율 평가 (1.0 미만 위험)
  if (ratios.current_ratio && ratios.current_ratio < 1.0) {
    riskScore += 25;
    warnings.push('유동비율이 1.0 미만으로 단기 유동성 위험이 있습니다.');
    recommendations.push('단기 자금 조달 계획을 수립하고 유동자산을 증대시켜야 합니다.');
  } else if (ratios.current_ratio && ratios.current_ratio < 1.5) {
    riskScore += 10;
    warnings.push('유동비율이 낮아 단기 유동성에 주의가 필요합니다.');
    recommendations.push('유동자산 관리를 강화하시기 바랍니다.');
  }

  // 자기자본비율 평가 (30% 미만 위험)
  if (ratios.equity_ratio && ratios.equity_ratio < 30) {
    riskScore += 20;
    warnings.push('자기자본비율이 30% 미만으로 재무구조가 불안정합니다.');
    recommendations.push('자기자본 확충을 통한 재무구조 개선이 시급합니다.');
  } else if (ratios.equity_ratio && ratios.equity_ratio < 50) {
    riskScore += 10;
    warnings.push('자기자본비율이 낮아 재무구조 개선이 필요합니다.');
    recommendations.push('내부 유보 증대 및 자본 확충을 고려해보세요.');
  }

  // ROA 평가 (음수 위험) - null 체크 추가
  if (ratios.pretax_income_to_total_assets !== null && ratios.pretax_income_to_total_assets < 0) {
    riskScore += 20;
    warnings.push('총자산수익률(ROA)이 음수로 수익성이 매우 낮습니다.');
    recommendations.push('수익성 개선을 위한 사업 구조조정이 필요합니다.');
  } else if (ratios.pretax_income_to_total_assets !== null && ratios.pretax_income_to_total_assets < 3) {
    riskScore += 5;
    warnings.push('총자산수익률(ROA)이 낮아 수익성 개선이 필요합니다.');
    recommendations.push('자산 효율성 제고 및 수익성 개선 방안을 모색하세요.');
  }

  // 영업현금흐름 평가
  if (data.operatingCashFlow < 0) {
    riskScore += 15;
    warnings.push('영업현금흐름이 음수로 현금 창출 능력이 부족합니다.');
    recommendations.push('현금 창출 능력 개선 및 운영 효율성 제고가 필요합니다.');
  }

  // 위험도 레벨 결정
  let level: 'safe' | 'caution' | 'danger';
  if (riskScore >= 60) {
    level = 'danger';
  } else if (riskScore >= 30) {
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