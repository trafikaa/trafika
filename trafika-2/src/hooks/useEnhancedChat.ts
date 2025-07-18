import { useState, useCallback } from 'react';
import { ChatMessage, ChatStep, CompanyData } from '../types';
import { calculateFinancialRatios, assessRisk } from '../utils/financialAnalysis';
import { dartApi } from '../services/dartApi';
import { riskDatabase } from '../services/riskDatabase';

export const useEnhancedChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 고도화된 부실기업 경고 시스템입니다. 🏢\n\n기업명을 입력하시면 다트(DART)에서 최신 재무정보를 자동으로 불러와 분석해드립니다.\n\n분석하고 싶은 기업명을 입력해주세요.',
      timestamp: new Date(),
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState<ChatStep>('company-name');
  const [companyName, setCompanyName] = useState('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCompanyNameSubmit = useCallback(async (name: string) => {
    addMessage({
      type: 'user',
      content: name,
    });

    setCompanyName(name);
    setIsLoading(true);

    simulateTyping(async () => {
      try {
        // 1. 다트에서 기업 정보 검색
        addMessage({
          type: 'bot',
          content: `${name} 기업을 다트(DART)에서 검색 중입니다... 🔍`,
        });

        const companies = await dartApi.searchCompany(name);
        
        if (companies.length === 0) {
          addMessage({
            type: 'bot',
            content: `죄송합니다. "${name}" 기업을 찾을 수 없습니다.\n\n다른 기업명으로 다시 시도해주세요.`,
          });
          setIsLoading(false);
          return;
        }

        const selectedCompany = companies[0];
        
        simulateTyping(async () => {
          // 2. 재무제표 데이터 조회
          addMessage({
            type: 'bot',
            content: `${selectedCompany.corp_name}의 최신 재무정보를 불러오는 중입니다... 📊`,
          });

          const financialData = await dartApi.getFinancialStatement(selectedCompany.corp_code);
          
          const fullCompanyData: CompanyData = {
            name: selectedCompany.corp_name,
            ...financialData
          };

          setCompanyData(fullCompanyData);
          setCurrentStep('financial-data');

          simulateTyping(() => {
            addMessage({
              type: 'bot',
              content: `✅ ${selectedCompany.corp_name}의 재무정보를 성공적으로 불러왔습니다!\n\n아래에서 데이터를 확인하고 필요시 수정한 후 분석을 진행해주세요.`,
            });
            setIsLoading(false);
          }, 1000);
        }, 1500);
      } catch (error) {
        console.error('기업 정보 조회 오류:', error);
        addMessage({
          type: 'bot',
          content: `기업 정보를 불러오는 중 오류가 발생했습니다.\n\n다시 시도해주시거나 수동으로 재무정보를 입력해주세요.`,
        });
        setCurrentStep('financial-data');
        setIsLoading(false);
      }
    }, 1000);
  }, [addMessage, simulateTyping]);

  const handleFinancialDataSubmit = useCallback(async (data: CompanyData) => {
    addMessage({
      type: 'user',
      content: `${data.name} 기업의 재무정보 분석을 시작합니다.`,
    });

    setCurrentStep('analysis');
    setIsLoading(true);

    simulateTyping(async () => {
      try {
        // 재무비율 계산
        const ratios = calculateFinancialRatios(data);
        const riskAssessment = assessRisk(ratios, data);
        
        // 데이터베이스에 저장
        await riskDatabase.saveCompanyRisk({
          company_name: data.name,
          company_code: 'AUTO_' + Date.now(),
          risk_score: riskAssessment.score,
          risk_level: riskAssessment.level,
          analysis_date: new Date().toISOString(),
          financial_data: data
        });

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

        let content = `${data.name} 기업 분석 완료 ${riskEmoji}\n\n${riskMessage}\n\n`;
        
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
            companyData: data,
          },
        });

        setCurrentStep('complete');
        setIsLoading(false);
      } catch (error) {
        console.error('분석 오류:', error);
        addMessage({
          type: 'bot',
          content: '분석 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
        setIsLoading(false);
      }
    }, 2000);
  }, [addMessage, simulateTyping]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: '안녕하세요! 고도화된 부실기업 경고 시스템입니다. 🏢\n\n기업명을 입력하시면 다트(DART)에서 최신 재무정보를 자동으로 불러와 분석해드립니다.\n\n분석하고 싶은 기업명을 입력해주세요.',
        timestamp: new Date(),
      }
    ]);
    setCurrentStep('company-name');
    setCompanyName('');
    setCompanyData(null);
    setIsTyping(false);
    setIsLoading(false);
  }, []);

  return {
    messages,
    currentStep,
    companyName,
    companyData,
    isTyping,
    isLoading,
    handleCompanyNameSubmit,
    handleFinancialDataSubmit,
    resetChat,
  };
};