/**
 * Mega Test Quiz Page
 * Special quiz covering all 7 weeks with reward system
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizInterface from '../../../../components/QuizInterface';
import RewardModal from '../../../../components/RewardModal';
import Container from '../../../../components/Container';
import { loadQuestions } from '../../../../utils/dataLoader';
import { shuffleArray } from '../../../../utils/shuffleUtils';
import { getUserName } from '../../../../utils/storageUtils';

export default function MegaTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const userName = getUserName();

  useEffect(() => {
    const loadMegaTestQuestions = async () => {
      try {
        setIsLoading(true);
        const allQuestions = await loadQuestions();
        
        // Get questions from all assignments (1-8)
        const megaQuestions = allQuestions.filter(q => {
          const assignmentNum = parseInt(q.assignmentnumber);
          return assignmentNum >= 1 && assignmentNum <= 8;
        });

        if (megaQuestions.length === 0) {
          throw new Error('No questions available for mega test');
        }

        // Shuffle questions for variety
        const shuffledQuestions = shuffleArray([...megaQuestions]);
        
        setQuestions(shuffledQuestions);
      } catch (err) {
        console.error('Error loading mega test questions:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMegaTestQuestions();
  }, []);

  const handleQuizComplete = (score, totalQuestions, answers) => {
    setFinalScore(score);
    setShowRewardModal(true);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleCloseRewardModal = () => {
    setShowRewardModal(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading Mega Test...</p>
            <p className="text-sm text-gray-500 mt-2">Preparing all {questions.length || '70+'} questions</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Unable to Load Mega Test
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackToHome}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <QuizInterface
        questions={questions}
        assignmentNumber="mega"
        mode="practice"
        title="MEGA TEST - Ultimate ML Challenge"
        subtitle={`All 8 weeks • ${questions.length} questions • Score 60+ for rewards!`}
        onComplete={handleQuizComplete}
        showProgress={true}
        allowReview={true}
        customTheme={{
          primary: 'from-yellow-500 to-orange-500',
          accent: 'yellow-600',
          background: 'from-yellow-50 to-orange-50'
        }}
      />
      
      <RewardModal
        isOpen={showRewardModal}
        onClose={handleCloseRewardModal}
        score={finalScore}
        totalQuestions={questions.length}
      />
    </>
  );
}