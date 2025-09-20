/**
 * QuizInterface Component
 * Main quiz orchestrator that manages question flow, timing, and state
 * Handles the complete quiz experience from start to finish
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import Button from './Button';
import Container from './Container';
import ResultsScreen from './ResultsScreen';
import { navigate, getModeDisplayName } from '../utils/navigationUtils';
import { scrollToTop } from '../utils/scrollUtils';
import {
  createInitialQuizState,
  updateQuizStateWithAnswer,
  navigateToNextQuestion,
  navigateToPreviousQuestion,
  showQuestionFeedback,
  isCurrentQuestionAnswered,
  getCurrentQuestion,
  getCurrentQuestionAnswer,
  calculateTimeElapsed
} from '../utils/quizLogic';

export default function QuizInterface({ 
  assignment, 
  assignmentNumber,
  mode, 
  questions,
  title,
  subtitle,
  onComplete,
  showProgress = true,
  allowReview = false,
  customTheme = null
}) {
  const router = useRouter();
  const [quizState, setQuizState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completionData, setCompletionData] = useState(null);

  // Initialize quiz state when component mounts
  useEffect(() => {
    if (questions && questions.length > 0) {
      const assignmentId = assignment || assignmentNumber || 'mega';
      const initialState = createInitialQuizState(questions, assignmentId, mode);
      setQuizState(initialState);
      setIsLoading(false);
    }
  }, [questions, assignment, assignmentNumber, mode]);

  // Update current time every second for timer display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Memoized computed values (must be before early returns)
  const currentQuestion = quizState ? getCurrentQuestion(quizState) : null;
  const currentAnswer = quizState ? getCurrentQuestionAnswer(quizState) : [];
  const isAnswered = quizState ? isCurrentQuestionAnswered(quizState) : false;
  const canGoNext = quizState ? (quizState.mode === 'learn' || isAnswered) : false;
  const canGoPrevious = quizState ? quizState.currentQuestionIndex > 0 : false;
  const progressPercentage = quizState ? Math.round(((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100) : 0;
  
  // Calculate elapsed time for display
  const timeDisplay = useMemo(() => {
    if (!quizState) return '0:00';
    const elapsedSeconds = Math.floor((currentTime - quizState.startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const remainingSeconds = elapsedSeconds % 60;
    return `${elapsedMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [currentTime, quizState]);

  // Determine button text based on mode and state
  const nextButtonText = useMemo(() => {
    if (!quizState) return 'Next';
    if (quizState.mode !== 'learn' && isAnswered && !quizState.showFeedback) {
      return 'Show Answer';
    }
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
      return 'Finish Quiz';
    }
    return 'Next';
  }, [quizState, isAnswered]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleAnswerSelect = useCallback((selectedOptions) => {
    if (!quizState) return;
    
    const updatedState = updateQuizStateWithAnswer(
      quizState, 
      quizState.currentQuestionIndex, 
      selectedOptions
    );
    setQuizState(updatedState);
  }, [quizState]);

  const handleQuizComplete = useCallback((nextState) => {
    const timeElapsed = calculateTimeElapsed(nextState);
    const completionInfo = {
      quizState: nextState,
      timeElapsed
    };
    
    setCompletionData(completionInfo);
    
    if (onComplete) {
      // For mega test, pass score and total questions
      if (assignmentNumber === 'mega' || assignment === 'mega') {
        const score = nextState.answers.reduce((total, answer) => {
          if (answer && answer.length > 0) {
            const question = nextState.questions.find(q => q.questionnumber === answer[0].questionNumber);
            if (question) {
              const correctOptions = question.options.filter(opt => opt.iscorrect);
              const selectedCorrect = answer.filter(a => 
                correctOptions.some(correct => correct.optionnumber === a.optionNumber)
              );
              return total + (selectedCorrect.length === correctOptions.length && 
                            selectedCorrect.length === answer.length ? 1 : 0);
            }
          }
          return total;
        }, 0);
        
        onComplete(score, nextState.questions.length, nextState.answers);
      } else {
        onComplete(completionInfo);
      }
    }
  }, [onComplete, assignmentNumber, assignment]);

  // Handle next question navigation
  const handleNext = useCallback(() => {
    if (!quizState) return;

    // In test modes, show feedback first if not already shown
    if (quizState.mode !== 'learn' && !quizState.showFeedback && isCurrentQuestionAnswered(quizState)) {
      const stateWithFeedback = showQuestionFeedback(quizState);
      setQuizState(stateWithFeedback);
      return;
    }

    // Navigate to next question
    const nextState = navigateToNextQuestion(quizState);
    setQuizState(nextState);

    // Scroll to top when moving to next question
    scrollToTop();

    // If quiz is complete, prepare completion data
    if (nextState.isComplete) {
      handleQuizComplete(nextState);
    }
  }, [quizState, handleQuizComplete]);

  // Handle previous question navigation
  const handlePrevious = useCallback(() => {
    if (!quizState) return;
    
    const prevState = navigateToPreviousQuestion(quizState);
    setQuizState(prevState);

    // Scroll to top when moving to previous question
    scrollToTop();
  }, [quizState]);

  // Handle skip question (for learn mode)
  const handleSkip = useCallback(() => {
    if (!quizState) return;
    
    const nextState = navigateToNextQuestion(quizState);
    setQuizState(nextState);

    // Scroll to top when skipping question
    scrollToTop();

    // If quiz is complete, prepare completion data
    if (nextState.isComplete) {
      handleQuizComplete(nextState);
    }
  }, [quizState, handleQuizComplete]);

  // Handle back to mode selection
  const handleBackToModeSelection = useCallback(() => {
    const assignmentId = assignment || assignmentNumber;
    if (assignmentId === 'mega') {
      navigate.toHome(router);
    } else {
      navigate.toAssignment(router, assignmentId);
    }
  }, [router, assignment, assignmentNumber]);

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    navigate.toHome(router);
  }, [router]);

  // Handle retake quiz
  const handleRetakeQuiz = useCallback(() => {
    // Reset quiz state to initial state
    const assignmentId = assignment || assignmentNumber || 'mega';
    const initialState = createInitialQuizState(questions, assignmentId, mode);
    setQuizState(initialState);
    setCompletionData(null);
  }, [questions, assignment, assignmentNumber, mode]);

  // Handle results screen navigation
  const handleResultsBackToModeSelection = useCallback(() => {
    const assignmentId = assignment || assignmentNumber;
    if (assignmentId === 'mega') {
      navigate.toHome(router);
    } else {
      navigate.toAssignment(router, assignmentId);
    }
  }, [router, assignment, assignmentNumber]);

  const handleResultsBackToHome = useCallback(() => {
    navigate.toHome(router);
  }, [router]);

  // Loading state
  if (isLoading || !quizState) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </Container>
    );
  }

  // Quiz completion state
  if (quizState.isComplete && completionData) {
    return (
      <ResultsScreen
        quizState={completionData.quizState}
        timeElapsed={completionData.timeElapsed}
        onRetakeQuiz={handleRetakeQuiz}
        onBackToModeSelection={handleResultsBackToModeSelection}
        onBackToHome={handleResultsBackToHome}
      />
    );
  }



  return (
    <Container>
      <div className="min-h-screen py-8 scroll-container">
        {/* Header */}
        <div className={`mb-6 sm:mb-8 ${customTheme ? `bg-gradient-to-r ${customTheme.background} p-4 rounded-lg` : ''}`}>
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="text-center sm:text-left">
              <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 leading-tight ${
                customTheme ? 'text-gray-800' : 'text-gray-900'
              }`}>
                {title || `Assignment ${assignment || assignmentNumber} - ${getModeDisplayName(mode)}`}
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-700 mb-2">
                  {subtitle}
                </p>
              )}
              <p className="text-sm sm:text-base text-gray-600">
                Time: {timeDisplay}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              {(assignment !== 'mega' && assignmentNumber !== 'mega') && (
                <Button 
                  onClick={handleBackToModeSelection} 
                  variant="outline" 
                  size="sm"
                  className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                >
                  Mode Selection
                </Button>
              )}
              <Button 
                onClick={handleBackToHome} 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto min-h-[44px] touch-manipulation"
              >
                Home
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <ProgressBar
              current={quizState.currentQuestionIndex + 1}
              total={quizState.questions.length}
              percentage={progressPercentage}
              customTheme={customTheme}
            />
          )}
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswers={currentAnswer}
            showFeedback={quizState.showFeedback}
            mode={quizState.mode}
            onAnswerSelect={handleAnswerSelect}
            disabled={quizState.mode !== 'learn' && quizState.showFeedback}
          />
        )}

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mt-6 sm:mt-8">
          {/* Previous Button */}
          <div className="w-full sm:w-auto order-2 sm:order-1">
            <Button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              variant="outline"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px] touch-manipulation text-base sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' && canGoPrevious) {
                  handlePrevious();
                }
              }}
            >
              ← Previous
            </Button>
          </div>

          {/* Center buttons for learn mode */}
          {quizState.mode === 'learn' && (
            <div className="flex gap-2 w-full sm:w-auto order-3 sm:order-2">
              <Button
                onClick={handleSkip}
                variant="secondary"
                className="flex-1 sm:flex-none min-h-[48px] sm:min-h-[44px] touch-manipulation text-base sm:text-sm"
              >
                Skip
              </Button>
            </div>
          )}

          {/* Next Button */}
          <div className="w-full sm:w-auto order-1 sm:order-3">
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              variant="primary"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[44px] touch-manipulation text-base sm:text-sm font-semibold"
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' && canGoNext) {
                  handleNext();
                } else if (e.key === 'Enter' && canGoNext) {
                  handleNext();
                }
              }}
            >
              {nextButtonText} →
            </Button>
          </div>
        </div>

        {/* Mode-specific instructions */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
          <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {quizState.mode === 'learn' && (
              <p>
                <strong className="text-gray-800">Learn Mode:</strong> Correct answers are highlighted in green. 
                Use this mode to study and memorize the material.
              </p>
            )}
            {quizState.mode === 'test-easy' && (
              <p>
                <strong className="text-gray-800">Test Easy:</strong> Questions appear in their original order. 
                Select your answer and click &quot;Show Answer&quot; to see the correct response.
              </p>
            )}
            {quizState.mode === 'test-difficult' && (
              <p>
                <strong className="text-gray-800">Test Difficult:</strong> Questions and answer options are shuffled. 
                Select your answer and click &quot;Show Answer&quot; to see the correct response.
              </p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}