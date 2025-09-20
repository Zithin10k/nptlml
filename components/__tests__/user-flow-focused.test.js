/**
 * Focused User Flow Tests
 * Tests the core functionality of question shuffling, scoring, and mode behavior
 */

import { prepareQuestionsForMode, shuffleQuestions, shuffleQuestionOptions } from '../../utils/shuffleUtils';
import { calculateTotalScore, validateAnswer, getCorrectOptions, isMultipleChoice } from '../../utils/scoringUtils';

// Mock data for testing
const mockQuestions = [
  {
    assignmentnumber: "1",
    questionnumber: "1",
    question: "What is machine learning?",
    image: "",
    options: [
      { optionnumber: "A", optiontext: "A subset of AI", iscorrect: true },
      { optionnumber: "B", optiontext: "A programming language", iscorrect: false },
      { optionnumber: "C", optiontext: "A database system", iscorrect: false },
      { optionnumber: "D", optiontext: "A web framework", iscorrect: false }
    ]
  },
  {
    assignmentnumber: "1",
    questionnumber: "2",
    question: "Which are supervised learning algorithms?",
    image: "",
    options: [
      { optionnumber: "A", optiontext: "Linear Regression", iscorrect: true },
      { optionnumber: "B", optiontext: "Decision Trees", iscorrect: true },
      { optionnumber: "C", optiontext: "K-means", iscorrect: false },
      { optionnumber: "D", optiontext: "DBSCAN", iscorrect: false }
    ]
  },
  {
    assignmentnumber: "1",
    questionnumber: "3",
    question: "What is overfitting?",
    image: "",
    options: [
      { optionnumber: "A", optiontext: "Model performs well on training data but poorly on test data", iscorrect: true },
      { optionnumber: "B", optiontext: "Model performs poorly on both training and test data", iscorrect: false },
      { optionnumber: "C", optiontext: "Model has too few parameters", iscorrect: false },
      { optionnumber: "D", optiontext: "Model trains too quickly", iscorrect: false }
    ]
  }
];

