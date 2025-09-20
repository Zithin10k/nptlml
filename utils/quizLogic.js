/**
 * Quiz state management and logic utilities
 */

/**
 * Creates initial quiz state
 * @param {Array} questions - Array of question objects
 * @param {string} assignment - Assignment number
 * @param {string} mode - Quiz mode
 * @returns {Object} - Initial quiz state
 */
export function createInitialQuizState(questions, assignment, mode) {
  return {
    assignment,
    mode,
    questions,
    currentQuestionIndex: 0,
    userAnswers: new Array(questions.length).fill(null),
    startTime: new Date(),
    endTime: null,
    isComplete: false,
    showFeedback: mode === 'learn' // In learn mode, show feedback immediately
  };
}

/**
 * Updates quiz state when user selects an answer
 * @param {Object} quizState - Current quiz state
 * @param {number} questionIndex - Index of the question being answered
 * @param {Array} selectedOptions - Array of selected option numbers
 * @returns {Object} - Updated quiz state
 */
export function updateQuizStateWithAnswer(quizState, questionIndex, selectedOptions) {
  const newUserAnswers = [...quizState.userAnswers];
  newUserAnswers[questionIndex] = {
    selectedOptions: [...selectedOptions],
    timestamp: new Date()
  };

  return {
    ...quizState,
    userAnswers: newUserAnswers
  };
}

/**
 * Navigates to the next question
 * @param {Object} quizState - Current quiz state
 * @returns {Object} - Updated quiz state
 */
export function navigateToNextQuestion(quizState) {
  const nextIndex = quizState.currentQuestionIndex + 1;
  const isComplete = nextIndex >= quizState.questions.length;

  return {
    ...quizState,
    currentQuestionIndex: nextIndex,
    isComplete,
    endTime: isComplete ? new Date() : quizState.endTime,
    showFeedback: quizState.mode === 'learn' // Reset feedback for learn mode
  };
}

/**
 * Navigates to the previous question
 * @param {Object} quizState - Current quiz state
 * @returns {Object} - Updated quiz state
 */
export function navigateToPreviousQuestion(quizState) {
  const prevIndex = Math.max(0, quizState.currentQuestionIndex - 1);

  return {
    ...quizState,
    currentQuestionIndex: prevIndex,
    showFeedback: quizState.mode === 'learn'
  };
}

/**
 * Shows feedback for the current question (test modes)
 * @param {Object} quizState - Current quiz state
 * @returns {Object} - Updated quiz state with feedback shown
 */
export function showQuestionFeedback(quizState) {
  return {
    ...quizState,
    showFeedback: true
  };
}

/**
 * Checks if the current question has been answered
 * @param {Object} quizState - Current quiz state
 * @returns {boolean} - True if current question is answered
 */
export function isCurrentQuestionAnswered(quizState) {
  const currentAnswer = quizState.userAnswers[quizState.currentQuestionIndex];
  return currentAnswer && currentAnswer.selectedOptions.length > 0;
}

/**
 * Gets the current question object
 * @param {Object} quizState - Current quiz state
 * @returns {Object|null} - Current question object or null if complete
 */
export function getCurrentQuestion(quizState) {
  if (quizState.isComplete || quizState.currentQuestionIndex >= quizState.questions.length) {
    return null;
  }
  return quizState.questions[quizState.currentQuestionIndex];
}

/**
 * Gets the user's answer for the current question
 * @param {Object} quizState - Current quiz state
 * @returns {Array} - Array of selected option numbers
 */
export function getCurrentQuestionAnswer(quizState) {
  const currentAnswer = quizState.userAnswers[quizState.currentQuestionIndex];
  return currentAnswer ? currentAnswer.selectedOptions : [];
}

/**
 * Calculates total time elapsed in the quiz
 * @param {Object} quizState - Current quiz state
 * @returns {number} - Time elapsed in seconds
 */
export function calculateTimeElapsed(quizState) {
  const endTime = quizState.endTime || new Date();
  return Math.floor((endTime - quizState.startTime) / 1000);
}