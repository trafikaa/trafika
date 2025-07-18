import { useState, useCallback } from 'react';
import { ChatMessage, ChatStep, CompanyData } from '../types';
import { calculateFinancialRatios, assessRisk } from '../utils/financialAnalysis';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 부실기업 경고 시스템입니다. 🏢\n\n기업의 재무정보를 분석하여 부실 위험도를 평가해드립니다.\n\n분석하고 싶은 기업명을 입력해주세요.',
      timestamp: new Date(),
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState<ChatStep>('company-name');
  const [companyName, setCompanyName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const simulateTyping = useCallback((callback: () => void, delay: number = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  }, []);

  const handleCompanyNameSubmit = useCallback((name: string) => {
    addMessage({
      type: 'user',
      content: name,
    });

    setCompanyName(name);
    setCurrentStep('financial-data');

    simulateTyping(() => {
      addMessage({
        type: 'bot',
        content: `${name} 기업의 재무정보를 입력받겠습니다.\n\n아래 폼에 최근 재무제표 정보를 입력해주세요. 정확한 분석을 위해 모든 항목을 입력해주시기 바랍니다.`,
      });
    });
  }, [addMessage, simulateTyping]);

  const handleFinancialDataSubmit = useCallback((data: CompanyData) => {
    addMessage({
      type: 'user',
      content: `${data.name} 기업의 재무정보를 입력했습니다.\n\n총자산: ${data.totalAssets.toLocaleString()}억원\n총부채: ${data.totalLiabilities.toLocaleString()}억원\n자기자본: ${data.equity.toLocaleString()}억원`,
    });

    setCurrentStep('analysis');

    simulateTyping(() => {
      const ratios = calculateFinancialRatios(data);
      const riskAssessment = assessRisk(ratios, data);
      
      let riskMessage = '';
      let riskEmoji = '';
      
      switch (riskAssessment.level) {
        case 'danger':
          riskMessage = '🚨 위험 등급: 높음\n즉시 개선 조치가 필요합니다!';
          riskEmoji = '🚨';
          break;
        case 'caution':
          riskMessage = '⚠️ 위험 등급: 보통\n지속적인 모니터링이 필요합니다.';
          riskEmoji = '⚠️';
          break;
        case 'safe':
          riskMessage = '✅ 위험 등급: 낮음\n양호한 재무상태입니다.';
          riskEmoji = '✅';
          break;
      }

      let content = `${data.name} 기업 분석 결과 ${riskEmoji}\n\n${riskMessage}\n\n`;
      
      if (riskAssessment.warnings.length > 0) {
        content += '⚠️ 주요 경고사항:\n';
        riskAssessment.warnings.forEach((warning, index) => {
          content += `${index + 1}. ${warning}\n`;
        });
        content += '\n';
      }

      if (riskAssessment.recommendations.length > 0) {
        content += '💡 개선 권장사항:\n';
        riskAssessment.recommendations.forEach((recommendation, index) => {
          content += `${index + 1}. ${recommendation}\n`;
        });
      }

      addMessage({
        type: 'bot',
        content,
        data: {
          ratios,
          riskLevel: riskAssessment.level,
          riskScore: riskAssessment.score,
        },
      });

      setCurrentStep('complete');
    }, 2000);
  }, [addMessage, simulateTyping]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: '안녕하세요! 부실기업 경고 시스템입니다. 🏢\n\n기업의 재무정보를 분석하여 부실 위험도를 평가해드립니다.\n\n분석하고 싶은 기업명을 입력해주세요.',
        timestamp: new Date(),
      }
    ]);
    setCurrentStep('company-name');
    setCompanyName('');
    setIsTyping(false);
  }, []);

  return {
    messages,
    currentStep,
    companyName,
    isTyping,
    handleCompanyNameSubmit,
    handleFinancialDataSubmit,
    resetChat,
  };
};