describe('User Flow Core Functionality Tests', () => {
  describe('Question Shuffling (Test Difficult Mode)', () => {
    test('should shuffle questions correctly', () => {
      const originalQuestions = [...mockQuestions];
      const shuffledQuestions = shuffleQuestions(mockQuestions);
      
      // Should return same number of questions
      expect(shuffledQuestions).toHaveLength(originalQuestions.length);
      
      // Should contain all original questions
      expect(shuffledQuestions).toEqual(expect.arrayContaining(originalQuestions));
      
      // Each question should be intact
      shuffledQuestions.forEach(shuffledQ => {
        const originalQ = originalQuestions.find(q => q.questionnumber === shuffledQ.questionnumber);
        expect(originalQ).toBeDefined();
        expect(shuffledQ.question).toBe(originalQ.question);
        expect(shuffledQ.options).toEqual(originalQ.options);
      });
    });

    test('should shuffle options within questions', () => {
      const originalQuestion = mockQuestions[0];
      const shuffledQuestion = shuffleQuestionOptions(originalQuestion);
      
      // Should preserve question text and metadata
      expect(shuffledQuestion.question).toBe(originalQuestion.question);
      expect(shuffledQuestion.questionnumber).toBe(originalQuestion.questionnumber);
      expect(shuffledQuestion.assignmentnumber).toBe(originalQuestion.assignmentnumber);
      
      // Should have same options but potentially different order
      expect(shuffledQuestion.options).toHaveLength(originalQuestion.options.length);
      expect(shuffledQuestion.options).toEqual(expect.arrayContaining(originalQuestion.options));
      
      // Each option should be intact
      shuffledQuestion.options.forEach(shuffledOpt => {
        const originalOpt = originalQuestion.options.find(opt => opt.optionnumber === shuffledOpt.optionnumber);
        expect(originalOpt).toBeDefined();
        expect(shuffledOpt).toEqual(originalOpt);
      });
    });

    test('should prepare questions correctly for different modes', () => {
      // Learn mode - no shuffling
      const learnQuestions = prepareQuestionsForMode(mockQuestions, 'learn');
      expect(learnQuestions).toEqual(mockQuestions);
      
      // Test easy mode - no shuffling
      const testEasyQuestions = prepareQuestionsForMode(mockQuestions, 'test-easy');
      expect(testEasyQuestions).toEqual(mockQuestions);
      
      // Test difficult mode - should shuffle
      const testDifficultQuestions = prepareQuestionsForMode(mockQuestions, 'test-difficult');
      expect(testDifficultQuestions).toHaveLength(mockQuestions.length);
      expect(testDifficultQuestions).toEqual(expect.arrayContaining(mockQuestions.map(q => expect.objectContaining({
        questionnumber: q.questionnumber,
        question: q.question
      }))));
    });
  });

  describe('Answer Validation and Scoring', () => {
    test('should identify single-choice vs multiple-choice questions', () => {
      expect(isMultipleChoice(mockQuestions[0])).toBe(false); // Single correct answer
      expect(isMultipleChoice(mockQuestions[1])).toBe(true);  // Multiple correct answers
      expect(isMultipleChoice(mockQuestions[2])).toBe(false); // Single correct answer
    });

    test('should get correct options for questions', () => {
      expect(getCorrectOptions(mockQuestions[0])).toEqual(['A']);
      expect(getCorrectOptions(mockQuestions[1])).toEqual(['A', 'B']);
      expect(getCorrectOptions(mockQuestions[2])).toEqual(['A']);
    });

    test('should validate single-choice answers correctly', () => {
      const question = mockQuestions[0]; // Single correct answer: A
      
      expect(validateAnswer(['A'], question)).toBe(true);
      expect(validateAnswer(['B'], question)).toBe(false);
      expect(validateAnswer(['C'], question)).toBe(false);
      expect(validateAnswer(['D'], question)).toBe(false);
      expect(validateAnswer(['A', 'B'], question)).toBe(false); // Too many answers
      expect(validateAnswer([], question)).toBe(false); // No answer
    });

    test('should validate multiple-choice answers correctly', () => {
      const question = mockQuestions[1]; // Multiple correct answers: A, B
      
      expect(validateAnswer(['A', 'B'], question)).toBe(true);
      expect(validateAnswer(['B', 'A'], question)).toBe(true); // Order shouldn't matter
      expect(validateAnswer(['A'], question)).toBe(false); // Incomplete
      expect(validateAnswer(['B'], question)).toBe(false); // Incomplete
      expect(validateAnswer(['C', 'D'], question)).toBe(false); // Wrong answers
      expect(validateAnswer(['A', 'B', 'C'], question)).toBe(false); // Too many answers
      expect(validateAnswer([], question)).toBe(false); // No answer
    });

    test('should calculate quiz scores correctly', () => {
      const userAnswers = [
        { selectedOptions: ['A'] }, // Correct
        { selectedOptions: ['A', 'B'] }, // Correct
        { selectedOptions: ['B'] } // Incorrect
      ];

      const score = calculateTotalScore(userAnswers, mockQuestions);
      
      expect(score.correct).toBe(2);
      expect(score.total).toBe(3);
      expect(score.percentage).toBe(67); // 2/3 * 100 rounded
      expect(score.passed).toBe(false); // Less than 70%
      expect(score.questionScores).toHaveLength(3);
      
      // Check individual question scores
      expect(score.questionScores[0].isCorrect).toBe(true);
      expect(score.questionScores[1].isCorrect).toBe(true);
      expect(score.questionScores[2].isCorrect).toBe(false);
    });

    test('should handle edge cases in scoring', () => {
      // Empty answers
      const emptyAnswers = [
        { selectedOptions: [] },
        { selectedOptions: [] },
        { selectedOptions: [] }
      ];
      
      const emptyScore = calculateTotalScore(emptyAnswers, mockQuestions);
      expect(emptyScore.correct).toBe(0);
      expect(emptyScore.percentage).toBe(0);
      
      // Perfect score
      const perfectAnswers = [
        { selectedOptions: ['A'] },
        { selectedOptions: ['A', 'B'] },
        { selectedOptions: ['A'] }
      ];
      
      const perfectScore = calculateTotalScore(perfectAnswers, mockQuestions);
      expect(perfectScore.correct).toBe(3);
      expect(perfectScore.percentage).toBe(100);
      expect(perfectScore.passed).toBe(true);
    });
  });

  describe('Mode-Specific Behavior', () => {
    test('should maintain question integrity across all modes', () => {
      const modes = ['learn', 'test-easy', 'test-difficult'];
      
      modes.forEach(mode => {
        const preparedQuestions = prepareQuestionsForMode(mockQuestions, mode);
        
        // Should have same number of questions
        expect(preparedQuestions).toHaveLength(mockQuestions.length);
        
        // Each question should have all required properties
        preparedQuestions.forEach(question => {
          expect(question).toHaveProperty('questionnumber');
          expect(question).toHaveProperty('question');
          expect(question).toHaveProperty('options');
          expect(question.options).toBeInstanceOf(Array);
          expect(question.options.length).toBeGreaterThan(0);
          
          // Each option should have required properties
          question.options.forEach(option => {
            expect(option).toHaveProperty('optionnumber');
            expect(option).toHaveProperty('optiontext');
            expect(option).toHaveProperty('iscorrect');
            expect(typeof option.iscorrect).toBe('boolean');
          });
        });
      });
    });

    test('should preserve correct answer distribution', () => {
      const modes = ['learn', 'test-easy', 'test-difficult'];
      
      modes.forEach(mode => {
        const preparedQuestions = prepareQuestionsForMode(mockQuestions, mode);
        
        preparedQuestions.forEach((question, index) => {
          const originalQuestion = mockQuestions.find(q => q.questionnumber === question.questionnumber);
          const originalCorrectCount = originalQuestion.options.filter(opt => opt.iscorrect).length;
          const preparedCorrectCount = question.options.filter(opt => opt.iscorrect).length;
          
          expect(preparedCorrectCount).toBe(originalCorrectCount);
        });
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large question sets efficiently', () => {
      // Create a larger dataset
      const largeQuestionSet = Array.from({ length: 100 }, (_, i) => ({
        assignmentnumber: "1",
        questionnumber: String(i + 1),
        question: `Question ${i + 1}`,
        image: "",
        options: [
          { optionnumber: "A", optiontext: "Option A", iscorrect: i % 2 === 0 },
          { optionnumber: "B", optiontext: "Option B", iscorrect: i % 3 === 0 },
          { optionnumber: "C", optiontext: "Option C", iscorrect: false },
          { optionnumber: "D", optiontext: "Option D", iscorrect: false }
        ]
      }));

      const startTime = Date.now();
      const shuffledQuestions = prepareQuestionsForMode(largeQuestionSet, 'test-difficult');
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(shuffledQuestions).toHaveLength(largeQuestionSet.length);
    });

    test('should handle questions with no correct answers gracefully', () => {
      const invalidQuestion = {
        assignmentnumber: "1",
        questionnumber: "1",
        question: "Invalid question",
        image: "",
        options: [
          { optionnumber: "A", optiontext: "Option A", iscorrect: false },
          { optionnumber: "B", optiontext: "Option B", iscorrect: false }
        ]
      };

      expect(getCorrectOptions(invalidQuestion)).toEqual([]);
      expect(validateAnswer(['A'], invalidQuestion)).toBe(false);
      expect(isMultipleChoice(invalidQuestion)).toBe(false);
    });

    test('should handle questions with all correct answers', () => {
      const allCorrectQuestion = {
        assignmentnumber: "1",
        questionnumber: "1",
        question: "All correct question",
        image: "",
        options: [
          { optionnumber: "A", optiontext: "Option A", iscorrect: true },
          { optionnumber: "B", optiontext: "Option B", iscorrect: true }
        ]
      };

      expect(getCorrectOptions(allCorrectQuestion)).toEqual(['A', 'B']);
      expect(validateAnswer(['A', 'B'], allCorrectQuestion)).toBe(true);
      expect(validateAnswer(['A'], allCorrectQuestion)).toBe(false);
      expect(isMultipleChoice(allCorrectQuestion)).toBe(true);
    });
  });
});