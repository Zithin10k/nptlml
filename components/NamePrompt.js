/**
 * NamePrompt Component
 * Collects user name on first visit and stores it in local storage
 */

import { useState } from 'react';
import { storeUserName } from '../utils/storageUtils';
import Button from './Button';
import Card from './Card';

export default function NamePrompt({ onNameSubmit }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError('');
    
    // Validate name input
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (name.trim().length > 50) {
      setError('Name must be less than 50 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store the name in local storage
      const success = storeUserName(name.trim());
      
      if (success) {
        // Call the callback with the stored name
        onNameSubmit(name.trim());
      } else {
        setError('Failed to save your name. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting name:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-20 flex items-center justify-center p-4 z-50 touch-manipulation">
      <Card className="w-full max-w-md mx-4 modal-scroll-fix">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Welcome to ML Quiz App!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Please enter your name to get started with personalized quizzes.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label 
              htmlFor="name-input" 
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 sm:px-3 sm:py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm min-h-[48px] sm:min-h-[40px] touch-manipulation ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              autoFocus
              maxLength={50}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full min-h-[48px] touch-manipulation"
            size="lg"
          >
            {isSubmitting ? 'Saving...' : 'Get Started'}
          </Button>
        </form>
        
        <p className="text-xs sm:text-sm text-gray-500 text-center mt-4 leading-relaxed">
          Your name will be stored locally in your browser for personalization.
        </p>
      </Card>
    </div>
  );
}