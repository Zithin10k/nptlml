/**
 * Question filtering utility to separate questions by assignment number
 * Provides functions to filter and organize questions based on assignment criteria
 */

/**
 * Filters questions by assignment number
 * @param {Array} questions - Array of all question objects
 * @param {string|number} assignmentNumber - Assignment number to filter by
 * @returns {Array} Array of questions for the specified assignment
 */
export function filterQuestionsByAssignment(questions, assignmentNumber) {
  if (!Array.isArray(questions)) {
    console.warn('Invalid questions array provided to filterQuestionsByAssignment');
    return [];
  }
  
  if (!assignmentNumber) {
    console.warn('No assignment number provided to filterQuestionsByAssignment');
    return [];
  }
  
  // Convert to string for consistent comparison
  const targetAssignment = String(assignmentNumber);
  
  const filteredQuestions = questions.filter(question => {
    return question.assignmentnumber === targetAssignment;
  });
  
  // Sort by question number for consistent ordering
  return filteredQuestions.sort((a, b) => {
    const aNum = parseInt(a.questionnumber) || 0;
    const bNum = parseInt(b.questionnumber) || 0;
    return aNum - bNum;
  });
}

/**
 * Groups all questions by assignment number
 * @param {Array} questions - Array of all question objects
 * @returns {Object} Object with assignment numbers as keys and question arrays as values
 */
export function groupQuestionsByAssignment(questions) {
  if (!Array.isArray(questions)) {
    console.warn('Invalid questions array provided to groupQuestionsByAssignment');
    return {};
  }
  
  const grouped = {};
  
  questions.forEach(question => {
    const assignmentNumber = question.assignmentnumber;
    
    if (!grouped[assignmentNumber]) {
      grouped[assignmentNumber] = [];
    }
    
    grouped[assignmentNumber].push(question);
  });
  
  // Sort questions within each assignment by question number
  Object.keys(grouped).forEach(assignmentNumber => {
    grouped[assignmentNumber].sort((a, b) => {
      const aNum = parseInt(a.questionnumber) || 0;
      const bNum = parseInt(b.questionnumber) || 0;
      return aNum - bNum;
    });
  });
  
  return grouped;
}

/**
 * Gets all available assignment numbers from questions
 * @param {Array} questions - Array of all question objects
 * @returns {Array<string>} Sorted array of unique assignment numbers
 */
export function getAvailableAssignments(questions) {
  if (!Array.isArray(questions)) {
    console.warn('Invalid questions array provided to getAvailableAssignments');
    return [];
  }
  
  const assignmentNumbers = [...new Set(questions.map(q => q.assignmentnumber))];
  
  // Sort numerically
  return assignmentNumbers.sort((a, b) => {
    const aNum = parseInt(a) || 0;
    const bNum = parseInt(b) || 0;
    return aNum - bNum;
  });
}

/**
 * Validates that an assignment number exists in the questions data
 * @param {Array} questions - Array of all question objects
 * @param {string|number} assignmentNumber - Assignment number to validate
 * @returns {boolean} True if assignment exists, false otherwise
 */
export function isValidAssignment(questions, assignmentNumber) {
  if (!Array.isArray(questions) || !assignmentNumber) {
    return false;
  }
  
  const targetAssignment = String(assignmentNumber);
  return questions.some(question => question.assignmentnumber === targetAssignment);
}

/**
 * Gets the count of questions for each assignment
 * @param {Array} questions - Array of all question objects
 * @returns {Object} Object with assignment numbers as keys and question counts as values
 */
export function getAssignmentQuestionCounts(questions) {
  if (!Array.isArray(questions)) {
    console.warn('Invalid questions array provided to getAssignmentQuestionCounts');
    return {};
  }
  
  const counts = {};
  
  questions.forEach(question => {
    const assignmentNumber = question.assignmentnumber;
    counts[assignmentNumber] = (counts[assignmentNumber] || 0) + 1;
  });
  
  return counts;
}

/**
 * Gets questions for multiple assignments
 * @param {Array} questions - Array of all question objects
 * @param {Array<string|number>} assignmentNumbers - Array of assignment numbers to filter by
 * @returns {Array} Array of questions from the specified assignments
 */
export function filterQuestionsByMultipleAssignments(questions, assignmentNumbers) {
  if (!Array.isArray(questions) || !Array.isArray(assignmentNumbers)) {
    console.warn('Invalid parameters provided to filterQuestionsByMultipleAssignments');
    return [];
  }
  
  const targetAssignments = assignmentNumbers.map(num => String(num));
  
  const filteredQuestions = questions.filter(question => {
    return targetAssignments.includes(question.assignmentnumber);
  });
  
  // Sort by assignment number first, then by question number
  return filteredQuestions.sort((a, b) => {
    const aAssignment = parseInt(a.assignmentnumber) || 0;
    const bAssignment = parseInt(b.assignmentnumber) || 0;
    
    if (aAssignment !== bAssignment) {
      return aAssignment - bAssignment;
    }
    
    const aQuestion = parseInt(a.questionnumber) || 0;
    const bQuestion = parseInt(b.questionnumber) || 0;
    return aQuestion - bQuestion;
  });
}