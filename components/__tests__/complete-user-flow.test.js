/**
 * Complete User Flow End-to-End Tests
 * Tests the complete user experience from home page to quiz completion
 * Verifies all three learning modes work correctly with proper visual feedback
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import HomePage from '../HomePage';
import ModeSelector from '../ModeSelector';
import QuizInterface from '../QuizInterface';
import { prepareQuestionsForMode } from '../../utils/shuffleUtils';
import { calculateTotalScore } from '../../utils/scoringUtils';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock data loader
jest.mock('../../utils/dataLoader', () => ({
  loadQuestions: jest.fn(() => Promise.resolve([
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
  ]))
}));

// Mock storage utils
jest.mock('../../utils/storageUtils', () => ({
  getUserName: jest.fn(() => 'Test User'),
  setUserName: jest.fn(),
}));

describe('Complete User Flow Tests', () => {
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

  describe('Learn Mode Complete Flow', () => {
    test('should complete learn mode flow with correct visual feedback', async () => {
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
        }
      ];

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

      // In learn mode, correct answer should be pre-highlighted
      const correctOption = screen.getByText('A subset of AI');
      const correctButton = correctOption.closest('button');
      
      // Check that the correct option has green styling (learn mode feedback)
      expect(correctButton).toHaveClass('bg-green-50');
      expect(correctButton).toHaveClass('border-green-500');

      // Progress should show 1 of 1
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();

      // Click Next to complete the quiz
      const nextButton = screen.getByRole('button', { name: /finish quiz/i });
      fireEvent.click(nextButton);

      // Should complete the quiz
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    test('should allow skipping questions in learn mode', async () => {
      const mockQuestions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "What is machine learning?",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "A subset of AI", iscorrect: true },
            { optionnumber: "B", optiontext: "A programming language", iscorrect: false }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "2",
          question: "What is AI?",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Artificial Intelligence", iscorrect: true },
            { optionnumber: "B", optiontext: "Automated Integration", iscorrect: false }
          ]
        }
      ];

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
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });
    });
  });

  describe('Test Easy Mode Complete Flow', () => {
    test('should complete test easy mode with proper feedback sequence', async () => {
      const mockQuestions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "What is machine learning?",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "A subset of AI", iscorrect: true },
            { optionnumber: "B", optiontext: "A programming language", iscorrect: false }
          ]
        }
      ];

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

      // Initially, no answers should be highlighted
      const correctOption = screen.getByText('A subset of AI');
      const correctButton = correctOption.closest('button');
      expect(correctButton).not.toHaveClass('bg-green-50');

      // Select the correct answer
      fireEvent.click(correctButton);

      // Should show "Show Answer" button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
      });

      // Click "Show Answer"
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      fireEvent.click(showAnswerButton);

      // Now correct answer should be highlighted
      await waitFor(() => {
        expect(correctButton).toHaveClass('bg-green-50');
      });

      // Next button should now show "Finish Quiz"
      const finishButton = screen.getByRole('button', { name: /finish quiz/i });
      fireEvent.click(finishButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    test('should handle multiple-choice questions correctly in test easy mode', async () => {
      const mockQuestions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "Which are supervised learning algorithms?",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Linear Regression", iscorrect: true },
            { optionnumber: "B", optiontext: "Decision Trees", iscorrect: true },
            { optionnumber: "C", optiontext: "K-means", iscorrect: false },
            { optionnumber: "D", optiontext: "DBSCAN", iscorrect: false }
          ]
        }
      ];

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

      // Should show "Select all correct answers" for multiple-choice
      expect(screen.getByText('Select all correct answers:')).toBeInTheDocument();

      // Should have checkboxes for multiple-choice questions
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      // Select multiple correct answers
      const linearRegression = screen.getByText('Linear Regression');
      const decisionTrees = screen.getByText('Decision Trees');
      
      fireEvent.click(linearRegression.closest('button'));
      fireEvent.click(decisionTrees.closest('button'));

      // Show answer
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      fireEvent.click(showAnswerButton);

      // Both correct answers should be highlighted
      await waitFor(() => {
        expect(linearRegression.closest('button')).toHaveClass('bg-green-50');
        expect(decisionTrees.closest('button')).toHaveClass('bg-green-50');
      });
    });
  });

  describe('Test Difficult Mode Complete Flow', () => {
    test('should handle shuffled questions and options correctly', async () => {
      const originalQuestions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "What is machine learning?",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "A subset of AI", iscorrect: true },
            { optionnumber: "B", optiontext: "A programming language", iscorrect: false },
            { optionnumber: "C", optiontext: "A database system", iscorrect: false }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "2",
          question: "What is AI?",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Artificial Intelligence", iscorrect: true },
            { optionnumber: "B", optiontext: "Automated Integration", iscorrect: false }
          ]
        }
      ];

      // Prepare questions for test-difficult mode (this will shuffle them)
      const shuffledQuestions = prepareQuestionsForMode(originalQuestions, 'test-difficult');

      render(
        <QuizInterface
          assignment="1"
          mode="test-difficult"
          questions={shuffledQuestions}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Assignment 1 - Test Difficult')).toBeInTheDocument();
      });

      // Should show mode-specific instructions
      expect(screen.getByText(/Questions and answer options are shuffled/)).toBeInTheDocument();

      // Questions should still be functional despite shuffling
      // The first question displayed might be different due to shuffling
      const questionElements = screen.getAllByRole('heading', { level: 2 });
      expect(questionElements.length).toBe(1); // Should show one question at a time

      // Should be able to select an answer and get feedback
      const optionButtons = screen.getAllByRole('button', { name: /^[A-D]\./i });
      expect(optionButtons.length).toBeGreaterThan(0);

      // Select first option
      fireEvent.click(optionButtons[0]);

      // Should show "Show Answer" button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and UI Polish', () => {
    test('should handle previous/next navigation correctly', async () => {
      const mockQuestions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "Question 1",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Answer A", iscorrect: true },
            { optionnumber: "B", optiontext: "Answer B", iscorrect: false }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "2",
          question: "Question 2",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Answer A", iscorrect: true },
            { optionnumber: "B", optiontext: "Answer B", iscorrect: false }
          ]
        }
      ];

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

      // Select an answer and show feedback
      const firstOption = screen.getByText('Answer A');
      fireEvent.click(firstOption.closest('button'));
      
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      fireEvent.click(showAnswerButton);

      // Move to next question
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Question 2')).toBeInTheDocument();
      });

      // Previous button should now be enabled
      expect(previousButton).not.toBeDisabled();

      // Go back to previous question
      fireEvent.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('Question 1')).toBeInTheDocument();
      });
    });

    test('should show correct progress information', async () => {
      const mockQuestions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "Question 1",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Answer A", iscorrect: true }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "2",
          question: "Question 2",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Answer A", iscorrect: true }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "3",
          question: "Question 3",
          image: "",
          options: [
            { optionnumber: "A", optiontext: "Answer A", iscorrect: true }
          ]
        }
      ];

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

      // Move to next question
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
      });

      // Progress should update
      expect(progressBar).toHaveAttribute('aria-valuenow', '67'); // 2/3 * 100 rounded
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

      // Should show features for each mode
      expect(screen.getByText('Correct answers shown immediately')).toBeInTheDocument();
      expect(screen.getByText('Questions in original order')).toBeInTheDocument();
      expect(screen.getByText('Questions and options shuffled')).toBeInTheDocument();
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

  describe('Scoring Integration', () => {
    test('should calculate scores correctly for mixed answers', () => {
      const userAnswers = [
        { selectedOptions: ['A'] }, // Correct single-choice
        { selectedOptions: ['A', 'B'] }, // Correct multiple-choice
        { selectedOptions: ['B'] } // Incorrect single-choice
      ];

      const questions = [
        {
          assignmentnumber: "1",
          questionnumber: "1",
          question: "Single choice question",
          options: [
            { optionnumber: "A", optiontext: "Correct", iscorrect: true },
            { optionnumber: "B", optiontext: "Wrong", iscorrect: false }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "2",
          question: "Multiple choice question",
          options: [
            { optionnumber: "A", optiontext: "Correct 1", iscorrect: true },
            { optionnumber: "B", optiontext: "Correct 2", iscorrect: true },
            { optionnumber: "C", optiontext: "Wrong", iscorrect: false }
          ]
        },
        {
          assignmentnumber: "1",
          questionnumber: "3",
          question: "Another single choice",
          options: [
            { optionnumber: "A", optiontext: "Wrong", iscorrect: false },
            { optionnumber: "B", optiontext: "Correct", iscorrect: false }
          ]
        }
      ];

      const score = calculateTotalScore(userAnswers, questions);
      
      expect(score.correct).toBe(2);
      expect(score.total).toBe(3);
      expect(score.percentage).toBe(67);
      expect(score.questionScores).toHaveLength(3);
      expect(score.questionScores[0].isCorrect).toBe(true);
      expect(score.questionScores[1].isCorrect).toBe(true);
      expect(score.questionScores[2].isCorrect).toBe(false);
    });
  });
});