/**
 * User Flow Integration Tests
 * Tests complete user flows for all three learning modes
 * Verifies question shuffling, multiple-choice handling, and scoring
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import QuizInterface from '../QuizInterface';
import ModeSelector from '../ModeSelector';
import { prepareQuestionsForMode, shuffleQuestions, shuffleQuestionOptions } from '../../utils/shuffleUtils';
import { calculateTotalScore, validateAnswer } from '../../utils/scoringUtils';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

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

describe('User Flow Integration Tests', () => {
  let mockRouter;
  let mockParams;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
      replace: jest.fn(),
    };
    mockParams = {
      assignment: '1',
      mode: 'learn'
    };
    
    useRouter.mockReturnValue(mockRouter);
    useParams.mockReturnValue(mockParams);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Learn Mode Flow', () => {
    test('should complete learn mode flow with correct answers pre-highlighted', async () => {
      const onComplete = jest.fn();
      
      render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={mockQuestions}
          onComplete={onComplete}
        />
      );

      // Wait for quiz to load
      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Learn Mode')).toBeInTheDocument();
      });

      // Check that progress bar shows correct information
      expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();

      // In learn mode, correct answers should be pre-highlighted
      // Check that the correct option is highlighted (green background)
      const correctOption = screen.getByText('A subset of AI');
      expect(correctOption.closest('button')).toHaveClass('bg-green-100');

      // Navigate through all questions
      for (let i = 0; i < mockQuestions.length; i++) {
        if (i > 0) {
          // Check progress updates
          expect(screen.getByText(`Question ${i + 1} of 3`)).toBeInTheDocument();
        }

        // Click Next to go to next question (or finish)
        const nextButton = screen.getByRole('button', { name: /next|finish quiz/i });
        fireEvent.click(nextButton);

        if (i < mockQuestions.length - 1) {
          // Wait for next question to load
          await waitFor(() => {
            expect(screen.getByText(mockQuestions[i + 1].question)).toBeInTheDocument();
          });
        }
      }

      // Should complete and show results
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    test('should allow skipping questions in learn mode', async () => {
      render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={mockQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Learn Mode')).toBeInTheDocument();
      });

      // Skip button should be available in learn mode
      const skipButton = screen.getByRole('button', { name: /skip/i });
      expect(skipButton).toBeInTheDocument();

      fireEvent.click(skipButton);

      // Should move to next question
      await waitFor(() => {
        expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
      });
    });
  });

  describe('Test Easy Mode Flow', () => {
    test('should complete test easy mode with feedback after answers', async () => {
      const onComplete = jest.fn();
      
      render(
        <QuizInterface
          assignment="1"
          mode="test-easy"
          questions={mockQuestions}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Test Easy')).toBeInTheDocument();
      });

      // In test mode, answers should not be pre-highlighted
      const options = screen.getAllByRole('button', { name: /^[A-D]\./i });
      options.forEach(option => {
        expect(option).not.toHaveClass('bg-green-100');
      });

      // Select an answer
      const correctOption = screen.getByText('A subset of AI');
      fireEvent.click(correctOption.closest('button'));

      // Should show "Show Answer" button
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      expect(showAnswerButton).toBeInTheDocument();

      fireEvent.click(showAnswerButton);

      // Should show feedback with correct answer highlighted
      await waitFor(() => {
        expect(correctOption.closest('button')).toHaveClass('bg-green-100');
      });

      // Next button should now show "Next"
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should move to next question
      await waitFor(() => {
        expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
      });
    });

    test('should handle multiple-choice questions correctly', async () => {
      render(
        <QuizInterface
          assignment="1"
          mode="test-easy"
          questions={mockQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Test Easy')).toBeInTheDocument();
      });

      // Navigate to multiple-choice question (question 2)
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
      });

      // Should show checkboxes for multiple-choice question
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      // Select multiple correct answers
      const linearRegression = screen.getByText('Linear Regression');
      const decisionTrees = screen.getByText('Decision Trees');
      
      fireEvent.click(linearRegression.closest('label'));
      fireEvent.click(decisionTrees.closest('label'));

      // Show answer
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      fireEvent.click(showAnswerButton);

      // Both correct answers should be highlighted green
      await waitFor(() => {
        expect(linearRegression.closest('label')).toHaveClass('bg-green-100');
        expect(decisionTrees.closest('label')).toHaveClass('bg-green-100');
      });
    });
  });

  describe('Test Difficult Mode Flow', () => {
    test('should shuffle questions and options correctly', () => {
      // Test question shuffling
      const originalQuestions = [...mockQuestions];
      const shuffledQuestions = shuffleQuestions(mockQuestions);
      
      // Should return different order (with high probability)
      // Note: There's a small chance they could be the same, but very unlikely with 3+ items
      expect(shuffledQuestions).toHaveLength(originalQuestions.length);
      expect(shuffledQuestions).toEqual(expect.arrayContaining(originalQuestions));
    });

    test('should shuffle options within questions', () => {
      const originalQuestion = mockQuestions[0];
      const shuffledQuestion = shuffleQuestionOptions(originalQuestion);
      
      // Should have same options but potentially different order
      expect(shuffledQuestion.options).toHaveLength(originalQuestion.options.length);
      expect(shuffledQuestion.options).toEqual(expect.arrayContaining(originalQuestion.options));
      expect(shuffledQuestion.question).toBe(originalQuestion.question);
    });

    test('should prepare questions correctly for test-difficult mode', () => {
      const preparedQuestions = prepareQuestionsForMode(mockQuestions, 'test-difficult');
      
      // Should have same number of questions
      expect(preparedQuestions).toHaveLength(mockQuestions.length);
      
      // Should contain all original questions
      const originalQuestionTexts = mockQuestions.map(q => q.question);
      const preparedQuestionTexts = preparedQuestions.map(q => q.question);
      expect(preparedQuestionTexts).toEqual(expect.arrayContaining(originalQuestionTexts));
    });

    test('should complete test difficult mode with shuffled content', async () => {
      // Prepare shuffled questions
      const shuffledQuestions = prepareQuestionsForMode(mockQuestions, 'test-difficult');
      
      const onComplete = jest.fn();
      
      render(
        <QuizInterface
          assignment="1"
          mode="test-difficult"
          questions={shuffledQuestions}
          onComplete={onComplete}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Test Difficult')).toBeInTheDocument();
      });

      // Complete the quiz by answering all questions
      for (let i = 0; i < shuffledQuestions.length; i++) {
        // Select first option (for testing purposes)
        const options = screen.getAllByRole('button', { name: /^[A-D]\./i });
        fireEvent.click(options[0]);

        // Show answer
        const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
        fireEvent.click(showAnswerButton);

        // Move to next question or finish
        const nextButton = screen.getByRole('button', { name: /next|finish quiz/i });
        fireEvent.click(nextButton);

        if (i < shuffledQuestions.length - 1) {
          // Wait for next question
          await waitFor(() => {
            expect(screen.getByText(`Question ${i + 2} of ${shuffledQuestions.length}`)).toBeInTheDocument();
          });
        }
      }

      // Should complete
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Scoring and Validation', () => {
    test('should calculate scores correctly for single-choice questions', () => {
      const question = mockQuestions[0];
      const correctAnswer = ['A'];
      const incorrectAnswer = ['B'];

      expect(validateAnswer(question, correctAnswer)).toBe(true);
      expect(validateAnswer(question, incorrectAnswer)).toBe(false);
    });

    test('should calculate scores correctly for multiple-choice questions', () => {
      const question = mockQuestions[1]; // Multiple correct answers: A and B
      const correctAnswer = ['A', 'B'];
      const partialAnswer = ['A'];
      const incorrectAnswer = ['C', 'D'];

      expect(validateAnswer(question, correctAnswer)).toBe(true);
      expect(validateAnswer(question, partialAnswer)).toBe(false);
      expect(validateAnswer(question, incorrectAnswer)).toBe(false);
    });

    test('should calculate final quiz scores correctly', () => {
      const userAnswers = [
        { questionIndex: 0, selectedOptions: ['A'], isCorrect: true },
        { questionIndex: 1, selectedOptions: ['A', 'B'], isCorrect: true },
        { questionIndex: 2, selectedOptions: ['B'], isCorrect: false }
      ];

      const score = calculateTotalScore(userAnswers, mockQuestions);
      
      expect(score.correct).toBe(2);
      expect(score.total).toBe(3);
      expect(score.percentage).toBe(67); // 2/3 * 100 rounded
    });
  });

  describe('Navigation and UI Polish', () => {
    test('should handle previous/next navigation correctly', async () => {
      render(
        <QuizInterface
          assignment="1"
          mode="test-easy"
          questions={mockQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Test Easy')).toBeInTheDocument();
      });

      // Previous button should be disabled on first question
      const previousButton = screen.getByRole('button', { name: /previous/i });
      expect(previousButton).toBeDisabled();

      // Move to next question
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
      });

      // Previous button should now be enabled
      expect(previousButton).not.toBeDisabled();

      // Go back to previous question
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
      });
    });

    test('should show correct progress information', async () => {
      render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={mockQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      });

      // Progress bar should show correct percentage
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '33'); // 1/3 * 100 rounded
    });

    test('should display mode-specific instructions', async () => {
      // Test Learn Mode instructions
      render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={mockQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Learn Mode:/)).toBeInTheDocument();
        expect(screen.getByText(/Correct answers are highlighted in green/)).toBeInTheDocument();
      });
    });

    test('should handle keyboard navigation', async () => {
      render(
        <QuizInterface
          assignment="1"
          mode="test-easy"
          questions={mockQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Test Easy')).toBeInTheDocument();
      });

      // Test keyboard navigation on next button
      const nextButton = screen.getByRole('button', { name: /next/i });
      
      // Simulate Enter key press
      fireEvent.keyDown(nextButton, { key: 'Enter', code: 'Enter' });
      
      // Should move to next question
      await waitFor(() => {
        expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
      });
    });
  });

  describe('Mode Selector Integration', () => {
    test('should display all three learning modes with correct information', () => {
      const onBack = jest.fn();
      
      render(<ModeSelector assignmentNumber={1} onBack={onBack} />);

      // Should show all three modes
      expect(screen.getByText('Learn Mode')).toBeInTheDocument();
      expect(screen.getByText('Test Easy')).toBeInTheDocument();
      expect(screen.getByText('Test Difficult')).toBeInTheDocument();

      // Should show mode descriptions
      expect(screen.getByText(/Study with correct answers pre-highlighted/)).toBeInTheDocument();
      expect(screen.getByText(/Test your knowledge with questions in original order/)).toBeInTheDocument();
      expect(screen.getByText(/Challenge yourself with shuffled questions/)).toBeInTheDocument();
    });

    test('should navigate to quiz when mode is selected', () => {
      const onBack = jest.fn();
      
      render(<ModeSelector assignmentNumber={1} onBack={onBack} />);

      // Click on Learn Mode
      const learnModeButton = screen.getByRole('button', { name: /start learn mode/i });
      fireEvent.click(learnModeButton);

      // Should call router.push with correct path
      expect(mockRouter.push).toHaveBeenCalledWith('/quiz/1/learn');
    });
  });
});