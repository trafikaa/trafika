import React from 'react';
import { FinancialRatios, CompanyData } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface FinancialHealthReportProps {
  ratios: FinancialRatios;
  data: CompanyData;
}

const FinancialHealthReport: React.FC<FinancialHealthReportProps> = ({ ratios, data }) => {
  const getHealthScore = (value: number, thresholds: { good: number; fair: number }, isHigherBetter: boolean = true) => {
    if (isHigherBetter) {
      if (value >= thresholds.good) return { score: 'good', color: 'text-green-600', bg: 'bg-green-50' };
      if (value >= thresholds.fair) return { score: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { score: 'poor', color: 'text-red-600', bg: 'bg-red-50' };
    } else {
      if (value <= thresholds.good) return { score: 'good', color: 'text-green-600', bg: 'bg-green-50' };
      if (value <= thresholds.fair) return { score: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      return { score: 'poor', color: 'text-red-600', bg: 'bg-red-50' };
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'fair': return <AlertTriangle className="w-5 h-5" />;
      case 'poor': return <TrendingDown className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  const healthMetrics = [
    {
      title: '부채비율',
      value: ratios.debtRatio,
      unit: '%',
      description: '총부채 / 총자산',
      health: getHealthScore(ratios.debtRatio, { good: 30, fair: 50 }, false),
      icon: <Shield className="w-5 h-5" />,
      benchmark: '30% 이하 우수, 50% 이하 양호'
    },
    {
      title: '유동비율',
      value: ratios.currentRatio,
      unit: '',
      description: '유동자산 / 유동부채',
      health: getHealthScore(ratios.currentRatio, { good: 2.0, fair: 1.5 }),
      icon: <DollarSign className="w-5 h-5" />,
      benchmark: '2.0 이상 우수, 1.5 이상 양호'
    },
    {
      title: '자기자본비율',
      value: ratios.equityRatio,
      unit: '%',
      description: '자기자본 / 총자산',
      health: getHealthScore(ratios.equityRatio, { good: 50, fair: 30 }),
      icon: <TrendingUp className="w-5 h-5" />,
      benchmark: '50% 이상 우수, 30% 이상 양호'
    },
    {
      title: '총자산수익률(ROA)',
      value: ratios.roa,
      unit: '%',
      description: '순이익 / 총자산',
      health: getHealthScore(ratios.roa, { good: 5, fair: 2 }),
      icon: <TrendingUp className="w-5 h-5" />,
      benchmark: '5% 이상 우수, 2% 이상 양호'
    },
    {
      title: '자기자본수익률(ROE)',
      value: ratios.roe,
      unit: '%',
      description: '순이익 / 자기자본',
      health: getHealthScore(ratios.roe, { good: 15, fair: 10 }),
      icon: <TrendingUp className="w-5 h-5" />,
      benchmark: '15% 이상 우수, 10% 이상 양호'
    },
    {
      title: '영업이익률',
      value: ratios.operatingMargin,
      unit: '%',
      description: '순이익 / 매출액',
      health: getHealthScore(ratios.operatingMargin, { good: 10, fair: 5 }),
      icon: <DollarSign className="w-5 h-5" />,
      benchmark: '10% 이상 우수, 5% 이상 양호'
    }
  ];

  const overallHealth = () => {
    const scores = healthMetrics.map(metric => {
      switch (metric.health.score) {
        case 'good': return 3;
        case 'fair': return 2;
        case 'poor': return 1;
        default: return 1;
      }
    });
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (average >= 2.5) return { level: 'good', text: '우수', color: 'text-green-600' };
    if (average >= 2.0) return { level: 'fair', text: '양호', color: 'text-yellow-600' };
    return { level: 'poor', text: '개선필요', color: 'text-red-600' };
  };

  const overall = overallHealth();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">재무건전성 분석 보고서</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 ${overall.color}`}>
            {getScoreIcon(overall.level)}
            <span className="font-semibold">종합평가: {overall.text}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>{data.name}의 재무제표를 기반으로 한 상세 건전성 분석 결과입니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {healthMetrics.map((metric, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${metric.health.bg} border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`${metric.health.color}`}>
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 ${metric.health.color}`}>
                {getScoreIcon(metric.health.score)}
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-1">{metric.title}</h4>
            <div className="text-2xl font-bold mb-1" style={{ color: metric.health.color.replace('text-', '') }}>
              {metric.value.toFixed(2)}{metric.unit}
            </div>
            
            <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
            <p className="text-xs text-gray-500">{metric.benchmark}</p>
          </div>
        ))}
      </div>

      {/* 재무 요약 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">재무 현황 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">총자산:</span>
            <span className="font-semibold ml-1">{data.totalAssets.toLocaleString()}억원</span>
          </div>
          <div>
            <span className="text-gray-600">총부채:</span>
            <span className="font-semibold ml-1">{data.totalLiabilities.toLocaleString()}억원</span>
          </div>
          <div>
            <span className="text-gray-600">자기자본:</span>
            <span className="font-semibold ml-1">{data.equity.toLocaleString()}억원</span>
          </div>
          <div>
            <span className="text-gray-600">매출액:</span>
            <span className="font-semibold ml-1">{data.revenue.toLocaleString()}억원</span>
          </div>
        </div>
      </div>

      {/* 개선 권장사항 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 재무건전성 개선 권장사항</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          {ratios.debtRatio > 50 && <li>• 부채비율 개선을 위한 부채 축소 및 자기자본 확충 필요</li>}
          {ratios.currentRatio < 1.5 && <li>• 단기 유동성 개선을 위한 유동자산 증대 권장</li>}
          {ratios.roa < 2 && <li>• 자산 효율성 제고를 통한 수익성 개선 필요</li>}
          {ratios.roe < 10 && <li>• 자기자본 수익률 향상을 위한 사업 효율성 개선 권장</li>}
          {data.operatingCashFlow < 0 && <li>• 영업현금흐름 개선을 위한 운영 효율성 제고 필요</li>}
        </ul>
      </div>
    </div>
  );
};

export default FinancialHealthReport;