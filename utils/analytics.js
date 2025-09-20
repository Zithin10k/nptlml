// Google Analytics utility functions
export const GA_TRACKING_ID = 'G-MXE11CT2QV';

// Track page views
export const trackPageView = (url, userName = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
      custom_map: {
        custom_parameter_1: 'user_name'
      }
    });

    // Track page view with user name if available
    window.gtag('event', 'page_view', {
      page_location: url,
      user_name: userName || 'anonymous',
      event_category: 'navigation'
    });
  }
};

// Track assignment attempts
export const trackAssignmentAttempt = (assignmentId, assignmentName, userName, mode) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'assignment_attempt', {
      event_category: 'quiz',
      event_label: assignmentName,
      assignment_id: assignmentId,
      user_name: userName || 'anonymous',
      quiz_mode: mode,
      value: 1
    });
  }
};

// Track assignment completion
export const trackAssignmentCompletion = (assignmentId, assignmentName, userName, mode, score, totalQuestions) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'assignment_completion', {
      event_category: 'quiz',
      event_label: assignmentName,
      assignment_id: assignmentId,
      user_name: userName || 'anonymous',
      quiz_mode: mode,
      score: score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      value: score
    });
  }
};

// Track question answers
export const trackQuestionAnswer = (questionId, isCorrect, userName, assignmentId, questionNumber) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'question_answer', {
      event_category: 'quiz_interaction',
      event_label: `Question ${questionNumber}`,
      question_id: questionId,
      user_name: userName || 'anonymous',
      assignment_id: assignmentId,
      is_correct: isCorrect,
      question_number: questionNumber,
      value: isCorrect ? 1 : 0
    });
  }
};

// Track mode selection
export const trackModeSelection = (assignmentId, assignmentName, mode, userName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'mode_selection', {
      event_category: 'user_interaction',
      event_label: `${assignmentName} - ${mode}`,
      assignment_id: assignmentId,
      quiz_mode: mode,
      user_name: userName || 'anonymous',
      value: 1
    });
  }
};

// Track name changes
export const trackNameChange = (oldName, newName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'name_change', {
      event_category: 'user_interaction',
      event_label: 'User changed name',
      old_name: oldName || 'anonymous',
      new_name: newName,
      value: 1
    });
  }
};

// Track mega test attempts
export const trackMegaTestAttempt = (userName, mode) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'mega_test_attempt', {
      event_category: 'quiz',
      event_label: 'Mega Test',
      user_name: userName || 'anonymous',
      quiz_mode: mode,
      value: 1
    });
  }
};

// Track user engagement time
export const trackEngagementTime = (assignmentId, timeSpent, userName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'engagement_time', {
      event_category: 'user_behavior',
      event_label: 'Time spent on assignment',
      assignment_id: assignmentId,
      user_name: userName || 'anonymous',
      time_spent_seconds: timeSpent,
      value: timeSpent
    });
  }
};

// Track errors
export const trackError = (errorType, errorMessage, userName, context) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'error_occurred', {
      event_category: 'error',
      event_label: errorType,
      error_message: errorMessage,
      user_name: userName || 'anonymous',
      context: context,
      value: 1
    });
  }
};