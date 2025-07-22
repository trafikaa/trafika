import { useState, useCallback } from 'react';
import { ChatMessage, ChatStep, CompanyData, FinancialRatios } from '../types';
import { assessRisk } from '../utils/financialAnalysis';
import { dartApi } from '../services/dartApi';
// import { riskDatabase } from '../services/riskDatabase';
import { getCompanyInfoByName, getFinancialRatiosByTicker, CompanyInfo } from '../services/companyService';
import { chatgptApi } from '../services/chatgptApi';

export const useEnhancedChat = (companyInfo?: CompanyInfo | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '안녕하세요! 고도화된 부실기업 경고 시스템입니다. 🏢\n\n기업명을 입력하시면 데이터베이스에서 기업 코드를 찾고, 다트(DART)에서 최신 재무정보를 자동으로 불러와 분석해드립니다.\n\n또한 재무 관련 질문이나 다른 궁금한 점이 있으시면 언제든지 물어보세요!',
      timestamp: new Date(),
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState<ChatStep>('company-name');
  const [companyName, setCompanyName] = useState('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [currentCompanyInfo, setCurrentCompanyInfo] = useState<CompanyInfo | null>(companyInfo || null);
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

  // ChatGPT API를 통한 자유로운 대화 처리
  const handleGeneralChat = useCallback(async (userInput: string) => {
    addMessage({
      type: 'user',
      content: userInput,
    });

    setIsLoading(true);

    simulateTyping(async () => {
      try {
        // 재무 관련 키워드가 있는지 확인
        const financialKeywords = [
          '재무', '재무제표', '손익계산서', '재무상태표', '현금흐름표',
          '매출', '이익', '부채', '자산', '자본', '비율', '분석',
          '삼성', 'LG', 'SK', '현대', '기업', '주식', '투자'
        ];

        const isFinancialQuestion = financialKeywords.some(keyword => 
          userInput.includes(keyword)
        );

        // (1) 재무 데이터 요약 메시지 생성
        let financialSummary = '';
        if (companyData) {
          financialSummary += `\n\n[현재 기업: ${companyData.name}]`;
          financialSummary += `\n- 자산총계: ${companyData.totalAssets}`;
          financialSummary += `\n- 부채총계: ${companyData.totalLiabilities}`;
          financialSummary += `\n- 자기자본: ${companyData.equity}`;
          financialSummary += `\n- 유동자산: ${companyData.currentAssets}`;
          financialSummary += `\n- 유동부채: ${companyData.currentLiabilities}`;
          financialSummary += `\n- 매출: ${companyData.revenue}`;
          financialSummary += `\n- 순이익: ${companyData.netIncome}`;
          financialSummary += `\n- 영업현금흐름: ${companyData.operatingCashFlow}`;
        }
        // 가장 최근 메시지의 ratios를 찾아 요약
        const lastRatios = messages.slice().reverse().find(m => m.data && m.data.ratios)?.data?.ratios;
        if (lastRatios) {
          financialSummary += `\n[주요 재무비율]`;
          financialSummary += `\n- 부채비율: ${lastRatios.debt_ratio ?? 'N/A'}%`;
          financialSummary += `\n- 유동비율: ${lastRatios.current_ratio ?? 'N/A'}`;
          financialSummary += `\n- 자기자본비율: ${lastRatios.equity_ratio ?? 'N/A'}%`;
          financialSummary += `\n- ROA: ${lastRatios.ROA ?? 'N/A'}%`;
          financialSummary += `\n- ROE: ${lastRatios.ROE ?? 'N/A'}%`;
          financialSummary += `\n- 영업이익률: ${lastRatios.operating_margin_on_total_assets ?? 'N/A'}%`;
        }

        // (2) ChatGPT API 호출을 위한 메시지 배열 구성
        const chatMessages = [
          {
            role: 'system' as const,
            content: (isFinancialQuestion 
              ? chatgptApi.getFinancialAnalysisPrompt()
              : chatgptApi.getGeneralChatPrompt()
            ) + financialSummary // 시스템 프롬프트에 재무 요약 추가
          },
          ...messages
            .filter(msg => msg.type === 'user' || msg.type === 'bot')
            .slice(-10) // 최근 10개 메시지만 포함
            .map(msg => ({
              role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.content
            })),
          {
            role: 'user' as const,
            content: userInput
          }
        ];

        // ChatGPT API 호출
        const response = await chatgptApi.chat(chatMessages, {
          max_tokens: 800,
          temperature: 0.7,
        });

        // 봇 응답 추가
        addMessage({
          type: 'bot',
          content: response,
        });

      } catch (error) {
        console.error('ChatGPT API 오류:', error);
        addMessage({
          type: 'bot',
          content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, [messages, addMessage, simulateTyping, companyData]);

  const handleCompanyNameSubmit = useCallback(async (name: string) => {
    addMessage({
      type: 'user',
      content: name,
    });

    setCompanyName(name);
    setIsLoading(true);

    simulateTyping(async () => {
      try {
        // 1. 우선 DB에서 기업 정보 검색 (corp_code와 ticker 모두)
        addMessage({
          type: 'bot',
          content: `${name} 기업을 데이터베이스에서 검색 중입니다... 🔍`,
        });

        const companyInfo = await getCompanyInfoByName(name);
        
        if (!companyInfo) {
          // 2. DB에 없으면 일반 질문으로 처리
          addMessage({
            type: 'bot',
            content: `"${name}" 기업을 데이터베이스에서 찾을 수 없습니다.\n\n일반적인 질문으로 처리하겠습니다.`,
          });
          
          // ChatGPT로 일반 질문 처리
          await handleGeneralChat(name);
          return;
        }

        // 3. 기업 정보를 저장하고 재무제표 분석 단계로 이동
        setCurrentCompanyInfo(companyInfo);
        
        simulateTyping(async () => {
          addMessage({
            type: 'bot',
            content: `${name}의 최신 재무정보를 다트(DART)에서 불러오는 중입니다... 📊`,
          });

          // corp_code를 사용하여 DART API에서 재무제표 데이터 가져오기
          const financialData = await dartApi.getFinancialStatement(companyInfo.corp_code);
          
          if (!financialData) {
            addMessage({
              type: 'bot',
              content: `죄송합니다. "${name}" 기업의 재무정보를 불러올 수 없습니다.\n\n다른 기업명으로 다시 시도해주시거나, 재무 관련 질문을 자유롭게 해주세요.`,
            });
            setIsLoading(false);
            return;
          }

          const fullCompanyData: CompanyData = {
            name: name,
            ...financialData
          };

          setCompanyData(fullCompanyData);
          setCurrentStep('financial-data');

          simulateTyping(() => {
            addMessage({
              type: 'bot',
              content: `✅ ${name}의 재무정보를 성공적으로 불러왔습니다!\n\n아래에서 데이터를 확인하고 필요시 수정한 후 분석을 진행해주세요.`,
            });
            setIsLoading(false);
          }, 1000);
        }, 1500);
      } catch (error) {
        console.error('기업 정보 조회 오류:', error);
        addMessage({
          type: 'bot',
          content: `기업 정보를 불러오는 중 오류가 발생했습니다.\n\n일반적인 질문으로 처리하겠습니다.`,
        });
        
        // 오류 발생 시에도 ChatGPT로 처리
        await handleGeneralChat(name);
      }
    }, 1000);
  }, [addMessage, simulateTyping, handleGeneralChat]);

  const handleFinancialDataSubmit = useCallback(async (data: CompanyData) => {
    addMessage({
      type: 'user',
      content: `${data.name} 기업의 재무정보 분석을 시작합니다.`,
    });

    setCurrentStep('analysis');
    setIsLoading(true);

    simulateTyping(async () => {
      try {
        // 1. 저장된 ticker로 2024_ratio 테이블에서 재무비율 데이터 가져오기
        if (!currentCompanyInfo) {
          throw new Error('기업 정보가 없습니다.');
        }

        addMessage({
          type: 'bot',
          content: `${data.name}의 재무비율 데이터를 데이터베이스에서 조회 중입니다... 📊`,
        });

        const ratios = await getFinancialRatiosByTicker(currentCompanyInfo.ticker);
        
        if (!ratios) {
          addMessage({
            type: 'bot',
            content: `죄송합니다. "${data.name}" 기업의 재무비율 데이터를 찾을 수 없습니다.\n\n다른 기업명으로 다시 시도해주시거나, 재무 관련 질문을 자유롭게 해주세요.`,
          });
          setIsLoading(false);
          return;
        }

        // 2. 위험도 평가 (기존 로직 사용)
        const riskAssessment = assessRisk(ratios, data);
        
        // 3. 데이터베이스 저장 부분 제거 - 분석 결과만 표시

        addMessage({
          type: 'bot',
          content: '',
          data: {
            ratios,
            riskLevel: riskAssessment.level,
            riskScore: riskAssessment.score,
            companyData: data,
            companyInfo: currentCompanyInfo,
          },
        });

        setCurrentStep('complete');
        setIsLoading(false);
      } catch (error) {
        console.error('분석 오류:', error);
        addMessage({
          type: 'bot',
          content: `분석 중 오류가 발생했습니다: ${(error as Error).message}\n\n다시 시도해주세요.`,
        });
        setIsLoading(false);
      }
    }, 2000);
  }, [addMessage, simulateTyping, currentCompanyInfo]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: '안녕하세요! 재무제표를 파헤치는 수다쟁이 혜서입니다. 🏢\n\n기업명을 입력하시면 데이터베이스에서 기업 코드를 찾고, 다트(DART)에서 최신 재무정보를 자동으로 불러와 분석해드립니다.\n\n또한 재무 관련 질문이나 다른 궁금한 점이 있으시면 언제든지 물어보세요!',
        timestamp: new Date(),
      }
    ]);
    setCurrentStep('company-name');
    setCompanyName('');
    setCompanyData(null);
    setCurrentCompanyInfo(null);
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
    handleGeneralChat,
    resetChat,
  };
};