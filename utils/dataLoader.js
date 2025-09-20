/**
 * Data loading utility to read and parse questions from public/data.json
 * Handles loading, parsing, and comprehensive validation of question data
 * Includes caching for improved performance
 */

import { logError } from './errorUtils';

// Cache for loaded questions data
let questionsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom error class for data loading errors
 */
export class DataLoadError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = 'DataLoadError';
    this.cause = cause;
  }
}

/**
 * Custom error class for data validation errors
 */
export class DataValidationError extends Error {
  constructor(message, invalidData = null) {
    super(message);
    this.name = 'DataValidationError';
    this.invalidData = invalidData;
  }
}

/**
 * Loads and parses question data from the public/data.json file
 * Uses caching to improve performance on subsequent loads
 * @returns {Promise<Array>} Array of validated question objects
 * @throws {DataLoadError} If data loading fails
 * @throws {DataValidationError} If data validation fails
 */
export async function loadQuestions() {
  // Check cache first
  const now = Date.now();
  if (questionsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return questionsCache;
  }

  try {
    // Attempt to fetch the data file
    const response = await fetch('/data.json');
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new DataLoadError(
          'Question data file not found. Please ensure data.json exists in the public folder.',
          new Error(`HTTP ${response.status}`)
        );
      } else if (response.status >= 500) {
        throw new DataLoadError(
          'Server error while loading questions. Please try again later.',
          new Error(`HTTP ${response.status}: ${response.statusText}`)
        );
      } else {
        throw new DataLoadError(
          `Failed to load questions: ${response.status} ${response.statusText}`,
          new Error(`HTTP ${response.status}`)
        );
      }
    }

    // Parse JSON data
    let questions;
    try {
      questions = await response.json();
    } catch (parseError) {
      throw new DataLoadError(
        'Invalid JSON format in question data file. Please check the data.json file format.',
        parseError
      );
    }
    
    // Validate that we received an array
    if (!Array.isArray(questions)) {
      throw new DataValidationError(
        'Invalid data format: expected array of questions',
        { receivedType: typeof questions, data: questions }
      );
    }

    if (questions.length === 0) {
      throw new DataValidationError('Question data file is empty');
    }
    
    // Comprehensive validation of question structure
    const validationResult = validateQuestionsData(questions);
    
    if (validationResult.validQuestions.length === 0) {
      throw new DataValidationError(
        'No valid questions found in data file',
        { 
          totalQuestions: questions.length,
          invalidQuestions: validationResult.invalidQuestions,
          errors: validationResult.errors
        }
      );
    }

    // Log validation warnings if some questions were invalid
    if (validationResult.invalidQuestions.length > 0) {
      console.warn(`Data validation: ${validationResult.invalidQuestions.length} invalid questions were filtered out:`, {
        invalidCount: validationResult.invalidQuestions.length,
        validCount: validationResult.validQuestions.length,
        errors: validationResult.errors
      });
    }
    
    // Cache the validated questions
    questionsCache = validationResult.validQuestions;
    cacheTimestamp = now;
    
    return validationResult.validQuestions;
  } catch (error) {
    // Re-throw custom errors as-is
    if (error instanceof DataLoadError || error instanceof DataValidationError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new DataLoadError(
        'Network error: Unable to load questions. Please check your internet connection.',
        error
      );
    }
    
    // Handle other unexpected errors
    logError(error, { context: 'loadQuestions', type: 'unexpected' });
    throw new DataLoadError(
      'An unexpected error occurred while loading questions. Please try again.',
      error
    );
  }
}

/**
 * Validates an array of questions and returns detailed validation results
 * @param {Array} questions - Array of question objects to validate
 * @returns {Object} Validation result with valid questions, invalid questions, and errors
 */
