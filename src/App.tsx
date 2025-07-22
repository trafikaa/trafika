import React, { useState, useEffect } from 'react';
import { Bot, TrendingDown, RefreshCw, Database } from 'lucide-react';
import EnhancedChatMessage from './components/EnhancedChatMessage';
import UnifiedFinancialForm from './components/UnifiedFinancialForm';
import TypingIndicator from './components/TypingIndicator';
import SplashScreen from './components/SplashScreen';
import { useEnhancedChat } from './hooks/useEnhancedChat';
import { CompanyInfo } from './types';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [currentCompanyInfo, setCurrentCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // 훅은 항상 최상단에서 호출!
  const {
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
  } = useEnhancedChat(currentCompanyInfo);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isLoading) {
      if (currentStep === 'company-name') {
        handleCompanyNameSubmit(userInput.trim());
      } else {
        handleGeneralChat(userInput.trim());
      }
      setUserInput('');
    }
  };

  if (showSplash) return <SplashScreen />;
  return (
    <div className="min-h-screen bg-sky-500">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo2.png" alt="혜서 로고" className="h-12 w-auto object-contain" />
              <h1 className="text-lg font-bold text-gray-800">재무제표를 파헤치는 수다쟁이 회계봇</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Database className="w-4 h-4" />
                <span>Supabase DB</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <button
                  onClick={resetChat}
                  disabled={isLoading}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="새로운 분석 시작"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg min-h-[700px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <EnhancedChatMessage key={message.id} message={message} />
              ))}
              {(isTyping || isLoading) && <TypingIndicator />}
            </div>
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 p-4">
            {currentStep === 'company-name' && (
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="기업명을 입력하거나 궁금한 질문을 해주세요 (예: 삼성전자, 재무제표란?, 투자 조언)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isLoading ? '처리 중...' : '전송'}
                </button>
              </form>
            )}

            {currentStep === 'financial-data' && (
              <div className="flex justify-center">
                <UnifiedFinancialForm 
                  onSubmit={handleFinancialDataSubmit}
                  onCompanyInfoChange={setCurrentCompanyInfo}
                  companyName={companyName}
                  initialData={companyData}
                />
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="space-y-4">
                <div className="text-center">
                  <button
                    onClick={resetChat}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                  >
                    새로운 기업 분석하기
                  </button>
                </div>
                
                {/* 추가 질문 입력 필드 */}
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="추가 질문이 있으시면 언제든지 물어보세요!"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || isLoading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '처리 중...' : '질문'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-6 text-center">
          <div className="bg-black rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center justify-center gap-6 text-sm text-white">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>DART API 연동</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>실시간 분석</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>ChatGPT 연동</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Supabase DB</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-white">
            ⚠️ 본 시스템은 참고용으로만 사용하시고, 투자 결정 시 전문가와 상담하시기 바랍니다.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;