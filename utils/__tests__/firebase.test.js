/**
 * Firebase Integration Tests
 * Tests for Firebase authentication and logging functions
 */

import { jest } from '@jest/globals';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({}))
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInAnonymously: jest.fn(() => Promise.resolve({
    user: { uid: 'test-user-id' }
  })),
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(() => 'mock-collection'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-doc-id' })),
  serverTimestamp: jest.fn(() => new Date())
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true))
}));

describe('Firebase Integration', () => {
  let firebaseModule;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to get fresh imports
    jest.resetModules();
  });

  test('should initialize Firebase configuration', async () => {
    const { initializeApp } = await import('firebase/app');
    firebaseModule = await import('../firebase.js');
    
    expect(initializeApp).toHaveBeenCalledWith(expect.objectContaining({
      apiKey: expect.stringContaining('AIzaSy'),
      authDomain: 'test-62511.firebaseapp.com',
      projectId: 'test-62511'
    }));
  });

  test('should sign in user successfully', async () => {
    const { signInAnonymously } = await import('firebase/auth');
    const { addDoc } = await import('firebase/firestore');
    firebaseModule = await import('../firebase.js');
    
    const result = await firebaseModule.signInUser('Test User');
    
    expect(signInAnonymously).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalled();
    expect(result).toEqual({
      user: { uid: 'test-user-id' },
      userName: 'Test User'
    });
  });

  test('should log test start event', async () => {
    const { addDoc } = await import('firebase/firestore');
    firebaseModule = await import('../firebase.js');
    
    // Mock auth.currentUser
    firebaseModule.auth.currentUser = { uid: 'test-user-id' };
    
    await firebaseModule.logTestStart('Test User', 'Assignment 1', 10);
    
    expect(addDoc).toHaveBeenCalledWith(
      'mock-collection',
      expect.objectContaining({
        event_type: 'test_start',
        user_name: 'Test User',
        user_id: 'test-user-id',
        test_type: 'Assignment 1',
        question_count: 10,
        timestamp: expect.anything()
      })
    );
  });

  test('should log test completion event', async () => {
    const { addDoc } = await import('firebase/firestore');
    firebaseModule = await import('../firebase.js');
    
    // Mock auth.currentUser
    firebaseModule.auth.currentUser = { uid: 'test-user-id' };
    
    await firebaseModule.logTestComplete('Test User', 'Assignment 1', 8, 10, 120);
    
    expect(addDoc).toHaveBeenCalledWith(
      'mock-collection',
      expect.objectContaining({
        event_type: 'test_complete',
        user_name: 'Test User',
        user_id: 'test-user-id',
        test_type: 'Assignment 1',
        score: 8,
        total_questions: 10,
        time_spent_seconds: 120,
        percentage: 80,
        timestamp: expect.anything()
      })
    );
  });

  test('should handle Firebase errors gracefully', async () => {
    const { signInAnonymously } = await import('firebase/auth');
    signInAnonymously.mockRejectedValueOnce(new Error('Firebase error'));
    
    firebaseModule = await import('../firebase.js');
    
    await expect(firebaseModule.signInUser('Test User')).rejects.toThrow('Firebase error');
  });

  test('should not log events when user is not authenticated', async () => {
    const { addDoc } = await import('firebase/firestore');
    firebaseModule = await import('../firebase.js');
    
    // Mock no authenticated user
    firebaseModule.auth.currentUser = null;
    
    await firebaseModule.logTestStart('Test User', 'Assignment 1', 10);
    
    // Should not call addDoc when user is not authenticated
    expect(addDoc).not.toHaveBeenCalled();
  });
});