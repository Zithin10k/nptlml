/**
 * Local storage utility functions for user name and preferences
 * Handles persistent storage of user data across browser sessions
 */

// Storage keys
const STORAGE_KEYS = {
  USER_NAME: 'ml_quiz_user_name',
  USER_PREFERENCES: 'ml_quiz_user_preferences'
};

/**
 * Check if we're running on the client side (browser)
 * @returns {boolean} True if client-side, false if server-side
 */
function isClientSide() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Stores the user's name in local storage
 * @param {string} name - User's name to store
 * @returns {boolean} True if successful, false otherwise
 */
export function storeUserName(name) {
  try {
    if (!isClientSide()) {
      return false;
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.warn('Invalid name provided for storage');
      return false;
    }
    
    const trimmedName = name.trim();
    localStorage.setItem(STORAGE_KEYS.USER_NAME, trimmedName);
    return true;
  } catch (error) {
    console.error('Error storing user name:', error);
    return false;
  }
}

/**
 * Retrieves the user's name from local storage
 * @returns {string|null} User's name if found, null otherwise
 */
export function getUserName() {
  try {
    if (!isClientSide()) {
      return null;
    }
    
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    return name && name.trim().length > 0 ? name.trim() : null;
  } catch (error) {
    console.error('Error retrieving user name:', error);
    return null;
  }
}

/**
 * Checks if this is the user's first visit (no stored name)
 * @returns {boolean} True if first visit, false otherwise
 */
export function isFirstTimeUser() {
  return getUserName() === null;
}

/**
 * Clears the stored user name
 * @returns {boolean} True if successful, false otherwise
 */
export function clearUserName() {
  try {
    if (!isClientSide()) {
      return false;
    }
    
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    return true;
  } catch (error) {
    console.error('Error clearing user name:', error);
    return false;
  }
}

/**
 * Stores user preferences in local storage
 * @param {Object} preferences - User preferences object
 * @returns {boolean} True if successful, false otherwise
 */
export function storeUserPreferences(preferences) {
  try {
    if (!preferences || typeof preferences !== 'object') {
      console.warn('Invalid preferences provided for storage');
      return false;
    }
    
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Error storing user preferences:', error);
    return false;
  }
}

/**
 * Retrieves user preferences from local storage
 * @returns {Object|null} User preferences object if found, null otherwise
 */
export function getUserPreferences() {
  try {
    const preferencesStr = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!preferencesStr) {
      return null;
    }
    
    return JSON.parse(preferencesStr);
  } catch (error) {
    console.error('Error retrieving user preferences:', error);
    return null;
  }
}

/**
 * Updates specific user preference
 * @param {string} key - Preference key to update
 * @param {any} value - New value for the preference
 * @returns {boolean} True if successful, false otherwise
 */
export function updateUserPreference(key, value) {
  try {
    const currentPreferences = getUserPreferences() || {};
    currentPreferences[key] = value;
    const result = storeUserPreferences(currentPreferences);
    if (!result) {
      throw new Error('Failed to store updated preferences');
    }
    return result;
  } catch (error) {
    console.error('Error updating user preference:', error);
    return false;
  }
}

/**
 * Clears all stored user preferences
 * @returns {boolean} True if successful, false otherwise
 */
export function clearUserPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    return true;
  } catch (error) {
    console.error('Error clearing user preferences:', error);
    return false;
  }
}

/**
 * Clears all stored user data (name and preferences)
 * @returns {boolean} True if successful, false otherwise
 */
export function clearAllUserData() {
  try {
    const nameCleared = clearUserName();
    const preferencesCleared = clearUserPreferences();
    const success = nameCleared && preferencesCleared;
    if (!success) {
      throw new Error('Failed to clear all user data');
    }
    return success;
  } catch (error) {
    console.error('Error clearing all user data:', error);
    return false;
  }
}