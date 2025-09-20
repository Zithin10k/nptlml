/**
 * Scroll Utilities
 * Helper functions for managing scroll behavior in the application
 */

/**
 * Smoothly scroll to the top of the page
 * @param {number} duration - Animation duration in milliseconds (default: 300)
 */
export const scrollToTop = (duration = 300) => {
  if (typeof window === 'undefined') return;

  const startPosition = window.pageYOffset;
  const startTime = performance.now();

  const animateScroll = (currentTime) => {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeInOutCubic = progress => 
      progress < 0.5 
        ? 4 * progress * progress * progress 
        : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
    
    const currentPosition = startPosition * (1 - easeInOutCubic(progress));
    window.scrollTo(0, currentPosition);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Scroll to a specific element
 * @param {string|Element} element - Element selector or element reference
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
  if (typeof window === 'undefined') return;

  const targetElement = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;

  if (!targetElement) return;

  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest',
    ...options
  };

  targetElement.scrollIntoView(defaultOptions);
};

/**
 * Check if an element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {boolean} - Whether element is visible
 */
export const isElementInViewport = (element, threshold = 0) => {
  if (typeof window === 'undefined' || !element) return false;

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  const verticalVisible = (rect.top + rect.height * threshold) < windowHeight && 
                         (rect.bottom - rect.height * threshold) > 0;
  const horizontalVisible = (rect.left + rect.width * threshold) < windowWidth && 
                           (rect.right - rect.width * threshold) > 0;

  return verticalVisible && horizontalVisible;
};

/**
 * Get current scroll position
 * @returns {Object} - Current scroll position {x, y}
 */
export const getScrollPosition = () => {
  if (typeof window === 'undefined') return { x: 0, y: 0 };

  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
};

/**
 * Disable scroll (useful for modals)
 */
export const disableScroll = () => {
  if (typeof window === 'undefined') return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  window.onscroll = () => {
    window.scrollTo(scrollLeft, scrollTop);
  };

  document.body.style.overflow = 'hidden';
};

/**
 * Enable scroll (restore after modal)
 */
export const enableScroll = () => {
  if (typeof window === 'undefined') return;

  window.onscroll = null;
  document.body.style.overflow = '';
};

/**
 * Smooth scroll with fallback for older browsers
 * @param {number} top - Target scroll position
 * @param {number} duration - Animation duration
 */
export const smoothScrollTo = (top, duration = 300) => {
  if (typeof window === 'undefined') return;

  // Check if browser supports smooth scrolling
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  } else {
    // Fallback for older browsers
    scrollToTop(duration);
  }
};

/**
 * Fix scroll issues on mobile devices
 */
export const fixMobileScroll = () => {
  if (typeof window === 'undefined') return;

  // Fix iOS viewport height issues
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  // Prevent zoom on double tap for iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

/**
 * Initialize scroll utilities
 * Call this once when the app starts
 */
export const initializeScrollUtils = () => {
  if (typeof window === 'undefined') return;

  // Fix mobile scroll issues
  fixMobileScroll();

  // Add scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Ensure smooth scrolling is enabled
  document.documentElement.style.scrollBehavior = 'smooth';
};