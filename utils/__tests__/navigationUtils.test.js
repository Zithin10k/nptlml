/**
 * Navigation Utils Tests
 * Tests for routing validation and navigation helper functions
 */

import {
  ROUTES,
  VALID_ASSIGNMENTS,
  VALID_MODES,
  isValidAssignment,
  isValidMode,
  validateQuizParams,
  getModeDisplayName,
  getBreadcrumbs,
  validateCurrentRoute
} from '../navigationUtils';

describe('navigationUtils', () => {
  describe('Route constants', () => {
    test('ROUTES should provide correct route patterns', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.ASSIGNMENT(1)).toBe('/assignment/1');
      expect(ROUTES.QUIZ(1, 'learn')).toBe('/quiz/1/learn');
    });

    test('VALID_ASSIGNMENTS should contain correct assignment numbers', () => {
      expect(VALID_ASSIGNMENTS).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    test('VALID_MODES should contain correct mode identifiers', () => {
      expect(VALID_MODES).toEqual(['learn', 'test-easy', 'test-difficult']);
    });
  });

  describe('isValidAssignment', () => {
    test('should validate correct assignment numbers', () => {
      expect(isValidAssignment(1)).toBe(true);
      expect(isValidAssignment('3')).toBe(true);
      expect(isValidAssignment(7)).toBe(true);
    });

    test('should reject invalid assignment numbers', () => {
      expect(isValidAssignment(0)).toBe(false);
      expect(isValidAssignment(8)).toBe(false);
      expect(isValidAssignment('invalid')).toBe(false);
      expect(isValidAssignment(null)).toBe(false);
      expect(isValidAssignment(undefined)).toBe(false);
    });
  });

  describe('isValidMode', () => {
    test('should validate correct modes', () => {
      expect(isValidMode('learn')).toBe(true);
      expect(isValidMode('test-easy')).toBe(true);
      expect(isValidMode('test-difficult')).toBe(true);
    });

    test('should reject invalid modes', () => {
      expect(isValidMode('invalid')).toBe(false);
      expect(isValidMode('test')).toBe(false);
      expect(isValidMode('')).toBe(false);
      expect(isValidMode(null)).toBe(false);
      expect(isValidMode(undefined)).toBe(false);
    });
  });

  describe('validateQuizParams', () => {
    test('should validate correct quiz parameters', () => {
      const result = validateQuizParams(1, 'learn');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject invalid assignment', () => {
      const result = validateQuizParams(8, 'learn');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Assignment must be between 1 and 7');
    });

    test('should reject invalid mode', () => {
      const result = validateQuizParams(1, 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mode must be learn, test-easy, or test-difficult');
    });

    test('should reject both invalid assignment and mode', () => {
      const result = validateQuizParams(8, 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('getModeDisplayName', () => {
    test('should return correct display names for valid modes', () => {
      expect(getModeDisplayName('learn')).toBe('Learn Mode');
      expect(getModeDisplayName('test-easy')).toBe('Test Easy');
      expect(getModeDisplayName('test-difficult')).toBe('Test Difficult');
    });

    test('should return original value for invalid modes', () => {
      expect(getModeDisplayName('invalid')).toBe('invalid');
      expect(getModeDisplayName('')).toBe('');
    });
  });

  describe('getBreadcrumbs', () => {
    test('should return home breadcrumb for root path', () => {
      const breadcrumbs = getBreadcrumbs('/');
      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/' }
      ]);
    });

    test('should return assignment breadcrumbs', () => {
      const breadcrumbs = getBreadcrumbs('/assignment/1', { id: '1' });
      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Assignment 1', href: '/assignment/1' }
      ]);
    });

    test('should return quiz breadcrumbs', () => {
      const breadcrumbs = getBreadcrumbs('/quiz/1/learn', { assignment: '1', mode: 'learn' });
      expect(breadcrumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Assignment 1', href: '/assignment/1' },
        { label: 'Learn Mode', href: '/quiz/1/learn' }
      ]);
    });
  });

  describe('validateCurrentRoute', () => {
    test('should validate home route', () => {
      const result = validateCurrentRoute('/');
      expect(result.isValid).toBe(true);
    });

    test('should validate assignment route with valid params', () => {
      const result = validateCurrentRoute('/assignment/1', { id: '1' });
      expect(result.isValid).toBe(true);
    });

    test('should reject assignment route with invalid params', () => {
      const result = validateCurrentRoute('/assignment/8', { id: '8' });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid assignment');
    });

    test('should validate quiz route with valid params', () => {
      const result = validateCurrentRoute('/quiz/1/learn', { assignment: '1', mode: 'learn' });
      expect(result.isValid).toBe(true);
    });

    test('should reject quiz route with invalid params', () => {
      const result = validateCurrentRoute('/quiz/8/invalid', { assignment: '8', mode: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Assignment must be between 1 and 7');
    });

    test('should reject unknown routes', () => {
      const result = validateCurrentRoute('/unknown');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Unknown route');
    });
  });
});