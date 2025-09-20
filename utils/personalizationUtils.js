/**
 * Personalization utility functions
 * Handles personalized messages and greetings throughout the application
 */

import { getUserName } from './storageUtils';

/**
 * Gets a personalized greeting based on time of day and user name
 * @param {string} customName - Optional custom name to use instead of stored name
 * @returns {string} Personalized greeting message
 */
export function getPersonalizedGreeting(customName = null) {
  const userName = customName || getUserName();
  
  if (!userName) {
    return 'Welcome to ML Quiz App!';
  }
  
  const hour = new Date().getHours();
  let timeGreeting = 'Hello';
  
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }
  
  return `${timeGreeting}, ${userName}!`;
}

/**
 * Gets a personalized completion message for quiz results
 * @param {number} score - Quiz score percentage
 * @param {string} customName - Optional custom name to use instead of stored name
 * @returns {string} Personalized completion message
 */
export function getPersonalizedCompletionMessage(score, customName = null) {
  const userName = customName || getUserName();
  const namePrefix = userName ? `${userName}, ` : '';
  
  if (score >= 90) {
    return `Excellent work, ${namePrefix}you're mastering these ML concepts!`;
  } else if (score >= 80) {
    return `Great job, ${namePrefix}you're doing really well!`;
  } else if (score >= 70) {
    return `Good effort, ${namePrefix}keep practicing to improve!`;
  } else if (score >= 60) {
    return `Nice try, ${namePrefix}review the material and try again!`;
  } else {
    return `Keep studying, ${namePrefix}you'll get there with more practice!`;
  }
}

/**
 * Gets a personalized encouragement message during quiz
 * @param {number} currentQuestion - Current question number (1-based)
 * @param {number} totalQuestions - Total number of questions
 * @param {string} customName - Optional custom name to use instead of stored name
 * @returns {string} Personalized encouragement message
 */
export function getPersonalizedEncouragement(currentQuestion, totalQuestions, customName = null) {
  const userName = customName || getUserName();
  const namePrefix = userName ? `${userName}, ` : '';
  const progress = (currentQuestion / totalQuestions) * 100;
  
  if (progress >= 75) {
    return `Almost there, ${namePrefix}you're doing great!`;
  } else if (progress >= 50) {
    return `Halfway done, ${namePrefix}keep it up!`;
  } else if (progress >= 25) {
    return `Good progress, ${namePrefix}stay focused!`;
  } else {
    return `You've got this, ${namePrefix}take your time!`;
  }
}

/**
 * Gets a personalized welcome message for assignment selection
 * @param {number} assignmentNumber - Assignment number (1-7)
 * @param {string} customName - Optional custom name to use instead of stored name
 * @returns {string} Personalized welcome message
 */
export function getPersonalizedAssignmentWelcome(assignmentNumber, customName = null) {
  const userName = customName || getUserName();
  const namePrefix = userName ? `${userName}, ` : '';
  
  return `Ready for Assignment ${assignmentNumber}, ${namePrefix}let's test your ML knowledge!`;
}

/**
 * Gets a personalized mode selection message
 * @param {string} mode - Selected mode ('learn', 'test-easy', 'test-difficult')
 * @param {string} customName - Optional custom name to use instead of stored name
 * @returns {string} Personalized mode message
 */
export function getPersonalizedModeMessage(mode, customName = null) {
  const userName = customName || getUserName();
  const namePrefix = userName ? `${userName}, ` : '';
  
  switch (mode) {
    case 'learn':
      return `Perfect choice, ${namePrefix}learn mode will help you understand the concepts!`;
    case 'test-easy':
      return `Good luck, ${namePrefix}test your knowledge with the original question order!`;
    case 'test-difficult':
      return `Challenge accepted, ${namePrefix}this shuffled mode will really test your understanding!`;
    default:
      return `Let's get started, ${namePrefix}choose your learning approach!`;
  }
}

/**
 * Gets a personalized retry message
 * @param {string} customName - Optional custom name to use instead of stored name
 * @returns {string} Personalized retry message
 */
export function getPersonalizedRetryMessage(customName = null) {
  const userName = customName || getUserName();
  const namePrefix = userName ? `${userName}, ` : '';
  
  const messages = [
    `Ready for another round, ${namePrefix}?`,
    `Want to try again, ${namePrefix}?`,
    `Let's give it another shot, ${namePrefix}!`,
    `Ready to improve your score, ${namePrefix}?`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Formats a user name for display (capitalizes first letter of each word)
 * @param {string} name - Raw user name
 * @returns {string} Formatted name
 */
export function formatUserName(name) {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Checks if personalization is available (user name exists)
 * @returns {boolean} True if personalization is available
 */
export function isPersonalizationAvailable() {
  return getUserName() !== null;
}