/**
 * Quiz Interface Page
 * Main quiz page that handles the complete quiz experience
 * Loads questions, prepares them based on mode, and manages quiz flow
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Container from '../../../../components/Container';
import Button from '../../../../components/Button';
import QuizInterface from '../../../../components/QuizInterface';
import QuizErrorBoundary from '../../../../components/QuizErrorBoundary';
import DataErrorFallback from '../../../../components/DataErrorFallback';
import { loadQuestions, DataLoadError, DataValidationError } from '../../../../utils/dataLoader';
import { filterQuestionsByAssignment } from '../../../../utils/questionFilter';
import { prepareQuestionsForMode } from '../../../../utils/shuffleUtils';
import { validateQuizParams, navigate } from '../../../../utils/navigationUtils';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const { assignment, mode } = params;
  
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate route parameters
  const paramValidation = validateQuizParams(assignment, mode);
  const isValidParams = paramValidation.isValid;

  // Load and prepare questions
  useEffect(() => {
    async function loadAndPrepareQuestions() {
      if (!isValidParams) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load all questions with enhanced error handling
        const allQuestions = await loadQuestions();
        
        // Filter questions for the specific assignment
        const assignmentQuestions = filterQuestionsByAssignment(allQuestions, assignment);
        
        if (assignmentQuestions.length === 0) {
          throw new DataValidationError(
            `No questions found for assignment ${assignment}. This assignment may not exist or may not have any questions available.`,
            { assignment, availableAssignments: [...new Set(allQuestions.map(q => q.assignmentnumber))] }
          );
        }

        // Prepare questions based on the selected mode
        const preparedQuestions = prepareQuestionsForMode(assignmentQuestions, mode);
        
        if (preparedQuestions.length === 0) {
          throw new DataValidationError(
            `No questions could be prepared for assignment ${assignment} in ${mode} mode.`,
            { assignment, mode, originalCount: assignmentQuestions.length }
          );
        }
        
        setQuestions(preparedQuestions);
      } catch (err) {
        console.error('Error loading questions:', err);
        
        // Preserve custom error types
        if (err instanceof DataLoadError || err instanceof DataValidationError) {
          setError(err);
        } else {
          // Wrap unexpected errors
          setError(new DataLoadError(
            'An unexpected error occurred while loading the quiz.',
            err
          ));
        }
      } finally {
        setLoading(false);
      }
    }

    loadAndPrepareQuestions();
  }, [assignment, mode, isValidParams]);

  // Handle quiz completion
  const handleQuizComplete = ({ quizState, timeElapsed }) => {
    // Quiz completion is now handled within QuizInterface component
    // The ResultsScreen is displayed directly in the QuizInterface
    console.log('Quiz completed:', { quizState, timeElapsed });
  };

  const handleBack = () => {
    navigate.toAssignment(router, assignment);
  };

  const handleHome = () => {
    navigate.toHome(router);
  };

  // Invalid parameters
  if (!isValidParams) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Invalid Parameters</h1>
            <p className="text-gray-600 mb-8">
              {paramValidation.errors.join(' ')}
            </p>
            <div className="space-x-4">
              <Button onClick={handleBack} variant="outline">
                Back to Mode Selection
              </Button>
              <Button onClick={handleHome}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </Container>
    );
  }

  // Error state with enhanced error handling
  if (error) {
    return (
      <DataErrorFallback
        error={error}
        assignment={assignment}
        mode={mode}
        onRetry={() => {
          setError(null);
          setLoading(true);
          // Trigger re-load by updating a dependency
          window.location.reload();
        }}
      />
    );
  }

  // Render quiz interface with error boundary
  return (
    <QuizErrorBoundary assignment={assignment} mode={mode}>
      <QuizInterface
        assignment={assignment}
        mode={mode}
        questions={questions}
        onComplete={handleQuizComplete}
      />
    </QuizErrorBoundary>
  );
}