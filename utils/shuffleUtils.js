/**
 * Utility functions for shuffling questions and options in test-difficult mode
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffles questions for test-difficult mode
 * @param {Array} questions - Array of question objects
 * @returns {Array} - New array with shuffled questions
 */
export function shuffleQuestions(questions) {
  return shuffleArray(questions);
}

/**
 * Shuffles options within a single question
 * @param {Object} question - Question object with options array
 * @returns {Object} - New question object with shuffled options
 */
export function shuffleQuestionOptions(question) {
  return {
    ...question,
    options: shuffleArray(question.options)
  };
}

/**
 * Prepares questions based on the selected mode
 * @param {Array} questions - Array of question objects
 * @param {string} mode - Quiz mode ('learn', 'test-easy', 'test-difficult')
 * @returns {Array} - Processed questions array
 */
export function prepareQuestionsForMode(questions, mode) {
  let processedQuestions = [...questions];
  
  if (mode === 'test-difficult') {
    // Shuffle question order
    processedQuestions = shuffleQuestions(processedQuestions);
    
    // Shuffle options within each question
    processedQuestions = processedQuestions.map(shuffleQuestionOptions);
  }
  
  return processedQuestions;
}