import { useEffect, useRef, useState } from 'react';
import { trackEngagement, trackUserBehavior } from '../utils/analytics';

export const useEngagementTracking = () => {
  const [startTime] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 활동 감지
  const updateActivity = () => {
    setLastActivity(Date.now());
    if (!isActive) {
      setIsActive(true);
      trackUserBehavior('resume', 'engagement', 'user_returned');
    }
  };

  // 비활성 상태 감지 (5분)
  const handleInactivity = () => {
    if (isActive) {
      setIsActive(false);
      const sessionDuration = Date.now() - startTime;
      trackEngagement('session_duration', sessionDuration);
      trackUserBehavior('pause', 'engagement', 'user_inactive');
    }
  };

  useEffect(() => {
    // 활동 이벤트 리스너
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // 30초마다 체류 시간 추적
    intervalRef.current = setInterval(() => {
      if (isActive) {
        const currentTime = Date.now();
        const timeOnPage = currentTime - startTime;
        const timeSinceLastActivity = currentTime - lastActivity;
        
        // 5분 이상 비활성 상태면 일시정지
        if (timeSinceLastActivity > 5 * 60 * 1000) {
          handleInactivity();
        } else {
          // 활성 상태일 때만 체류 시간 추적
          trackEngagement('active_time', timeOnPage);
        }
      }
    }, 30000); // 30초마다

    // 페이지 언로드 시 최종 체류 시간 추적
    const handleBeforeUnload = () => {
      const totalTime = Date.now() - startTime;
      trackEngagement('total_session_time', totalTime);
      trackUserBehavior('leave', 'engagement', 'page_exit');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 초기 방문 추적
    trackUserBehavior('enter', 'engagement', 'page_entry');

    return () => {
      // 이벤트 리스너 정리
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [startTime, isActive, lastActivity]);

  // 특정 요소에 대한 체류 시간 추적
  const trackElementEngagement = (elementName: string, duration: number) => {
    trackEngagement(`${elementName}_time`, duration);
  };

  // 스크롤 깊이 추적
  const trackScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (scrollPercent > 25) trackUserBehavior('scroll', 'engagement', '25_percent');
    if (scrollPercent > 50) trackUserBehavior('scroll', 'engagement', '50_percent');
    if (scrollPercent > 75) trackUserBehavior('scroll', 'engagement', '75_percent');
    if (scrollPercent > 90) trackUserBehavior('scroll', 'engagement', '90_percent');
  };

  return {
    isActive,
    trackElementEngagement,
    trackScrollDepth,
  };
}; 