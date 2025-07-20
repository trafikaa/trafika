import React from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';
  
  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'caution':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'danger':
        return 'bg-red-50 border-red-200';
      case 'caution':
        return 'bg-yellow-50 border-yellow-200';
      case 'safe':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isBot 
          ? 'bg-white border border-gray-200 text-gray-800' 
          : 'bg-blue-600 text-white'
      }`}>
        {message.data?.riskLevel && (
          <div className={`mb-2 p-2 rounded border ${getRiskColor(message.data.riskLevel)}`}>
            <div className="flex items-center gap-2 mb-1">
              {getRiskIcon(message.data.riskLevel)}
              <span className="font-semibold text-sm">
                위험도: {message.data.riskLevel === 'danger' ? '위험' : 
                        message.data.riskLevel === 'caution' ? '주의' : '안전'}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              위험점수: {message.data.riskScore}/100
            </div>
          </div>
        )}
        
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
        
        {message.data?.ratios && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div className="font-medium mb-1">주요 재무비율</div>
            <div className="space-y-1">
              <div>부채비율: {message.data.ratios.debt_ratio?.toFixed(2) || 'N/A'}%</div>
              <div>유동비율: {message.data.ratios.current_ratio?.toFixed(2) || 'N/A'}</div>
              <div>자기자본비율: {message.data.ratios.equity_ratio?.toFixed(2) || 'N/A'}%</div>
              <div>ROA: {message.data.ratios.pretax_income_to_total_assets?.toFixed(2) || 'N/A'}%</div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          {message.timestamp.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;