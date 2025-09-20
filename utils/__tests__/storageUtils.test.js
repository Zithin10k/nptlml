/**
 * Unit tests for local storage utilities
 * Tests user name persistence and preferences storage
 */

import {
  storeUserName,
  getUserName,
  isFirstTimeUser,
  clearUserName,
  storeUserPreferences,
  getUserPreferences,
  updateUserPreference,
  clearUserPreferences,
  clearAllUserData
} from '../storageUtils.js';

describe('storageUtils', () => {

  describe('storeUserName', () => {
    it('should store valid user name', () => {
      const result = storeUserName('John Doe');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('ml_quiz_user_name', 'John Doe');
    });

    it('should trim whitespace from user name', () => {
      const result = storeUserName('  Jane Smith  ');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('ml_quiz_user_name', 'Jane Smith');
    });

    it('should reject empty string', () => {
      const result = storeUserName('');
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject whitespace-only string', () => {
      const result = storeUserName('   ');
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject null input', () => {
      const result = storeUserName(null);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject undefined input', () => {
      const result = storeUserName(undefined);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject non-string input', () => {
      const result = storeUserName(123);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const result = storeUserName('John Doe');
      
      expect(result).toBe(false);
    });

    it('should store names with special characters', () => {
      const result = storeUserName('José María O\'Connor');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('ml_quiz_user_name', 'José María O\'Connor');
    });
  });

  describe('getUserName', () => {
    it('should retrieve stored user name', () => {
      localStorage.getItem.mockReturnValue('John Doe');
      
      const result = getUserName();
      
      expect(result).toBe('John Doe');
      expect(localStorage.getItem).toHaveBeenCalledWith('ml_quiz_user_name');
    });

    it('should return null when no name is stored', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = getUserName();
      
      expect(result).toBe(null);
    });

    it('should return null for empty string', () => {
      localStorage.getItem.mockReturnValue('');
      
      const result = getUserName();
      
      expect(result).toBe(null);
    });

    it('should trim retrieved name', () => {
      localStorage.getItem.mockReturnValue('  Jane Smith  ');
      
      const result = getUserName();
      
      expect(result).toBe('Jane Smith');
    });

    it('should return null for whitespace-only name', () => {
      localStorage.getItem.mockReturnValue('   ');
      
      const result = getUserName();
      
      expect(result).toBe(null);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = getUserName();
      
      expect(result).toBe(null);
    });
  });

  describe('isFirstTimeUser', () => {
    it('should return true when no name is stored', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = isFirstTimeUser();
      
      expect(result).toBe(true);
    });

    it('should return false when name is stored', () => {
      localStorage.getItem.mockReturnValue('John Doe');
      
      const result = isFirstTimeUser();
      
      expect(result).toBe(false);
    });

    it('should return true for empty stored name', () => {
      localStorage.getItem.mockReturnValue('');
      
      const result = isFirstTimeUser();
      
      expect(result).toBe(true);
    });

    it('should return true for whitespace-only stored name', () => {
      localStorage.getItem.mockReturnValue('   ');
      
      const result = isFirstTimeUser();
      
      expect(result).toBe(true);
    });
  });

  describe('clearUserName', () => {
    it('should remove user name from storage', () => {
      const result = clearUserName();
      
      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('ml_quiz_user_name');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = clearUserName();
      
      expect(result).toBe(false);
    });
  });

  describe('storeUserPreferences', () => {
    it('should store valid preferences object', () => {
      const preferences = { theme: 'dark', language: 'en' };
      const result = storeUserPreferences(preferences);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify(preferences)
      );
    });

    it('should store empty object', () => {
      const preferences = {};
      const result = storeUserPreferences(preferences);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify(preferences)
      );
    });

    it('should reject null input', () => {
      const result = storeUserPreferences(null);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should reject non-object input', () => {
      const result = storeUserPreferences('not an object');
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const result = storeUserPreferences({ theme: 'dark' });
      
      expect(result).toBe(false);
    });

    it('should store complex nested objects', () => {
      const preferences = {
        ui: { theme: 'dark', fontSize: 14 },
        quiz: { showHints: true, timeLimit: 300 },
        history: [1, 2, 3]
      };
      
      const result = storeUserPreferences(preferences);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify(preferences)
      );
    });
  });

  describe('getUserPreferences', () => {
    it('should retrieve stored preferences', () => {
      const preferences = { theme: 'dark', language: 'en' };
      localStorage.getItem.mockReturnValue(JSON.stringify(preferences));
      
      const result = getUserPreferences();
      
      expect(result).toEqual(preferences);
      expect(localStorage.getItem).toHaveBeenCalledWith('ml_quiz_user_preferences');
    });

    it('should return null when no preferences are stored', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = getUserPreferences();
      
      expect(result).toBe(null);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = getUserPreferences();
      
      expect(result).toBe(null);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = getUserPreferences();
      
      expect(result).toBe(null);
    });

    it('should handle empty string', () => {
      localStorage.getItem.mockReturnValue('');
      
      const result = getUserPreferences();
      
      expect(result).toBe(null);
    });
  });

  describe('updateUserPreference', () => {
    it('should update existing preference', () => {
      const existingPrefs = { theme: 'light', language: 'en' };
      localStorage.getItem.mockReturnValue(JSON.stringify(existingPrefs));
      
      const result = updateUserPreference('theme', 'dark');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify({ theme: 'dark', language: 'en' })
      );
    });

    it('should add new preference to existing object', () => {
      const existingPrefs = { theme: 'light' };
      localStorage.getItem.mockReturnValue(JSON.stringify(existingPrefs));
      
      const result = updateUserPreference('language', 'es');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify({ theme: 'light', language: 'es' })
      );
    });

    it('should create preferences object if none exists', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = updateUserPreference('theme', 'dark');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify({ theme: 'dark' })
      );
    });

    it('should handle storage errors gracefully', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ theme: 'light' }));
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const result = updateUserPreference('theme', 'dark');
      
      expect(result).toBe(false);
    });

    it('should handle corrupted existing preferences', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = updateUserPreference('theme', 'dark');
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ml_quiz_user_preferences',
        JSON.stringify({ theme: 'dark' })
      );
    });
  });

  describe('clearUserPreferences', () => {
    it('should remove preferences from storage', () => {
      const result = clearUserPreferences();
      
      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('ml_quiz_user_preferences');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = clearUserPreferences();
      
      expect(result).toBe(false);
    });
  });

  describe('clearAllUserData', () => {
    it('should clear both name and preferences', () => {
      const result = clearAllUserData();
      
      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith('ml_quiz_user_name');
      expect(localStorage.removeItem).toHaveBeenCalledWith('ml_quiz_user_preferences');
    });

    it('should return false if name clearing fails', () => {
      localStorage.removeItem.mockImplementation((key) => {
        if (key === 'ml_quiz_user_name') {
          throw new Error('Failed to clear name');
        }
      });
      
      const result = clearAllUserData();
      
      expect(result).toBe(false);
    });

    it('should return false if preferences clearing fails', () => {
      localStorage.removeItem.mockImplementation((key) => {
        if (key === 'ml_quiz_user_preferences') {
          throw new Error('Failed to clear preferences');
        }
      });
      
      const result = clearAllUserData();
      
      expect(result).toBe(false);
    });

    it('should return false if both operations fail', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = clearAllUserData();
      
      expect(result).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete user workflow', () => {
      // First time user
      expect(isFirstTimeUser()).toBe(true);
      
      // Store name
      expect(storeUserName('Alice Johnson')).toBe(true);
      localStorage.getItem.mockReturnValue('Alice Johnson');
      
      // No longer first time user
      expect(isFirstTimeUser()).toBe(false);
      expect(getUserName()).toBe('Alice Johnson');
      
      // Store preferences
      const preferences = { theme: 'dark', notifications: true };
      expect(storeUserPreferences(preferences)).toBe(true);
      localStorage.getItem.mockImplementation((key) => {
        if (key === 'ml_quiz_user_name') return 'Alice Johnson';
        if (key === 'ml_quiz_user_preferences') return JSON.stringify(preferences);
        return null;
      });
      
      expect(getUserPreferences()).toEqual(preferences);
      
      // Update preference
      const updatedPrefs = { ...preferences, theme: 'light' };
      expect(updateUserPreference('theme', 'light')).toBe(true);
      
      // Clear all data
      expect(clearAllUserData()).toBe(true);
    });

    it('should handle storage quota exceeded scenario', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });
      
      expect(storeUserName('John Doe')).toBe(false);
      expect(storeUserPreferences({ theme: 'dark' })).toBe(false);
      expect(updateUserPreference('theme', 'light')).toBe(false);
    });

    it('should handle browser with disabled localStorage', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      localStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      
      expect(getUserName()).toBe(null);
      expect(storeUserName('John')).toBe(false);
      expect(getUserPreferences()).toBe(null);
      expect(storeUserPreferences({})).toBe(false);
      expect(clearUserName()).toBe(false);
      expect(clearUserPreferences()).toBe(false);
      expect(clearAllUserData()).toBe(false);
    });
  });
});