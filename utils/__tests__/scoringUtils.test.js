/**
 * Unit tests for scoring calculation functions
 * Tests scoring with various question types including single and multiple-choice
 */

import {
  getCorrectOptions,
  validateAnswer,
  isMultipleChoice,
  calculateQuestionScore,
  calculateTotalScore,
  getDetailedResults
} from '../scoringUtils.js';

describe('scoringUtils', () => {
  // Mock questions for testing
  const singleChoiceQuestion = {
    assignmentnumber: "1",
    questionnumber: "1",
    question: "What is machine learning?",
    options: [
      { optionnumber: "A", optiontext: "Option A", iscorrect: true },
      { optionnumber: "B", optiontext: "Option B", iscorrect: false },
      { optionnumber: "C", optiontext: "Option C", iscorrect: false }
    ]
  };

  const multipleChoiceQuestion = {
    assignmentnumber: "1",
    questionnumber: "2", 
    question: "Which are supervised learning algorithms?",
    options: [
      { optionnumber: "A", optiontext: "Linear Regression", iscorrect: true },
      { optionnumber: "B", optiontext: "K-means", iscorrect: false },
      { optionnumber: "C", optiontext: "Decision Trees", iscorrect: true },
      { optionnumber: "D", optiontext: "Random Forest", iscorrect: true }
    ]
  };

  const allCorrectQuestion = {
    assignmentnumber: "1",
    questionnumber: "3",
    question: "Which are ML concepts?",
    options: [
      { optionnumber: "A", optiontext: "Training", iscorrect: true },
      { optionnumber: "B", optiontext: "Testing", iscorrect: true },
      { optionnumber: "C", optiontext: "Validation", iscorrect: true }
    ]
  };

  const noCorrectQuestion = {
    assignmentnumber: "1",
    questionnumber: "4",
    question: "Invalid question",
    options: [
      { optionnumber: "A", optiontext: "Option A", iscorrect: false },
      { optionnumber: "B", optiontext: "Option B", iscorrect: false }
    ]
  };

  describe('getCorrectOptions', () => {
    it('should return correct options for single choice question', () => {
      const result = getCorrectOptions(singleChoiceQuestion);
      expect(result).toEqual(["A"]);
    });

    it('should return correct options for multiple choice question', () => {
      const result = getCorrectOptions(multipleChoiceQuestion);
      expect(result).toEqual(["A", "C", "D"]);
    });

    it('should return all options when all are correct', () => {
      const result = getCorrectOptions(allCorrectQuestion);
      expect(result).toEqual(["A", "B", "C"]);
    });

    it('should return empty array when no options are correct', () => {
      const result = getCorrectOptions(noCorrectQuestion);
      expect(result).toEqual([]);
    });

    it('should handle question with no options', () => {
      const emptyQuestion = { ...singleChoiceQuestion, options: [] };
      const result = getCorrectOptions(emptyQuestion);
      expect(result).toEqual([]);
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct single choice answer', () => {
      const result = validateAnswer(["A"], singleChoiceQuestion);
      expect(result).toBe(true);
    });

    it('should invalidate incorrect single choice answer', () => {
      const result = validateAnswer(["B"], singleChoiceQuestion);
      expect(result).toBe(false);
    });

    it('should invalidate multiple selections for single choice', () => {
      const result = validateAnswer(["A", "B"], singleChoiceQuestion);
      expect(result).toBe(false);
    });

    it('should validate correct multiple choice answer', () => {
      const result = validateAnswer(["A", "C", "D"], multipleChoiceQuestion);
      expect(result).toBe(true);
    });

    it('should validate correct multiple choice answer in different order', () => {
      const result = validateAnswer(["D", "A", "C"], multipleChoiceQuestion);
      expect(result).toBe(true);
    });

    it('should invalidate partial multiple choice answer', () => {
      const result = validateAnswer(["A", "C"], multipleChoiceQuestion);
      expect(result).toBe(false);
    });

    it('should invalidate multiple choice with incorrect option', () => {
      const result = validateAnswer(["A", "B", "C", "D"], multipleChoiceQuestion);
      expect(result).toBe(false);
    });

    it('should handle empty selection', () => {
      const result = validateAnswer([], singleChoiceQuestion);
      expect(result).toBe(false);
    });

    it('should handle null/undefined selection', () => {
      expect(validateAnswer(null, singleChoiceQuestion)).toBe(false);
      expect(validateAnswer(undefined, singleChoiceQuestion)).toBe(false);
    });
  });

  describe('isMultipleChoice', () => {
    it('should identify single choice question', () => {
      const result = isMultipleChoice(singleChoiceQuestion);
      expect(result).toBe(false);
    });

    it('should identify multiple choice question', () => {
      const result = isMultipleChoice(multipleChoiceQuestion);
      expect(result).toBe(true);
    });

    it('should identify all-correct question as multiple choice', () => {
      const result = isMultipleChoice(allCorrectQuestion);
      expect(result).toBe(true);
    });

    it('should handle question with no correct answers', () => {
      const result = isMultipleChoice(noCorrectQuestion);
      expect(result).toBe(false);
    });

    it('should handle question with no options', () => {
      const emptyQuestion = { ...singleChoiceQuestion, options: [] };
      const result = isMultipleChoice(emptyQuestion);
      expect(result).toBe(false);
    });
  });

  describe('calculateQuestionScore', () => {
    it('should give full points for correct single choice answer', () => {
      const result = calculateQuestionScore(["A"], singleChoiceQuestion);
      expect(result).toEqual({
        points: 1,
        isCorrect: true,
        maxPoints: 1
      });
    });

    it('should give zero points for incorrect single choice answer', () => {
      const result = calculateQuestionScore(["B"], singleChoiceQuestion);
      expect(result).toEqual({
        points: 0,
        isCorrect: false,
        maxPoints: 1
      });
    });

    it('should give full points for correct multiple choice answer', () => {
      const result = calculateQuestionScore(["A", "C", "D"], multipleChoiceQuestion);
      expect(result).toEqual({
        points: 1,
        isCorrect: true,
        maxPoints: 1
      });
    });

    it('should give zero points for incorrect multiple choice answer', () => {
      const result = calculateQuestionScore(["A", "B"], multipleChoiceQuestion);
      expect(result).toEqual({
        points: 0,
        isCorrect: false,
        maxPoints: 1
      });
    });

    it('should handle empty selection', () => {
      const result = calculateQuestionScore([], singleChoiceQuestion);
      expect(result).toEqual({
        points: 0,
        isCorrect: false,
        maxPoints: 1
      });
    });
  });

  describe('calculateTotalScore', () => {
    const questions = [singleChoiceQuestion, multipleChoiceQuestion, allCorrectQuestion];
    
    it('should calculate perfect score', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        { selectedOptions: ["A", "C", "D"] },
        { selectedOptions: ["A", "B", "C"] }
      ];
      
      const result = calculateTotalScore(userAnswers, questions);
      
      expect(result.correct).toBe(3);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.questionScores).toHaveLength(3);
      
      result.questionScores.forEach(score => {
        expect(score.isCorrect).toBe(true);
        expect(score.points).toBe(1);
      });
    });

    it('should calculate partial score', () => {
      const userAnswers = [
        { selectedOptions: ["A"] }, // Correct
        { selectedOptions: ["A", "B"] }, // Incorrect
        { selectedOptions: ["A", "B"] } // Incorrect
      ];
      
      const result = calculateTotalScore(userAnswers, questions);
      
      expect(result.correct).toBe(1);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(33);
      expect(result.passed).toBe(false);
    });

    it('should calculate zero score', () => {
      const userAnswers = [
        { selectedOptions: ["B"] }, // Incorrect
        { selectedOptions: ["B"] }, // Incorrect
        { selectedOptions: ["A"] } // Incorrect (partial)
      ];
      
      const result = calculateTotalScore(userAnswers, questions);
      
      expect(result.correct).toBe(0);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('should handle missing user answers', () => {
      const userAnswers = [
        { selectedOptions: ["A"] }, // Correct
        null, // Missing answer
        undefined // Missing answer
      ];
      
      const result = calculateTotalScore(userAnswers, questions);
      
      expect(result.correct).toBe(1);
      expect(result.total).toBe(3);
      expect(result.percentage).toBe(33);
      
      // Check that missing answers are handled
      expect(result.questionScores[1].selectedOptions).toEqual([]);
      expect(result.questionScores[2].selectedOptions).toEqual([]);
    });

    it('should handle empty questions array', () => {
      const result = calculateTotalScore([], []);
      
      expect(result.correct).toBe(0);
      expect(result.total).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.questionScores).toEqual([]);
    });

    it('should include detailed question scores', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        { selectedOptions: ["A", "C", "D"] }
      ];
      
      const testQuestions = [singleChoiceQuestion, multipleChoiceQuestion];
      const result = calculateTotalScore(userAnswers, testQuestions);
      
      expect(result.questionScores).toHaveLength(2);
      
      const firstScore = result.questionScores[0];
      expect(firstScore.questionIndex).toBe(0);
      expect(firstScore.isCorrect).toBe(true);
      expect(firstScore.selectedOptions).toEqual(["A"]);
      expect(firstScore.correctOptions).toEqual(["A"]);
      
      const secondScore = result.questionScores[1];
      expect(secondScore.questionIndex).toBe(1);
      expect(secondScore.isCorrect).toBe(true);
      expect(secondScore.selectedOptions).toEqual(["A", "C", "D"]);
      expect(secondScore.correctOptions).toEqual(["A", "C", "D"]);
    });
  });

  describe('getDetailedResults', () => {
    const questions = [singleChoiceQuestion, multipleChoiceQuestion];
    
    it('should provide detailed results for all questions', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        { selectedOptions: ["A", "C"] }
      ];
      
      const result = getDetailedResults(userAnswers, questions);
      
      expect(result).toHaveLength(2);
      
      const firstResult = result[0];
      expect(firstResult.questionNumber).toBe(1);
      expect(firstResult.question).toBe(singleChoiceQuestion.question);
      expect(firstResult.selectedOptions).toEqual(["A"]);
      expect(firstResult.correctOptions).toEqual(["A"]);
      expect(firstResult.isCorrect).toBe(true);
      expect(firstResult.isMultipleChoice).toBe(false);
      expect(firstResult.allOptions).toHaveLength(3);
      
      const secondResult = result[1];
      expect(secondResult.questionNumber).toBe(2);
      expect(secondResult.isCorrect).toBe(false); // Partial answer
      expect(secondResult.isMultipleChoice).toBe(true);
    });

    it('should handle missing user answers', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        null
      ];
      
      const result = getDetailedResults(userAnswers, questions);
      
      expect(result[0].selectedOptions).toEqual(["A"]);
      expect(result[1].selectedOptions).toEqual([]);
      expect(result[1].isCorrect).toBe(false);
    });

    it('should provide detailed option information', () => {
      const userAnswers = [
        { selectedOptions: ["A", "B"] }
      ];
      
      const result = getDetailedResults(userAnswers, [singleChoiceQuestion]);
      
      const optionDetails = result[0].allOptions;
      expect(optionDetails).toHaveLength(3);
      
      expect(optionDetails[0]).toEqual({
        number: "A",
        text: "Option A",
        isCorrect: true,
        wasSelected: true
      });
      
      expect(optionDetails[1]).toEqual({
        number: "B", 
        text: "Option B",
        isCorrect: false,
        wasSelected: true
      });
      
      expect(optionDetails[2]).toEqual({
        number: "C",
        text: "Option C", 
        isCorrect: false,
        wasSelected: false
      });
    });

    it('should handle empty arrays', () => {
      const result = getDetailedResults([], []);
      expect(result).toEqual([]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle questions with duplicate option numbers', () => {
      const duplicateQuestion = {
        ...singleChoiceQuestion,
        options: [
          { optionnumber: "A", optiontext: "First A", iscorrect: true },
          { optionnumber: "A", optiontext: "Second A", iscorrect: false },
          { optionnumber: "B", optiontext: "Option B", iscorrect: false }
        ]
      };
      
      const correctOptions = getCorrectOptions(duplicateQuestion);
      expect(correctOptions).toEqual(["A"]); // Should include only the correct one
    });

    it('should handle very large numbers of options', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        optionnumber: String.fromCharCode(65 + i), // A, B, C, ...
        optiontext: `Option ${i + 1}`,
        iscorrect: i % 10 === 0 // Every 10th option is correct
      }));
      
      const largeQuestion = {
        ...singleChoiceQuestion,
        options: manyOptions
      };
      
      const correctOptions = getCorrectOptions(largeQuestion);
      expect(correctOptions).toHaveLength(10); // Should find all correct options
      expect(isMultipleChoice(largeQuestion)).toBe(true);
    });

    it('should maintain precision in percentage calculations', () => {
      // Test with numbers that might cause floating point issues
      const questions = Array.from({ length: 3 }, (_, i) => ({
        ...singleChoiceQuestion,
        questionnumber: String(i + 1)
      }));
      
      const userAnswers = [
        { selectedOptions: ["A"] }, // 1 correct out of 3
        { selectedOptions: ["B"] },
        { selectedOptions: ["B"] }
      ];
      
      const result = calculateTotalScore(userAnswers, questions);
      expect(result.percentage).toBe(33); // Should be rounded properly
    });
  });
});