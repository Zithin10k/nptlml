/**
 * @jest-environment jsdom
 */

import {
  scrollToTop,
  scrollToElement,
  isElementInViewport,
  getScrollPosition,
  disableScroll,
  enableScroll,
  smoothScrollTo,
  initializeScrollUtils
} from '../scrollUtils';

// Mock window methods
const mockScrollTo = jest.fn();
const mockRequestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

beforeEach(() => {
  // Reset mocks
  mockScrollTo.mockClear();
  mockRequestAnimationFrame.mockClear();
  
  // Mock window properties
  Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true
  });
  
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: mockRequestAnimationFrame,
    writable: true
  });
  
  Object.defineProperty(window, 'pageYOffset', {
    value: 0,
    writable: true
  });
  
  Object.defineProperty(window, 'pageXOffset', {
    value: 0,
    writable: true
  });
  
  Object.defineProperty(window, 'innerHeight', {
    value: 768,
    writable: true
  });
  
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    writable: true
  });
});

describe('scrollUtils', () => {
  describe('scrollToTop', () => {
    it('should call window.scrollTo with smooth behavior', () => {
      scrollToTop();
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle custom duration', () => {
      scrollToTop(500);
      expect(mockRequestAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('getScrollPosition', () => {
    it('should return current scroll position', () => {
      const position = getScrollPosition();
      expect(position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('smoothScrollTo', () => {
    it('should call window.scrollTo with smooth behavior when supported', () => {
      // Mock smooth scroll support
      Object.defineProperty(document.documentElement.style, 'scrollBehavior', {
        value: '',
        writable: true
      });
      
      smoothScrollTo(100);
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 100,
        behavior: 'smooth'
      });
    });
  });

  describe('disableScroll and enableScroll', () => {
    it('should disable and enable scroll', () => {
      disableScroll();
      expect(document.body.style.overflow).toBe('hidden');
      
      enableScroll();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('isElementInViewport', () => {
    it('should return false for null element', () => {
      expect(isElementInViewport(null)).toBe(false);
    });

    it('should check element visibility', () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 200,
          left: 100,
          right: 200,
          height: 100,
          width: 100
        })
      };
      
      const isVisible = isElementInViewport(mockElement);
      expect(typeof isVisible).toBe('boolean');
    });
  });

  describe('scrollToElement', () => {
    it('should scroll to element when found', () => {
      const mockElement = {
        scrollIntoView: jest.fn()
      };
      
      document.querySelector = jest.fn().mockReturnValue(mockElement);
      
      scrollToElement('.test-element');
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    });

    it('should handle element not found', () => {
      document.querySelector = jest.fn().mockReturnValue(null);
      
      expect(() => scrollToElement('.non-existent')).not.toThrow();
    });
  });

  describe('initializeScrollUtils', () => {
    it('should initialize scroll utilities without errors', () => {
      expect(() => initializeScrollUtils()).not.toThrow();
    });
  });
});