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
import { getUserName } from '../utils/storageUtils';
import { 
  trackAssignmentAttempt, 
  trackAssignmentCompletion, 
  trackQuestionAnswer, 
  trackEngagementTime,
  trackPageView 
} from '../utils/analytics';
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

      // Track assignment attempt
      const userName = getUserName();
      const assignmentName = assignmentId === 'mega' ? 'Mega Test' : `Assignment ${assignmentId}`;
      trackAssignmentAttempt(assignmentId, assignmentName, userName, mode);
      
      // Track page view
      trackPageView(window.location.href, userName);
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

    // Track question answer
    const userName = getUserName();
    const currentQ = getCurrentQuestion(quizState);
    if (currentQ && selectedOptions.length > 0) {
      // Check if answer is correct
      const correctOptions = currentQ.options.filter(opt => opt.iscorrect);
      const selectedCorrect = selectedOptions.filter(selected => 
        correctOptions.some(correct => correct.optionnumber === selected.optionNumber)
      );
      const isCorrect = selectedCorrect.length === correctOptions.length && 
                       selectedCorrect.length === selectedOptions.length;
      
      const assignmentId = assignment || assignmentNumber || 'mega';
      trackQuestionAnswer(
        currentQ.questionnumber, 
        isCorrect, 
        userName, 
        assignmentId, 
        quizState.currentQuestionIndex + 1
      );
    }
  }, [quizState, assignment, assignmentNumber]);

  const handleQuizComplete = useCallback((nextState) => {
    const timeElapsed = calculateTimeElapsed(nextState);
    const completionInfo = {
      quizState: nextState,
      timeElapsed
    };
    
    setCompletionData(completionInfo);

    // Track quiz completion
    const userName = getUserName();
    const assignmentId = assignment || assignmentNumber || 'mega';
    const assignmentName = assignmentId === 'mega' ? 'Mega Test' : `Assignment ${assignmentId}`;
    
    // Calculate score
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

    // Track completion
    trackAssignmentCompletion(
      assignmentId, 
      assignmentName, 
      userName, 
      mode, 
      score, 
      nextState.questions.length
    );

    // Track engagement time
    trackEngagementTime(assignmentId, Math.floor(timeElapsed / 1000), userName);
    
    if (onComplete) {
      // For mega test, pass score and total questions
      if (assignmentNumber === 'mega' || assignment === 'mega') {
        onComplete(score, nextState.questions.length, nextState.answers);
      } else {
        onComplete(completionInfo);
      }
    }
  }, [onComplete, assignmentNumber, assignment, mode]);

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
    <Container compact={true} size="full">
      <div className="single-viewport">
        {/* Compact Header */}
        <div className="single-viewport-header">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="compact-title text-gray-900">
                {title || `Assignment ${assignment || assignmentNumber} - ${getModeDisplayName(mode)}`}
              </h1>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Time: {timeDisplay}</span>
                <span>Q{quizState.currentQuestionIndex + 1}/{quizState.questions.length}</span>
              </div>
            </div>
            <div className="flex gap-1">
              {(assignment !== 'mega' && assignmentNumber !== 'mega') && (
                <Button 
                  onClick={handleBackToModeSelection} 
                  variant="outline" 
                  size="sm"
                  className="px-2 py-1 text-xs"
                >
                  Mode
                </Button>
              )}
              <Button 
                onClick={handleBackToHome} 
                variant="outline" 
                size="sm"
                className="px-2 py-1 text-xs"
              >
                Home
              </Button>
            </div>
          </div>

          {/* Compact Progress Bar */}
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Question Content */}
        <div className="single-viewport-content">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedAnswers={currentAnswer}
              showFeedback={quizState.showFeedback}
              mode={quizState.mode}
              onAnswerSelect={handleAnswerSelect}
              disabled={quizState.mode !== 'learn' && quizState.showFeedback}
              compact={true}
            />
          )}
        </div>

        {/* Floating Translucent Navigation */}
        <div className="floating-nav">
          <div className="flex justify-between items-center gap-2">
            <Button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              variant="outline"
              className="floating-nav-button-outline px-3 py-2 text-sm font-medium"
            >
              ← Prev
            </Button>

            {quizState.mode === 'learn' && (
              <Button
                onClick={handleSkip}
                variant="secondary"
                className="floating-nav-button-outline px-3 py-2 text-sm"
              >
                Skip
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              variant="primary"
              className="floating-nav-button px-4 py-2 text-sm font-semibold"
            >
              {nextButtonText} →
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}