// GA4 고급 분석 유틸리티

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    gtm: (...args: any[]) => void;
  }
}

// GTM/GA4 이벤트 추적 함수
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // GTM dataLayer에 이벤트 푸시
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...parameters
      });
    }
    
    // 기존 gtag 함수도 지원 (하위 호환성)
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  }
};

// 페이지 뷰 추적
export const trackPageView = (pageTitle: string, pageLocation?: string) => {
  trackEvent('page_view', {
    page_title: pageTitle,
    page_location: pageLocation || window.location.pathname,
  });
};

// 사용자 세그먼트 추적
export const trackUserSegment = (segment: string, value?: any) => {
  trackEvent('user_segment', {
    segment_name: segment,
    segment_value: value,
    user_type: getCurrentUserType(),
  });
};

// 전환 목표 추적
export const trackConversion = (goalName: string, value?: number) => {
  trackEvent('conversion', {
    goal_name: goalName,
    goal_value: value,
    user_type: getCurrentUserType(),
  });
};

// 챗봇 대화 추적
export const trackChatEvent = (eventType: 'start' | 'message' | 'complete' | 'abandon', data?: any) => {
  trackEvent('chat_interaction', {
    event_type: eventType,
    chat_session_id: getChatSessionId(),
    user_type: getCurrentUserType(),
    ...data,
  });
};

// 재무 분석 추적
export const trackFinancialAnalysis = (analysisType: string, companyName?: string, data?: any) => {
  trackEvent('financial_analysis', {
    analysis_type: analysisType,
    company_name: companyName,
    user_type: getCurrentUserType(),
    ...data,
  });
};

// 사용자 행동 추적
export const trackUserBehavior = (action: string, category: string, label?: string, value?: number) => {
  trackEvent('user_behavior', {
    action: action,
    category: category,
    label: label,
    value: value,
    user_type: getCurrentUserType(),
  });
};

// 체류 시간 추적
export const trackEngagement = (metric: string, value: number) => {
  trackEvent('engagement', {
    metric: metric,
    value: value,
    user_type: getCurrentUserType(),
  });
};

// 사용자 타입 분류
const getCurrentUserType = (): string => {
  const sessionCount = sessionStorage.getItem('session_count') || '0';
  const visitCount = localStorage.getItem('visit_count') || '0';
  
  if (parseInt(visitCount) === 1) return 'new_user';
  if (parseInt(sessionCount) === 1) return 'returning_user';
  return 'loyal_user';
};

// 챗봇 세션 ID 생성
const getChatSessionId = (): string => {
  let sessionId = sessionStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

// 사용자 방문 카운트 업데이트
export const updateVisitCount = () => {
  const currentCount = parseInt(localStorage.getItem('visit_count') || '0');
  localStorage.setItem('visit_count', (currentCount + 1).toString());
  
  const sessionCount = parseInt(sessionStorage.getItem('session_count') || '0');
  sessionStorage.setItem('session_count', (sessionCount + 1).toString());
};

// 전환 목표 설정
export const CONVERSION_GOALS = {
  CHAT_START: 'chat_start',
  CHAT_COMPLETE: 'chat_complete',
  FINANCIAL_ANALYSIS: 'financial_analysis',
  COMPANY_SEARCH: 'company_search',
  PAGE_ENGAGEMENT: 'page_engagement',
} as const;

// 사용자 세그먼트 정의
export const USER_SEGMENTS = {
  NEW_USER: 'new_user',
  RETURNING_USER: 'returning_user',
  LOYAL_USER: 'loyal_user',
  MOBILE_USER: 'mobile_user',
  DESKTOP_USER: 'desktop_user',
  FINANCIAL_INTERESTED: 'financial_interested',
  CHAT_ACTIVE: 'chat_active',
} as const; 