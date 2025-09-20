/**
 * Routing Integration Tests
 * Tests for complete navigation flow and routing logic
 */

import { navigate, ROUTES, validateQuizParams, isValidAssignment, isValidMode } from '../../utils/navigationUtils';



describe('Routing Integration', () => {

  describe('Navigation utilities', () => {
    test('navigate.toHome should call router.push with correct path', () => {
      const mockRouter = { push: jest.fn() };
      navigate.toHome(mockRouter);
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });

    test('navigate.toAssignment should call router.push with correct path', () => {
      const mockRouter = { push: jest.fn() };
      navigate.toAssignment(mockRouter, 1);
      expect(mockRouter.push).toHaveBeenCalledWith('/assignment/1');
    });

    test('navigate.toQuiz should call router.push with correct path', () => {
      const mockRouter = { push: jest.fn() };
      navigate.toQuiz(mockRouter, 1, 'learn');
      expect(mockRouter.push).toHaveBeenCalledWith('/quiz/1/learn');
    });
  });

  describe('Complete routing flow validation', () => {
    test('should validate complete user journey paths', () => {
      // Home -> Assignment -> Quiz flow
      const homeRoute = ROUTES.HOME;
      const assignmentRoute = ROUTES.ASSIGNMENT(1);
      const quizRoute = ROUTES.QUIZ(1, 'learn');

      expect(homeRoute).toBe('/');
      expect(assignmentRoute).toBe('/assignment/1');
      expect(quizRoute).toBe('/quiz/1/learn');
    });

    test('should validate all assignment numbers work in routing', () => {
      for (let i = 1; i <= 7; i++) {
        expect(isValidAssignment(i)).toBe(true);
        expect(ROUTES.ASSIGNMENT(i)).toBe(`/assignment/${i}`);
      }
    });

    test('should validate all modes work in routing', () => {
      const modes = ['learn', 'test-easy', 'test-difficult'];
      modes.forEach(mode => {
        expect(isValidMode(mode)).toBe(true);
        expect(ROUTES.QUIZ(1, mode)).toBe(`/quiz/1/${mode}`);
      });
    });

    test('should validate complete quiz parameter combinations', () => {
      const assignments = [1, 2, 3, 4, 5, 6, 7];
      const modes = ['learn', 'test-easy', 'test-difficult'];

      assignments.forEach(assignment => {
        modes.forEach(mode => {
          const validation = validateQuizParams(assignment, mode);
          expect(validation.isValid).toBe(true);
          expect(validation.errors).toEqual([]);
        });
      });
    });
  });

  describe('Route constants', () => {
    test('ROUTES should generate correct paths', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.ASSIGNMENT(1)).toBe('/assignment/1');
      expect(ROUTES.ASSIGNMENT(7)).toBe('/assignment/7');
      expect(ROUTES.QUIZ(1, 'learn')).toBe('/quiz/1/learn');
      expect(ROUTES.QUIZ(3, 'test-difficult')).toBe('/quiz/3/test-difficult');
    });
  });

  describe('Route parameter validation edge cases', () => {
    test('should handle boundary assignment numbers', () => {
      // Valid boundaries
      expect(isValidAssignment(1)).toBe(true);
      expect(isValidAssignment(7)).toBe(true);
      
      // Invalid boundaries
      expect(isValidAssignment(0)).toBe(false);
      expect(isValidAssignment(8)).toBe(false);
    });

    test('should handle string assignment numbers', () => {
      expect(isValidAssignment('1')).toBe(true);
      expect(isValidAssignment('7')).toBe(true);
      expect(isValidAssignment('0')).toBe(false);
      expect(isValidAssignment('8')).toBe(false);
      expect(isValidAssignment('abc')).toBe(false);
    });

    test('should validate complete error scenarios', () => {
      const invalidCombinations = [
        [0, 'learn'],
        [8, 'learn'],
        [1, 'invalid-mode'],
        ['invalid', 'learn'],
        [1, ''],
        ['', 'learn']
      ];

      invalidCombinations.forEach(([assignment, mode]) => {
        const validation = validateQuizParams(assignment, mode);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Navigation helper functions', () => {
    test('should provide consistent navigation interface', () => {
      const mockRouter = { 
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn()
      };

      // Test all navigation helpers
      navigate.toHome(mockRouter);
      expect(mockRouter.push).toHaveBeenCalledWith('/');

      navigate.toAssignment(mockRouter, 3);
      expect(mockRouter.push).toHaveBeenCalledWith('/assignment/3');

      navigate.toQuiz(mockRouter, 2, 'test-easy');
      expect(mockRouter.push).toHaveBeenCalledWith('/quiz/2/test-easy');

      navigate.back(mockRouter);
      expect(mockRouter.back).toHaveBeenCalled();

      navigate.replace(mockRouter, '/new-path');
      expect(mockRouter.replace).toHaveBeenCalledWith('/new-path');
    });
  });
});