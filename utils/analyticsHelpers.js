// Analytics helper functions for debugging and monitoring
export const logAnalyticsEvent = (eventName, parameters) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, parameters);
  }
};

// Enhanced tracking functions that also log in development
export const trackWithLogging = (trackingFunction, eventName) => {
  return (...args) => {
    if (process.env.NODE_ENV === 'development') {
      logAnalyticsEvent(eventName, args);
    }
    return trackingFunction(...args);
  };
};

// Analytics event types for reference
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  ASSIGNMENT_ATTEMPT: 'assignment_attempt',
  ASSIGNMENT_COMPLETION: 'assignment_completion',
  QUESTION_ANSWER: 'question_answer',
  MODE_SELECTION: 'mode_selection',
  NAME_CHANGE: 'name_change',
  MEGA_TEST_ATTEMPT: 'mega_test_attempt',
  ENGAGEMENT_TIME: 'engagement_time',
  ERROR_OCCURRED: 'error_occurred'
};

// Custom dimensions for better analytics organization
export const CUSTOM_DIMENSIONS = {
  USER_NAME: 'user_name',
  ASSIGNMENT_ID: 'assignment_id',
  QUIZ_MODE: 'quiz_mode',
  QUESTION_NUMBER: 'question_number',
  IS_CORRECT: 'is_correct',
  SCORE: 'score',
  PERCENTAGE: 'percentage',
  TIME_SPENT: 'time_spent_seconds'
};

// Analytics debugging helper
export const debugAnalytics = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ Google Analytics is loaded and ready');
    console.log('📊 Available gtag function:', typeof window.gtag);
    console.log('🔧 DataLayer:', window.dataLayer?.length || 0, 'events');
  } else {
    console.log('❌ Google Analytics not loaded');
  }
};