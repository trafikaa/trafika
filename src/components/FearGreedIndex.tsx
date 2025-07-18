import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FearGreedIndexProps {
  score: number; // 0-100
  level: 'safe' | 'caution' | 'danger';
}

const FearGreedIndex: React.FC<FearGreedIndexProps> = ({ score, level }) => {
  const getColor = () => {
    if (score <= 30) return '#10B981'; // 안전 - 초록색
    if (score <= 60) return '#F59E0B'; // 주의 - 노란색
    return '#EF4444'; // 위험 - 빨간색
  };

  const getLabel = () => {
    if (score <= 20) return '매우 안전';
    if (score <= 40) return '안전';
    if (score <= 60) return '주의';
    if (score <= 80) return '위험';
    return '매우 위험';
  };

  const getIcon = () => {
    if (score <= 40) return <TrendingUp className="w-6 h-6" />;
    if (score <= 60) return <Minus className="w-6 h-6" />;
    return <TrendingDown className="w-6 h-6" />;
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">부실 위험도 지수</h3>
        <p className="text-sm text-gray-600">Fear & Greed Index 기반</p>
      </div>

      <div className="relative flex items-center justify-center mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* 배경 원 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          {/* 진행률 원 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold" style={{ color: getColor() }}>
            {score}
          </div>
          <div className="text-xs text-gray-500">/ 100</div>
        </div>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div style={{ color: getColor() }}>
            {getIcon()}
          </div>
          <span className="text-lg font-semibold" style={{ color: getColor() }}>
            {getLabel()}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {score <= 30 && '재무상태가 양호하여 부실 위험이 낮습니다.'}
          {score > 30 && score <= 60 && '일부 재무지표에 주의가 필요합니다.'}
          {score > 60 && '재무상태가 불안정하여 즉시 개선이 필요합니다.'}
        </div>

        {/* 범례 */}
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>안전 (0-40)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>주의 (41-60)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>위험 (61-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FearGreedIndex;