/**
 * Assignment Mode Selection Page
 * Displays mode selection interface for a specific assignment
 * Includes parameter validation and route protection
 */

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Container from '../../../components/Container';
import ModeSelector from '../../../components/ModeSelector';
import { loadQuestions } from '../../../utils/dataLoader';
import { filterQuestionsByAssignment } from '../../../utils/questionFilter';
import { isValidAssignment, navigate } from '../../../utils/navigationUtils';
import { getUserName } from '../../../utils/storageUtils';
import { trackPageView } from '../../../utils/analytics';

export default function AssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentNumber = params.id;
  const [isValidating, setIsValidating] = useState(true);
  const [hasQuestions, setHasQuestions] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleBack = () => {
    navigate.toHome(router);
  };

  // Validate assignment number and check for questions
  const assignmentNum = parseInt(assignmentNumber);
  const isValidAssignmentNumber = isValidAssignment(assignmentNumber);

  // Validate that assignment has questions
  useEffect(() => {
    async function validateAssignment() {
      if (!isValidAssignmentNumber) {
        setValidationError('Invalid assignment number');
        setIsValidating(false);
        return;
      }

      try {
        const questions = await loadQuestions();
        const assignmentQuestions = filterQuestionsByAssignment(questions, assignmentNumber);

        if (assignmentQuestions.length === 0) {
          setValidationError(`Assignment ${assignmentNumber} has no available questions`);
          setHasQuestions(false);
        } else {
          setHasQuestions(true);
        }
      } catch (error) {
        console.error('Error validating assignment:', error);
        setValidationError('Unable to load assignment data');
      } finally {
        setIsValidating(false);
      }
    }

    validateAssignment();
  }, [assignmentNumber, isValidAssignmentNumber]);

  // Track page view when component mounts
  useEffect(() => {
    if (!isValidating && hasQuestions) {
      const userName = getUserName();
      trackPageView(window.location.href, userName);
    }
  }, [isValidating, hasQuestions]);

  // Loading state
  if (isValidating) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating assignment...</p>
          </div>
        </div>
      </Container>
    );
  }

  // Invalid assignment or validation error
  if (!isValidAssignmentNumber || validationError || !hasQuestions) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">
              {!isValidAssignmentNumber ? 'Invalid Assignment' : 'Assignment Unavailable'}
            </h1>
            <p className="text-gray-600 mb-8">
              {validationError || 'Assignment number must be between 1 and 8.'}
            </p>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen py-8">
        <ModeSelector
          assignmentNumber={assignmentNum}
          onBack={handleBack}
        />
      </div>
    </Container>
  );
}