function validateQuestionsData(questions) {
  const validQuestions = [];
  const invalidQuestions = [];
  const errors = [];

  questions.forEach((question, index) => {
    const validationResult = validateQuestion(question, index);
    
    if (validationResult.isValid) {
      validQuestions.push(question);
    } else {
      invalidQuestions.push({
        index,
        question,
        errors: validationResult.errors
      });
      errors.push(...validationResult.errors.map(error => `Question ${index + 1}: ${error}`));
    }
  });

  return {
    validQuestions,
    invalidQuestions,
    errors
  };
}

/**
 * Validates the structure of a single question object
 * @param {Object} question - Question object to validate
 * @param {number} index - Index of the question in the array (for error reporting)
 * @returns {Object} Validation result with isValid flag and error messages
 */
function validateQuestion(question, index = 0) {
  const errors = [];

  // Check if question is an object
  if (!question || typeof question !== 'object') {
    errors.push('Question must be an object');
    return { isValid: false, errors };
  }

  // Check required string fields
  const requiredStringFields = ['assignmentnumber', 'questionnumber', 'question'];
  requiredStringFields.forEach(field => {
    if (!question[field] || typeof question[field] !== 'string' || question[field].trim() === '') {
      errors.push(`Missing or invalid ${field} field`);
    }
  });

  // Validate assignment number format
  if (question.assignmentnumber) {
    const assignmentNum = parseInt(question.assignmentnumber);
    if (isNaN(assignmentNum) || assignmentNum < 1 || assignmentNum > 7) {
      errors.push('Assignment number must be between 1 and 7');
    }
  }

  // Check image field (optional but must be string if present)
  if (question.image !== undefined && typeof question.image !== 'string') {
    errors.push('Image field must be a string');
  }

  // Check options array
  if (!Array.isArray(question.options)) {
    errors.push('Options must be an array');
    return { isValid: false, errors };
  }

  if (question.options.length === 0) {
    errors.push('Question must have at least one option');
    return { isValid: false, errors };
  }

  if (question.options.length > 10) {
    errors.push('Question cannot have more than 10 options');
  }

  // Validate each option
  const optionNumbers = new Set();
  let hasCorrectAnswer = false;

  question.options.forEach((option, optionIndex) => {
    if (!option || typeof option !== 'object') {
      errors.push(`Option ${optionIndex + 1} must be an object`);
      return;
    }

    // Check required option fields
    if (!option.optionnumber || typeof option.optionnumber !== 'string' || option.optionnumber.trim() === '') {
      errors.push(`Option ${optionIndex + 1} missing or invalid optionnumber`);
    } else {
      // Check for duplicate option numbers
      if (optionNumbers.has(option.optionnumber)) {
        errors.push(`Duplicate option number: ${option.optionnumber}`);
      }
      optionNumbers.add(option.optionnumber);
    }

    if (!option.optiontext || typeof option.optiontext !== 'string' || option.optiontext.trim() === '') {
      errors.push(`Option ${optionIndex + 1} missing or invalid optiontext`);
    }

    if (typeof option.iscorrect !== 'boolean') {
      errors.push(`Option ${optionIndex + 1} iscorrect must be a boolean`);
    } else if (option.iscorrect === true) {
      hasCorrectAnswer = true;
    }
  });

  // Ensure at least one correct answer exists
  if (!hasCorrectAnswer) {
    errors.push('Question must have at least one correct answer');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gets all unique assignment numbers from the questions data
 * @param {Array} questions - Array of question objects
 * @returns {Array<string>} Sorted array of unique assignment numbers
 */
export function getAssignmentNumbers(questions) {
  const assignmentNumbers = [...new Set(questions.map(q => q.assignmentnumber))];
  return assignmentNumbers.sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Gets the total count of questions for a specific assignment
 * @param {Array} questions - Array of question objects
 * @param {string} assignmentNumber - Assignment number to count
 * @returns {number} Number of questions for the assignment
 */
export function getQuestionCount(questions, assignmentNumber) {
  return questions.filter(q => q.assignmentnumber === assignmentNumber).length;
}

/**
 * Clears the questions cache (useful for testing or forced refresh)
 */
export function clearQuestionsCache() {
  questionsCache = null;
  cacheTimestamp = null;
}