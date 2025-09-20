/**
 * RewardModal Component
 * Displays reward animation and claim button
 */

'use client';

import { useState } from 'react';
import Button from './Button';

export default function RewardModal({ isOpen, onClose, score, totalQuestions }) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (!isOpen) return null;

  const isEligible = score >= 60;
  const percentage = Math.round((score / totalQuestions) * 100);

  const handleClaim = async () => {
    setIsClaiming(true);
    
    // Simulate claim process
    setTimeout(() => {
      setClaimed(true);
      setIsClaiming(false);
      
      // Redirect to the provided link
      setTimeout(() => {
        window.open('https://dl.popclub.co/oZ5Lg9qDHWb', '_blank');
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 opacity-50"></div>
        
        {/* Floating coins animation */}
        {isEligible && !claimed && (
          <>
            <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full coin-animation" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-8 right-6 w-6 h-6 bg-yellow-500 rounded-full coin-animation" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute bottom-12 left-8 w-7 h-7 bg-orange-400 rounded-full coin-animation" style={{animationDelay: '0.6s'}}></div>
            <div className="absolute bottom-8 right-4 w-5 h-5 bg-yellow-600 rounded-full coin-animation" style={{animationDelay: '0.9s'}}></div>
          </>
        )}

        <div className="relative z-10">
          {/* Results */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Mega Test Complete!
            </h2>
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-xl text-gray-600">
              {percentage}% Correct
            </div>
          </div>

          {/* Reward Section */}
          {isEligible ? (
            <div className="mb-6">
              {!claimed ? (
                <>
                  <div className="reward-container rounded-xl p-6 mb-4 gift-animation">
                    <div className="text-white text-2xl font-bold mb-2">
                      CONGRATULATIONS!
                    </div>
                    <div className="text-white text-lg mb-3">
                      You've earned your reward!
                    </div>
                    <div className="flex items-center justify-center space-x-3 text-white font-bold text-xl">
                      <span>200 Coins</span>
                      <span>+</span>
                      <span>5 Rs</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="mega"
                    size="lg"
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="w-full font-bold text-lg"
                  >
                    {isClaiming ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Claiming Reward...
                      </div>
                    ) : (
                      'CLAIM REWARD'
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    Reward Claimed!
                  </div>
                  <div className="text-gray-600">
                    Redirecting to claim your prize...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="text-gray-700 font-semibold mb-2">
                Almost there!
              </div>
              <div className="text-sm text-gray-600">
                You need 60+ correct answers to earn the reward.
                <br />
                Try again to claim your prize!
              </div>
            </div>
          )}

          {/* Close Button */}
          {!isClaiming && !claimed && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              {isEligible ? 'Close' : 'Try Again Later'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}