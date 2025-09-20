/**
 * Unit tests for answer validation logic
 * Tests validation including multiple-choice scenarios
 */

import {
  validateSelectedOptions,
  validateQuizSubmission,
  sanitizeOptionSelection,
  isAnswerComplete,
  getAnswerFeedback
} from '../answerValidation.js';

describe('answerValidation', () => {
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

  describe('validateSelectedOptions', () => {
    it('should validate correct single choice selection', () => {
      const result = validateSelectedOptions(["A"], singleChoiceQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate correct multiple choice selection', () => {
      const result = validateSelectedOptions(["A", "C"], multipleChoiceQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject non-array input', () => {
      const result = validateSelectedOptions("A", singleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Selected options must be an array');
    });

    it('should reject empty selection', () => {
      const result = validateSelectedOptions([], singleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one option must be selected');
    });

    it('should reject invalid option numbers', () => {
      const result = validateSelectedOptions(["X", "Y"], singleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid option(s): X, Y');
    });

    it('should reject multiple selections for single choice', () => {
      const result = validateSelectedOptions(["A", "B"], singleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only one option can be selected for single-choice questions');
    });

    it('should reject duplicate selections', () => {
      const result = validateSelectedOptions(["A", "A"], multipleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate options selected');
    });

    it('should handle mixed valid and invalid options', () => {
      const result = validateSelectedOptions(["A", "X", "C"], multipleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid option(s): X');
    });

    it('should accumulate multiple errors', () => {
      const result = validateSelectedOptions(["A", "B", "X", "A"], singleChoiceQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Invalid option(s): X');
      expect(result.errors).toContain('Only one option can be selected for single-choice questions');
      expect(result.errors).toContain('Duplicate options selected');
    });

    it('should handle null and undefined inputs', () => {
      const nullResult = validateSelectedOptions(null, singleChoiceQuestion);
      expect(nullResult.isValid).toBe(false);
      
      const undefinedResult = validateSelectedOptions(undefined, singleChoiceQuestion);
      expect(undefinedResult.isValid).toBe(false);
    });
  });

  describe('validateQuizSubmission', () => {
    const questions = [singleChoiceQuestion, multipleChoiceQuestion];

    it('should validate complete quiz submission', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        { selectedOptions: ["A", "C"] }
      ];
      
      const result = validateQuizSubmission(userAnswers, questions, 'test-easy');
      expect(result.canSubmit).toBe(true);
      expect(result.issues).toEqual([]);
      expect(result.unansweredCount).toBe(0);
      expect(result.hasValidationErrors).toBe(false);
    });

    it('should identify unanswered questions in test mode', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        null // Unanswered
      ];
      
      const result = validateQuizSubmission(userAnswers, questions, 'test-difficult');
      expect(result.canSubmit).toBe(false);
      expect(result.unansweredCount).toBe(1);
      expect(result.issues).toContain('1 question(s) left unanswered');
    });

    it('should be lenient in learn mode', () => {
      const userAnswers = [
        { selectedOptions: ["A"] },
        null // Unanswered
      ];
      
      const result = validateQuizSubmission(userAnswers, questions, 'learn');
      expect(result.canSubmit).toBe(true); // Learn mode allows submission
      expect(result.unansweredCount).toBe(1);
    });

    it('should identify validation errors', () => {
      const userAnswers = [
        { selectedOptions: ["A", "B"] }, // Invalid for single choice
        { selectedOptions: ["A", "C"] }
      ];
      
      const result = validateQuizSubmission(userAnswers, questions, 'test-easy');
      expect(result.canSubmit).toBe(false);
      expect(result.hasValidationErrors).toBe(true);
      expect(result.issues[0]).toContain('Question 1:');
    });

    it('should handle empty user answers array', () => {
      const result = validateQuizSubmission([], questions, 'test-easy');
      expect(result.canSubmit).toBe(false);
      expect(result.unansweredCount).toBe(2);
    });

    it('should handle empty questions array', () => {
      const result = validateQuizSubmission([], [], 'test-easy');
      expect(result.canSubmit).toBe(true);
      expect(result.unansweredCount).toBe(0);
    });

    it('should handle answers with empty selectedOptions', () => {
      const userAnswers = [
        { selectedOptions: [] },
        { selectedOptions: ["A"] }
      ];
      
      const result = validateQuizSubmission(userAnswers, questions, 'test-easy');
      expect(result.unansweredCount).toBe(1);
    });
  });

  describe('sanitizeOptionSelection', () => {
    it('should convert single value to array', () => {
      const result = sanitizeOptionSelection("A", singleChoiceQuestion);
      expect(result).toEqual(["A"]);
    });

    it('should preserve valid array input', () => {
      const result = sanitizeOptionSelection(["A", "C"], multipleChoiceQuestion);
      expect(result).toEqual(["A", "C"]);
    });

    it('should filter out invalid options', () => {
      const result = sanitizeOptionSelection(["A", "X", "C"], multipleChoiceQuestion);
      expect(result).toEqual(["A", "C"]);
    });

    it('should remove null and undefined values', () => {
      const result = sanitizeOptionSelection(["A", null, "C", undefined, ""], multipleChoiceQuestion);
      expect(result).toEqual(["A", "C"]);
    });

    it('should trim whitespace', () => {
      const result = sanitizeOptionSelection([" A ", "  C  "], multipleChoiceQuestion);
      expect(result).toEqual(["A", "C"]);
    });

    it('should remove duplicates', () => {
      const result = sanitizeOptionSelection(["A", "C", "A", "C"], multipleChoiceQuestion);
      expect(result).toEqual(["A", "C"]);
    });

    it('should limit single choice to one option', () => {
      const result = sanitizeOptionSelection(["A", "B", "C"], singleChoiceQuestion);
      expect(result).toEqual(["A"]); // Should take first valid option
    });

    it('should handle non-string inputs', () => {
      const result = sanitizeOptionSelection([1, 2, "A"], singleChoiceQuestion);
      expect(result).toEqual(["A"]); // Should convert and filter
    });

    it('should handle empty input', () => {
      expect(sanitizeOptionSelection([], singleChoiceQuestion)).toEqual([]);
      expect(sanitizeOptionSelection(null, singleChoiceQuestion)).toEqual([]);
      expect(sanitizeOptionSelection(undefined, singleChoiceQuestion)).toEqual([]);
    });
  });

  describe('isAnswerComplete', () => {
    it('should return true for learn mode regardless of selection', () => {
      expect(isAnswerComplete([], singleChoiceQuestion, 'learn')).toBe(true);
      expect(isAnswerComplete(["A"], singleChoiceQuestion, 'learn')).toBe(true);
      expect(isAnswerComplete(null, singleChoiceQuestion, 'learn')).toBe(true);
    });

    it('should require selection in test modes', () => {
      expect(isAnswerComplete(["A"], singleChoiceQuestion, 'test-easy')).toBe(true);
      expect(isAnswerComplete([], singleChoiceQuestion, 'test-easy')).toBe(false);
      expect(isAnswerComplete(null, singleChoiceQuestion, 'test-difficult')).toBe(false);
    });

    it('should handle invalid input in test modes', () => {
      expect(isAnswerComplete(undefined, singleChoiceQuestion, 'test-easy')).toBe(false);
      expect(isAnswerComplete("not-array", singleChoiceQuestion, 'test-easy')).toBe(false);
    });

    it('should accept multiple selections for multiple choice', () => {
      expect(isAnswerComplete(["A", "C"], multipleChoiceQuestion, 'test-easy')).toBe(true);
      expect(isAnswerComplete(["A"], multipleChoiceQuestion, 'test-easy')).toBe(true);
    });
  });

  describe('getAnswerFeedback', () => {
    it('should prompt for selection in test modes when incomplete', () => {
      const result = getAnswerFeedback([], singleChoiceQuestion, 'test-easy');
      expect(result).toBe('Please select an answer before proceeding.');
    });

    it('should provide validation errors', () => {
      const result = getAnswerFeedback(["X"], singleChoiceQuestion, 'test-easy');
      expect(result).toContain('Invalid option(s): X');
    });

    it('should provide positive feedback for valid selections', () => {
      const result = getAnswerFeedback(["A"], singleChoiceQuestion, 'test-easy');
      expect(result).toBe('Answer recorded.');
    });

    it('should provide learn mode specific feedback', () => {
      const result = getAnswerFeedback(["A"], singleChoiceQuestion, 'learn');
      expect(result).toBe('Answer recorded. You can change your selection anytime.');
    });

    it('should handle multiple validation errors', () => {
      const result = getAnswerFeedback(["A", "B", "X"], singleChoiceQuestion, 'test-easy');
      expect(result).toContain('Invalid option(s): X');
      expect(result).toContain('Only one option can be selected');
    });

    it('should be permissive in learn mode even with incomplete answers', () => {
      const result = getAnswerFeedback([], singleChoiceQuestion, 'learn');
      expect(result).toBe('Answer recorded. You can change your selection anytime.');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle questions with no options', () => {
      const emptyQuestion = { ...singleChoiceQuestion, options: [] };
      
      const validation = validateSelectedOptions(["A"], emptyQuestion);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid option(s): A');
    });

    it('should handle very long option lists', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        optionnumber: String(i),
        optiontext: `Option ${i}`,
        iscorrect: i < 50
      }));
      
      const largeQuestion = { ...multipleChoiceQuestion, options: manyOptions };
      const manySelections = Array.from({ length: 50 }, (_, i) => String(i));
      
      const result = validateSelectedOptions(manySelections, largeQuestion);
      expect(result.isValid).toBe(true);
    });

    it('should handle special characters in option numbers', () => {
      const specialQuestion = {
        ...singleChoiceQuestion,
        options: [
          { optionnumber: "A-1", optiontext: "Option A-1", iscorrect: true },
          { optionnumber: "B_2", optiontext: "Option B_2", iscorrect: false },
          { optionnumber: "C.3", optiontext: "Option C.3", iscorrect: false }
        ]
      };
      
      const result = validateSelectedOptions(["A-1"], specialQuestion);
      expect(result.isValid).toBe(true);
    });

    it('should handle case sensitivity in option numbers', () => {
      const result = validateSelectedOptions(["a"], singleChoiceQuestion); // lowercase
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid option(s): a');
    });

    it('should handle numeric option numbers', () => {
      const numericQuestion = {
        ...singleChoiceQuestion,
        options: [
          { optionnumber: "1", optiontext: "Option 1", iscorrect: true },
          { optionnumber: "2", optiontext: "Option 2", iscorrect: false }
        ]
      };
      
      const result = validateSelectedOptions(["1"], numericQuestion);
      expect(result.isValid).toBe(true);
    });
  });
});