/**
 * Answer validation logic for user selections
 */

import { getCorrectOptions, isMultipleChoice } from './scoringUtils.js';

/**
 * Validates if selected options are in correct format
 * @param {Array} selectedOptions - Array of selected option numbers
 * @param {Object} question - Question object
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateSelectedOptions(selectedOptions, question) {
  const errors = [];
  
  // Check if selectedOptions is an array
  if (!Array.isArray(selectedOptions)) {
    errors.push('Selected options must be an array');
    return { isValid: false, errors };
  }

  // Check if any options are selected
  if (selectedOptions.length === 0) {
    errors.push('At least one option must be selected');
    return { isValid: false, errors };
  }

  // Get valid option numbers from the question
  const validOptions = question.options.map(opt => opt.optionnumber);
  
  // Check if all selected options are valid
  const invalidOptions = selectedOptions.filter(opt => !validOptions.includes(opt));
  if (invalidOptions.length > 0) {
    errors.push(`Invalid option(s): ${invalidOptions.join(', ')}`);
  }

  // For single-choice questions, ensure only one option is selected
  if (!isMultipleChoice(question) && selectedOptions.length > 1) {
    errors.push('Only one option can be selected for single-choice questions');
  }

  // Check for duplicate selections
  const uniqueOptions = [...new Set(selectedOptions)];
  if (uniqueOptions.length !== selectedOptions.length) {
    errors.push('Duplicate options selected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates if a quiz can be submitted
 * @param {Array} userAnswers - Array of user answer objects
 * @param {Array} questions - Array of question objects
 * @param {string} mode - Quiz mode
 * @returns {Object} - Validation result with canSubmit and issues
 */
export function validateQuizSubmission(userAnswers, questions, mode) {
  const issues = [];
  let unansweredCount = 0;

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    
    if (!userAnswer || !userAnswer.selectedOptions || userAnswer.selectedOptions.length === 0) {
      unansweredCount++;
    } else {
      const validation = validateSelectedOptions(userAnswer.selectedOptions, question);
      if (!validation.isValid) {
        issues.push(`Question ${index + 1}: ${validation.errors.join(', ')}`);
      }
    }
  });

  // In test modes, warn about unanswered questions
  if (mode.startsWith('test') && unansweredCount > 0) {
    issues.push(`${unansweredCount} question(s) left unanswered`);
  }

  return {
    canSubmit: issues.length === 0 || mode === 'learn', // Learn mode is more lenient
    issues,
    unansweredCount,
    hasValidationErrors: issues.some(issue => !issue.includes('unanswered'))
  };
}

/**
 * Sanitizes user input for option selection
 * @param {any} input - Raw input from user
 * @param {Object} question - Question object
 * @returns {Array} - Sanitized array of option numbers
 */
export function sanitizeOptionSelection(input, question) {
  // Convert to array if not already
  let options = Array.isArray(input) ? input : [input];
  
  // Filter out null, undefined, empty strings
  options = options.filter(opt => opt != null && opt !== '');
  
  // Convert to strings and trim
  options = options.map(opt => String(opt).trim());
  
  // Get valid option numbers
  const validOptions = question.options.map(opt => opt.optionnumber);
  
  // Filter to only valid options
  options = options.filter(opt => validOptions.includes(opt));
  
  // Remove duplicates
  options = [...new Set(options)];
  
  // For single-choice questions, take only the first option
  if (!isMultipleChoice(question) && options.length > 1) {
    options = [options[0]];
  }
  
  return options;
}

/**
 * Checks if an answer selection is complete for the current mode
 * @param {Array} selectedOptions - Selected option numbers
 * @param {Object} question - Question object
 * @param {string} mode - Quiz mode
 * @returns {boolean} - True if selection is complete
 */
export function isAnswerComplete(selectedOptions, question, mode) {
  // In learn mode, answers are optional
  if (mode === 'learn') {
    return true;
  }
  
  // In test modes, at least one option must be selected
  if (!selectedOptions || !Array.isArray(selectedOptions)) {
    return false;
  }
  
  return selectedOptions.length > 0;
}

/**
 * Gets feedback message for answer validation
 * @param {Array} selectedOptions - Selected option numbers
 * @param {Object} question - Question object
 * @param {string} mode - Quiz mode
 * @returns {string} - Feedback message
 */
export function getAnswerFeedback(selectedOptions, question, mode) {
  // In learn mode, be permissive
  if (mode === 'learn') {
    return 'Answer recorded. You can change your selection anytime.';
  }
  
  // Check if answer is complete first for test modes
  if (!isAnswerComplete(selectedOptions, question, mode)) {
    return 'Please select an answer before proceeding.';
  }
  
  const validation = validateSelectedOptions(selectedOptions, question);
  
  if (!validation.isValid) {
    return validation.errors.join('. ');
  }
  
  return 'Answer recorded.';
}