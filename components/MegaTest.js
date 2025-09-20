/**
 * MegaTest Component
 * Special test covering all 7 weeks with reward system
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';
import Button from './Button';
import { loadQuestions } from '../utils/dataLoader';
import { getUserName } from '../utils/storageUtils';

export default function MegaTest({ className = '' }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const userName = getUserName();

  useEffect(() => {
    // Count total questions across all assignments
    const countQuestions = async () => {
      try {
        const questions = await loadQuestions();
        setTotalQuestions(questions.length);
      } catch (error) {
        console.error('Error loading questions for mega test:', error);
        setTotalQuestions(70); // Fallback estimate
      }
    };
    countQuestions();
  }, []);

  const handleStartMegaTest = async () => {
    setIsStarting(true);
    
    // Navigate to mega test page
    router.push('/quiz/mega/practice');
  };

  return (
    <Card 
      className={`relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 ${className}`}
      padding="lg"
    >
      {/* Sparkle decorations */}
      <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-400 rounded-full sparkle-animation"></div>
      <div className="absolute top-8 right-8 w-2 h-2 bg-orange-400 rounded-full sparkle-animation" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-6 left-6 w-3 h-3 bg-yellow-500 rounded-full sparkle-animation" style={{animationDelay: '1s'}}></div>

      <div className="text-center relative z-10">
        {/* Mega Test Title */}
        <div className="mb-4">
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
            MEGA TEST
          </h3>
          <div className="text-lg font-semibold text-orange-700">
            Ultimate ML Challenge
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 space-y-2">
          <p className="text-gray-700 font-medium">
            Test your knowledge across all 7 weeks
          </p>
          <p className="text-sm text-gray-600">
            {totalQuestions} questions • All topics covered
          </p>
        </div>

        {/* Reward Section */}
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-yellow-300 shadow-inner">
          <div className="text-yellow-700 font-bold text-lg mb-2">
            SPECIAL REWARD
          </div>
          <div className="text-sm text-gray-700 mb-2">
            Score 60+ questions correct and win:
          </div>
          <div className="flex items-center justify-center space-x-2 text-orange-600 font-bold">
            <span className="text-2xl">200 Coins</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Claim your reward instantly!
          </div>
        </div>

        {/* Progress hint */}
        <div className="mb-6 text-sm text-gray-600">
          {userName ? `Ready for the challenge, ${userName}?` : 'Ready for the ultimate challenge?'}
        </div>

        {/* Start Button */}
        <Button
          variant="mega"
          size="lg"
          onClick={handleStartMegaTest}
          disabled={isStarting}
          className="w-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {isStarting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Starting...
            </div>
          ) : (
            'START MEGA TEST'
          )}
        </Button>

        {/* Hint text */}
        <div className="mt-3 text-xs text-gray-500">
          Hint: Review all assignments for best results
        </div>
      </div>
    </Card>
  );
}