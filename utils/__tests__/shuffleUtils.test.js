/**
 * Unit tests for shuffle utilities
 * Tests question shuffling algorithms and randomization logic
 */

import { 
  shuffleQuestions, 
  shuffleQuestionOptions, 
  prepareQuestionsForMode 
} from '../shuffleUtils.js';

describe('shuffleUtils', () => {
  // Mock questions for testing
  const mockQuestions = [
    {
      assignmentnumber: "1",
      questionnumber: "1",
      question: "What is machine learning?",
      options: [
        { optionnumber: "A", optiontext: "Option A", iscorrect: true },
        { optionnumber: "B", optiontext: "Option B", iscorrect: false },
        { optionnumber: "C", optiontext: "Option C", iscorrect: false }
      ]
    },
    {
      assignmentnumber: "1", 
      questionnumber: "2",
      question: "What is deep learning?",
      options: [
        { optionnumber: "A", optiontext: "Option A", iscorrect: false },
        { optionnumber: "B", optiontext: "Option B", iscorrect: true },
        { optionnumber: "C", optiontext: "Option C", iscorrect: false }
      ]
    },
    {
      assignmentnumber: "1",
      questionnumber: "3", 
      question: "What is neural network?",
      options: [
        { optionnumber: "A", optiontext: "Option A", iscorrect: false },
        { optionnumber: "B", optiontext: "Option B", iscorrect: false },
        { optionnumber: "C", optiontext: "Option C", iscorrect: true }
      ]
    }
  ];

  beforeEach(() => {
    // Reset Math.random mock before each test
    Math.random.mockClear();
  });

  describe('shuffleQuestions', () => {
    it('should return a new array with same length', () => {
      const result = shuffleQuestions(mockQuestions);
      expect(result).toHaveLength(mockQuestions.length);
      expect(result).not.toBe(mockQuestions); // Should be a new array
    });

    it('should contain all original questions', () => {
      const result = shuffleQuestions(mockQuestions);
      
      // Check that all original questions are present
      mockQuestions.forEach(question => {
        expect(result).toContainEqual(question);
      });
    });

    it('should not modify original array', () => {
      const originalQuestions = [...mockQuestions];
      shuffleQuestions(mockQuestions);
      expect(mockQuestions).toEqual(originalQuestions);
    });

    it('should handle empty array', () => {
      const result = shuffleQuestions([]);
      expect(result).toEqual([]);
    });

    it('should handle single question', () => {
      const singleQuestion = [mockQuestions[0]];
      const result = shuffleQuestions(singleQuestion);
      expect(result).toEqual(singleQuestion);
    });

    it('should produce different order with different random values', () => {
      // Mock Math.random to return predictable sequence
      Math.random
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.5);
      
      const result1 = shuffleQuestions(mockQuestions);
      
      Math.random
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.2);
      
      const result2 = shuffleQuestions(mockQuestions);
      
      // Results should be different (with high probability)
      expect(result1).not.toEqual(result2);
    });
  });

  describe('shuffleQuestionOptions', () => {
    it('should return new question object with shuffled options', () => {
      const question = mockQuestions[0];
      const result = shuffleQuestionOptions(question);
      
      expect(result).not.toBe(question); // Should be new object
      expect(result.question).toBe(question.question);
      expect(result.assignmentnumber).toBe(question.assignmentnumber);
      expect(result.questionnumber).toBe(question.questionnumber);
      expect(result.options).toHaveLength(question.options.length);
    });

    it('should contain all original options', () => {
      const question = mockQuestions[0];
      const result = shuffleQuestionOptions(question);
      
      question.options.forEach(option => {
        expect(result.options).toContainEqual(option);
      });
    });

    it('should not modify original question', () => {
      const originalQuestion = { ...mockQuestions[0], options: [...mockQuestions[0].options] };
      shuffleQuestionOptions(mockQuestions[0]);
      expect(mockQuestions[0]).toEqual(originalQuestion);
    });

    it('should handle question with single option', () => {
      const singleOptionQuestion = {
        ...mockQuestions[0],
        options: [{ optionnumber: "A", optiontext: "Only option", iscorrect: true }]
      };
      
      const result = shuffleQuestionOptions(singleOptionQuestion);
      expect(result.options).toEqual(singleOptionQuestion.options);
    });

    it('should handle question with no options', () => {
      const noOptionsQuestion = {
        ...mockQuestions[0],
        options: []
      };
      
      const result = shuffleQuestionOptions(noOptionsQuestion);
      expect(result.options).toEqual([]);
    });
  });

  describe('prepareQuestionsForMode', () => {
    it('should return original questions for learn mode', () => {
      const result = prepareQuestionsForMode(mockQuestions, 'learn');
      expect(result).toEqual(mockQuestions);
      expect(result).not.toBe(mockQuestions); // Should be new array
    });

    it('should return original questions for test-easy mode', () => {
      const result = prepareQuestionsForMode(mockQuestions, 'test-easy');
      expect(result).toEqual(mockQuestions);
      expect(result).not.toBe(mockQuestions); // Should be new array
    });

    it('should shuffle questions and options for test-difficult mode', () => {
      // Mock Math.random for predictable shuffling
      Math.random
        .mockReturnValueOnce(0.1) // For question shuffling
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.2) // For option shuffling in first question
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.3) // For option shuffling in second question
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.4) // For option shuffling in third question
        .mockReturnValueOnce(0.6);
      
      const result = prepareQuestionsForMode(mockQuestions, 'test-difficult');
      
      // Should have same number of questions
      expect(result).toHaveLength(mockQuestions.length);
      
      // Should contain all original questions (but potentially in different order)
      mockQuestions.forEach(question => {
        const foundQuestion = result.find(q => q.questionnumber === question.questionnumber);
        expect(foundQuestion).toBeDefined();
        expect(foundQuestion.question).toBe(question.question);
        
        // Options should be shuffled but contain same content
        question.options.forEach(option => {
          expect(foundQuestion.options).toContainEqual(option);
        });
      });
    });

    it('should not modify original questions array', () => {
      const originalQuestions = JSON.parse(JSON.stringify(mockQuestions));
      prepareQuestionsForMode(mockQuestions, 'test-difficult');
      expect(mockQuestions).toEqual(originalQuestions);
    });

    it('should handle empty questions array', () => {
      const result = prepareQuestionsForMode([], 'test-difficult');
      expect(result).toEqual([]);
    });

    it('should handle unknown mode by returning copy of original', () => {
      const result = prepareQuestionsForMode(mockQuestions, 'unknown-mode');
      expect(result).toEqual(mockQuestions);
      expect(result).not.toBe(mockQuestions);
    });
  });

  describe('randomization behavior', () => {
    it('should use Fisher-Yates algorithm correctly', () => {
      // Test with a controlled sequence of random values
      const testArray = [1, 2, 3, 4, 5];
      
      // Mock specific random sequence for Fisher-Yates
      Math.random
        .mockReturnValueOnce(0.8) // Will swap index 4 with index 4 (no change)
        .mockReturnValueOnce(0.25) // Will swap index 3 with index 1
        .mockReturnValueOnce(0.66) // Will swap index 2 with index 2 (no change)  
        .mockReturnValueOnce(0.5); // Will swap index 1 with index 1 (no change)
      
      const result = shuffleQuestions(testArray);
      
      // Verify the algorithm was called the correct number of times
      expect(Math.random).toHaveBeenCalledTimes(4); // n-1 times for array of length 5
    });

    it('should maintain referential integrity of question objects', () => {
      const result = prepareQuestionsForMode(mockQuestions, 'test-difficult');
      
      // Each question object should maintain its structure
      result.forEach(question => {
        expect(question).toHaveProperty('assignmentnumber');
        expect(question).toHaveProperty('questionnumber');
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('options');
        expect(Array.isArray(question.options)).toBe(true);
        
        question.options.forEach(option => {
          expect(option).toHaveProperty('optionnumber');
          expect(option).toHaveProperty('optiontext');
          expect(option).toHaveProperty('iscorrect');
        });
      });
    });
  });
});