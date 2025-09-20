/**
 * Navigation Utilities
 * Centralized routing logic and navigation helpers
 * Provides consistent navigation patterns across the application
 */

/**
 * Navigation routes configuration
 */
export const ROUTES = {
  HOME: '/',
  ASSIGNMENT: (id) => `/assignment/${id}`,
  QUIZ: (assignment, mode) => `/quiz/${assignment}/${mode}`,
};

/**
 * Valid route parameters
 */
export const VALID_ASSIGNMENTS = [1, 2, 3, 4, 5, 6, 7];
export const VALID_MODES = ['learn', 'test-easy', 'test-difficult'];

/**
 * Validate assignment parameter
 * @param {string|number} assignment - Assignment parameter to validate
 * @returns {boolean} - True if valid assignment
 */
export function isValidAssignment(assignment) {
  const num = parseInt(assignment);
  return !isNaN(num) && VALID_ASSIGNMENTS.includes(num);
}

/**
 * Validate mode parameter
 * @param {string} mode - Mode parameter to validate
 * @returns {boolean} - True if valid mode
 */
export function isValidMode(mode) {
  return VALID_MODES.includes(mode);
}

/**
 * Validate quiz route parameters
 * @param {string|number} assignment - Assignment parameter
 * @param {string} mode - Mode parameter
 * @returns {object} - Validation result with isValid flag and errors
 */
export function validateQuizParams(assignment, mode) {
  const errors = [];
  
  if (!isValidAssignment(assignment)) {
    errors.push('Assignment must be between 1 and 7');
  }
  
  if (!isValidMode(mode)) {
    errors.push('Mode must be learn, test-easy, or test-difficult');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get display name for mode
 * @param {string} mode - Mode identifier
 * @returns {string} - Human-readable mode name
 */
export function getModeDisplayName(mode) {
  const modeMap = {
    'learn': 'Learn Mode',
    'test-easy': 'Test Easy',
    'test-difficult': 'Test Difficult'
  };
  return modeMap[mode] || mode;
}

/**
 * Navigation helper functions for consistent routing
 */
export const navigate = {
  toHome: (router) => router.push(ROUTES.HOME),
  toAssignment: (router, assignmentId) => router.push(ROUTES.ASSIGNMENT(assignmentId)),
  toQuiz: (router, assignment, mode) => router.push(ROUTES.QUIZ(assignment, mode)),
  back: (router) => router.back(),
  replace: (router, path) => router.replace(path)
};

/**
 * Get breadcrumb data for current route
 * @param {string} pathname - Current pathname
 * @param {object} params - Route parameters
 * @returns {array} - Breadcrumb items
 */
export function getBreadcrumbs(pathname, params = {}) {
  const breadcrumbs = [
    { label: 'Home', href: ROUTES.HOME }
  ];
  
  if (pathname.includes('/assignment/')) {
    breadcrumbs.push({
      label: `Assignment ${params.id}`,
      href: ROUTES.ASSIGNMENT(params.id)
    });
  }
  
  if (pathname.includes('/quiz/')) {
    breadcrumbs.push(
      {
        label: `Assignment ${params.assignment}`,
        href: ROUTES.ASSIGNMENT(params.assignment)
      },
      {
        label: getModeDisplayName(params.mode),
        href: ROUTES.QUIZ(params.assignment, params.mode)
      }
    );
  }
  
  return breadcrumbs;
}

/**
 * Check if current route is valid
 * @param {string} pathname - Current pathname
 * @param {object} params - Route parameters
 * @returns {object} - Validation result
 */
export function validateCurrentRoute(pathname, params = {}) {
  if (pathname === ROUTES.HOME) {
    return { isValid: true };
  }
  
  if (pathname.includes('/assignment/')) {
    return {
      isValid: isValidAssignment(params.id),
      error: !isValidAssignment(params.id) ? 'Invalid assignment' : null
    };
  }
  
  if (pathname.includes('/quiz/')) {
    const validation = validateQuizParams(params.assignment, params.mode);
    return {
      isValid: validation.isValid,
      error: validation.errors.join(', ')
    };
  }
  
  return { isValid: false, error: 'Unknown route' };
}