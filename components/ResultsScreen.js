/**
 * ResultsScreen Component
 * Displays final scores, time taken, and personalized completion messages
 * Provides navigation options to retake quiz or return to assignment selection
 */

'use client';

import { useEffect, useState } from 'react';
import Button from './Button';
import Container from './Container';
import { getUserName } from '../utils/storageUtils';
import { calculateTotalScore } from '../utils/scoringUtils';
import { getModeDisplayName } from '../utils/navigationUtils';

export default function ResultsScreen({
  quizState,
  timeElapsed,
  onRetakeQuiz,
  onBackToModeSelection,
  onBackToHome
}) {
  const [userName, setUserName] = useState('');
  const [score, setScore] = useState(null);

  // Load user name and calculate score on component mount
  useEffect(() => {
    const storedName = getUserName();
    setUserName(storedName || 'Student');

    if (quizState && quizState.userAnswers && quizState.questions) {
      const calculatedScore = calculateTotalScore(quizState.userAnswers, quizState.questions);
      setScore(calculatedScore);
    }
  }, [quizState]);

  // Format time elapsed for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    } else if (minutes === 1 && remainingSeconds === 0) {
      return '1 minute';
    } else if (remainingSeconds === 0) {
      return `${minutes} minutes`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };



  // Get personalized completion message based on score
  const getCompletionMessage = () => {
    if (!score) return `Great job, ${userName}!`;
    
    const { percentage } = score;
    
    if (percentage >= 90) {
      return `Outstanding work, ${userName}! You've mastered this material!`;
    } else if (percentage >= 80) {
      return `Excellent job, ${userName}! You're doing great!`;
    } else if (percentage >= 70) {
      return `Good work, ${userName}! You're making solid progress!`;
    } else if (percentage >= 60) {
      return `Nice effort, ${userName}! Keep practicing to improve!`;
    } else {
      return `Keep going, ${userName}! Practice makes perfect!`;
    }
  };

  // Get score color based on percentage
  const getScoreColor = () => {
    if (!score) return 'text-blue-600';
    
    const { percentage } = score;
    
    if (percentage >= 80) {
      return 'text-green-600';
    } else if (percentage >= 60) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  // Loading state
  if (!score) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating results...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center py-6 sm:py-8">
        <div className="max-w-2xl w-full">
          {/* Main Results Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center results-enter">
            {/* Completion Icon */}
            <div className="mb-4 sm:mb-6">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Quiz Complete!
            </h1>

            {/* Assignment and Mode Info */}
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
              Assignment {quizState.assignment} - {getModeDisplayName(quizState.mode)}
            </p>

            {/* Personalized Message */}
            <p className="text-lg sm:text-xl text-gray-800 mb-6 sm:mb-8 font-medium leading-relaxed px-2">
              {getCompletionMessage()}
            </p>

            {/* Score Display */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 score-counter">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Score */}
                <div className="text-center sm:text-left">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Your Score
                  </h3>
                  <div className={`text-3xl sm:text-4xl font-bold ${getScoreColor()} mb-1`}>
                    {score.percentage}%
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">
                    {score.correct} out of {score.total} correct
                  </p>
                </div>

                {/* Time */}
                <div className="text-center sm:text-left">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Time Taken
                  </h3>
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
                    {formatTime(timeElapsed)}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">
                    Total completion time
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Badge */}
            {score.percentage >= 80 && (
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Excellent Performance!
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="space-y-3 sm:space-y-4">
              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={onRetakeQuiz}
                  variant="primary"
                  className="flex-1 min-h-[48px] touch-manipulation"
                  size="lg"
                >
                  Retake Quiz
                </Button>
                <Button
                  onClick={onBackToModeSelection}
                  variant="outline"
                  className="flex-1 min-h-[48px] touch-manipulation"
                  size="lg"
                >
                  Try Different Mode
                </Button>
              </div>

              {/* Secondary Action */}
              <Button
                onClick={onBackToHome}
                variant="secondary"
                className="w-full min-h-[48px] touch-manipulation"
                size="lg"
              >
                Back to Home
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 sm:mt-6 text-center text-sm sm:text-base text-gray-500 px-4">
            <p>
              Want to improve your score? Try the quiz again or explore other assignments!
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}