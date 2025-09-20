/**
 * Scoring calculation functions for both single and multiple-choice questions
 */

/**
 * Checks if two arrays contain the same elements (order independent)
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} - True if arrays contain same elements
 */
function arraysEqual(arr1, arr2) {
  // Handle null/undefined arrays
  if (!arr1 || !arr2) return false;
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
}

/**
 * Gets correct option numbers for a question
 * @param {Object} question - Question object with options
 * @returns {Array} - Array of correct option numbers
 */
export function getCorrectOptions(question) {
  return question.options
    .filter(option => option.iscorrect)
    .map(option => option.optionnumber);
}

/**
 * Validates if a user's answer is correct for a single question
 * @param {Array} selectedOptions - User's selected option numbers
 * @param {Object} question - Question object
 * @returns {boolean} - True if answer is correct
 */
export function validateAnswer(selectedOptions, question) {
  const correctOptions = getCorrectOptions(question);
  return arraysEqual(selectedOptions, correctOptions);
}

/**
 * Determines if a question is multiple choice (has multiple correct answers)
 * @param {Object} question - Question object
 * @returns {boolean} - True if question has multiple correct answers
 */
export function isMultipleChoice(question) {
  const correctCount = question.options.filter(option => option.iscorrect).length;
  return correctCount > 1;
}

/**
 * Calculates the score for a single question
 * @param {Array} selectedOptions - User's selected option numbers
 * @param {Object} question - Question object
 * @returns {Object} - Score object with points and isCorrect
 */
export function calculateQuestionScore(selectedOptions, question) {
  const isCorrect = validateAnswer(selectedOptions, question);
  return {
    points: isCorrect ? 1 : 0,
    isCorrect,
    maxPoints: 1
  };
}

/**
 * Calculates the total score for all questions in a quiz
 * @param {Array} userAnswers - Array of user answer objects
 * @param {Array} questions - Array of question objects
 * @returns {Object} - Complete score breakdown
 */
export function calculateTotalScore(userAnswers, questions) {
  let correctCount = 0;
  let totalQuestions = questions.length;
  const questionScores = [];

  questions.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const selectedOptions = userAnswer ? userAnswer.selectedOptions : [];
    
    const questionScore = calculateQuestionScore(selectedOptions, question);
    questionScores.push({
      questionIndex: index,
      ...questionScore,
      selectedOptions,
      correctOptions: getCorrectOptions(question)
    });

    if (questionScore.isCorrect) {
      correctCount++;
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    correct: correctCount,
    total: totalQuestions,
    percentage,
    questionScores,
    passed: percentage >= 70 // Assuming 70% is passing grade
  };
}

/**
 * Gets detailed results for review
 * @param {Array} userAnswers - Array of user answer objects
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array of detailed question results
 */
export function getDetailedResults(userAnswers, questions) {
  return questions.map((question, index) => {
    const userAnswer = userAnswers[index];
    const selectedOptions = userAnswer ? userAnswer.selectedOptions : [];
    const correctOptions = getCorrectOptions(question);
    const isCorrect = validateAnswer(selectedOptions, question);

    return {
      questionNumber: index + 1,
      question: question.question,
      selectedOptions,
      correctOptions,
      isCorrect,
      isMultipleChoice: isMultipleChoice(question),
      allOptions: question.options.map(opt => ({
        number: opt.optionnumber,
        text: opt.optiontext,
        isCorrect: opt.iscorrect,
        wasSelected: selectedOptions.includes(opt.optionnumber)
      }))
    };
  });
}