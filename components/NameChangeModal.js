/**
 * NameChangeModal Component
 * Allows users to change their stored name
 */

import { useState } from 'react';
import { storeUserName, clearUserName } from '../utils/storageUtils';
import { trackNameChange } from '../utils/analytics';
import Button from './Button';
import Card from './Card';

export default function NameChangeModal({ currentName, onNameChange, onClose }) {
  const [name, setName] = useState(currentName || '');
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
      // Store the new name in local storage
      const success = storeUserName(name.trim());
      
      if (success) {
        // Track name change
        trackNameChange(currentName, name.trim());
        
        // Call the callback with the new name
        onNameChange(name.trim());
        onClose();
      } else {
        setError('Failed to save your name. Please try again.');
      }
    } catch (error) {
      console.error('Error updating name:', error);
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

  const handleClearName = async () => {
    setIsSubmitting(true);
    
    try {
      const success = clearUserName();
      
      if (success) {
        // Track name clearing
        trackNameChange(currentName, null);
        
        onNameChange('');
        onClose();
      } else {
        setError('Failed to clear your name. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing name:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-20 flex items-center justify-center p-4 z-50 touch-manipulation">
      <Card className="w-full max-w-md mx-4 modal-scroll-fix">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Change Your Name
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Update your name for personalized messages.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label 
              htmlFor="name-change-input" 
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              id="name-change-input"
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
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 min-h-[48px] touch-manipulation"
              size="lg"
            >
              {isSubmitting ? 'Saving...' : 'Update Name'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 min-h-[48px] touch-manipulation"
              size="lg"
            >
              Cancel
            </Button>
          </div>
          
          {currentName && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="danger"
                onClick={handleClearName}
                disabled={isSubmitting}
                className="w-full text-sm min-h-[48px] touch-manipulation"
                size="lg"
              >
                Clear Name (Reset to First-Time User)
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}