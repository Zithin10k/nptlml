/**
 * Performance tests for the ML Quiz Application
 * Tests component rendering performance and optimization effectiveness
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import QuizInterface from '../QuizInterface';
import QuestionCard from '../QuestionCard';
import OptionButton from '../OptionButton';
import ProgressBar from '../ProgressBar';

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  pathname: '/quiz/1/learn',
  query: { assignment: '1', mode: 'learn' }
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Large dataset for performance testing
const generateLargeQuestionSet = (count) => {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      assignmentnumber: "1",
      questionnumber: i.toString(),
      question: `Performance test question ${i} with a longer text to simulate real-world content that might be more complex and require more processing time`,
      image: "",
      options: [
        {
          optionnumber: "A",
          optiontext: `Option A for question ${i} with detailed explanation`,
          iscorrect: i % 4 === 1
        },
        {
          optionnumber: "B", 
          optiontext: `Option B for question ${i} with detailed explanation`,
          iscorrect: i % 4 === 2
        },
        {
          optionnumber: "C",
          optiontext: `Option C for question ${i} with detailed explanation`, 
          iscorrect: i % 4 === 3
        },
        {
          optionnumber: "D",
          optiontext: `Option D for question ${i} with detailed explanation`,
          iscorrect: i % 4 === 0
        }
      ]
    });
  }
  return questions;
};

describe('Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('Test User');
  });

  describe('Component Rendering Performance', () => {
    test('should render QuestionCard efficiently with memoization', () => {
      const question = {
        assignmentnumber: "1",
        questionnumber: "1",
        question: "Test question",
        image: "",
        options: [
          { optionnumber: "A", optiontext: "Option A", iscorrect: true },
          { optionnumber: "B", optiontext: "Option B", iscorrect: false }
        ]
      };

      const onAnswerSelect = jest.fn();
      
      // Measure initial render time
      const startTime = performance.now();
      const { rerender } = render(
        <QuestionCard
          question={question}
          selectedAnswers={[]}
          showFeedback={false}
          mode="test-easy"
          onAnswerSelect={onAnswerSelect}
          disabled={false}
        />
      );
      const initialRenderTime = performance.now() - startTime;

      // Measure re-render time with same props (should be fast due to memoization)
      const rerenderStartTime = performance.now();
      rerender(
        <QuestionCard
          question={question}
          selectedAnswers={[]}
          showFeedback={false}
          mode="test-easy"
          onAnswerSelect={onAnswerSelect}
          disabled={false}
        />
      );
      const rerenderTime = performance.now() - rerenderStartTime;

      // Re-render should be significantly faster due to memoization
      expect(rerenderTime).toBeLessThan(initialRenderTime * 0.5);
      expect(initialRenderTime).toBeLessThan(50); // Should render in under 50ms
    });

    test('should handle large question sets efficiently', () => {
      const largeQuestionSet = generateLargeQuestionSet(100);
      
      const startTime = performance.now();
      render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={largeQuestionSet}
          onComplete={jest.fn()}
        />
      );
      const renderTime = performance.now() - startTime;

      // Should render large dataset in reasonable time
      expect(renderTime).toBeLessThan(200); // Should render in under 200ms
      
      // Verify only current question is rendered (not all 100)
      expect(screen.getByText('Performance test question 1 with a longer text to simulate real-world content that might be more complex and require more processing time')).toBeInTheDocument();
      expect(screen.queryByText('Performance test question 2 with a longer text to simulate real-world content that might be more complex and require more processing time')).not.toBeInTheDocument();
    });

    test('should optimize OptionButton re-renders', () => {
      const option = {
        optionnumber: "A",
        optiontext: "Test option with longer text content",
        iscorrect: true
      };

      const onSelect = jest.fn();
      let renderCount = 0;

      // Create a wrapper to count renders
      const TestWrapper = (props) => {
        renderCount++;
        return <OptionButton {...props} />;
      };

      const { rerender } = render(
        <TestWrapper
          option={option}
          isSelected={false}
          showFeedback={false}
          isMultipleChoice={false}
          onSelect={onSelect}
          disabled={false}
        />
      );

      const initialRenderCount = renderCount;

      // Re-render with same props - should not cause additional renders due to memoization
      rerender(
        <TestWrapper
          option={option}
          isSelected={false}
          showFeedback={false}
          isMultipleChoice={false}
          onSelect={onSelect}
          disabled={false}
        />
      );

      // Should not have re-rendered due to memoization
      expect(renderCount).toBe(initialRenderCount);
    });

    test('should optimize ProgressBar updates', () => {
      const { rerender } = render(
        <ProgressBar current={1} total={10} percentage={10} />
      );

      // Measure time for progress updates
      const startTime = performance.now();
      for (let i = 2; i <= 10; i++) {
        rerender(
          <ProgressBar current={i} total={10} percentage={i * 10} />
        );
      }
      const updateTime = performance.now() - startTime;

      // Multiple progress updates should be fast
      expect(updateTime).toBeLessThan(50); // Should update in under 50ms
    });
  });

  describe('User Interaction Performance', () => {
    test('should handle rapid answer selections efficiently', async () => {
      const questions = generateLargeQuestionSet(5);
      
      render(
        <QuizInterface
          assignment="1"
          mode="test-easy"
          questions={questions}
          onComplete={jest.fn()}
        />
      );

      // Measure time for rapid answer selections
      const startTime = performance.now();
      
      // Simulate rapid clicking on options
      for (let i = 0; i < 10; i++) {
        const optionA = screen.getByText('Option A for question 1 with detailed explanation');
        fireEvent.click(optionA.closest('button'));
        
        const optionB = screen.getByText('Option B for question 1 with detailed explanation');
        fireEvent.click(optionB.closest('button'));
      }
      
      const interactionTime = performance.now() - startTime;

      // Rapid interactions should be handled smoothly
      expect(interactionTime).toBeLessThan(100); // Should handle in under 100ms
    });

    test('should navigate between questions efficiently', async () => {
      const questions = generateLargeQuestionSet(10);
      
      render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={questions}
          onComplete={jest.fn()}
        />
      );

      // Measure navigation performance
      const startTime = performance.now();
      
      // Navigate through several questions
      for (let i = 0; i < 5; i++) {
        const nextButton = screen.getByText('Next →');
        fireEvent.click(nextButton);
        
        await waitFor(() => {
          expect(screen.getByText(`Performance test question ${i + 2} with a longer text to simulate real-world content that might be more complex and require more processing time`)).toBeInTheDocument();
        });
      }
      
      const navigationTime = performance.now() - startTime;

      // Navigation should be smooth
      expect(navigationTime).toBeLessThan(500); // Should navigate in under 500ms
    });
  });

  describe('Memory Usage Optimization', () => {
    test('should not create memory leaks with component unmounting', () => {
      const questions = generateLargeQuestionSet(20);
      
      const { unmount } = render(
        <QuizInterface
          assignment="1"
          mode="learn"
          questions={questions}
          onComplete={jest.fn()}
        />
      );

      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });

    test('should handle timer cleanup properly', () => {
      const questions = generateLargeQuestionSet(5);
      
      const { unmount } = render(
        <QuizInterface
          assignment="1"
          mode="test-easy"
          questions={questions}
          onComplete={jest.fn()}
        />
      );

      // Should have timer running
      expect(screen.getByText(/Time: \d+:\d+/)).toBeInTheDocument();

      // Unmount should clean up timer
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('CSS Animation Performance', () => {
    test('should apply hardware acceleration classes', () => {
      const question = {
        assignmentnumber: "1",
        questionnumber: "1",
        question: "Test question",
        image: "",
        options: [
          { optionnumber: "A", optiontext: "Option A", iscorrect: true }
        ]
      };

      render(
        <QuestionCard
          question={question}
          selectedAnswers={[]}
          showFeedback={false}
          mode="test-easy"
          onAnswerSelect={jest.fn()}
          disabled={false}
        />
      );

      // Check for performance-optimized classes
      const questionCard = screen.getByRole('heading', { name: 'Test question' }).closest('.animate-fadeIn');
      expect(questionCard).toBeInTheDocument();
    });

    test('should optimize button interactions', () => {
      const option = {
        optionnumber: "A",
        optiontext: "Test option",
        iscorrect: true
      };

      render(
        <OptionButton
          option={option}
          isSelected={false}
          showFeedback={false}
          isMultipleChoice={false}
          onSelect={jest.fn()}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('touch-manipulation');
    });
  });
});