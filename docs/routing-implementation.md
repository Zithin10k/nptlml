# Routing Implementation Documentation

## Overview

This document describes the complete routing implementation for the ML Quiz App, including Next.js App Router integration, parameter validation, and navigation flow.

## Route Structure

### App Router File Structure
```
app/
├── layout.js                    # Root layout with global error boundary
├── page.js                      # Home page (assignment selection)
├── assignment/
│   └── [id]/
│       └── page.js              # Mode selection for specific assignment
└── quiz/
    └── [assignment]/
        └── [mode]/
            └── page.js          # Quiz interface
```

### Route Patterns

| Route | Pattern | Description |
|-------|---------|-------------|
| Home | `/` | Assignment selection page |
| Assignment | `/assignment/[id]` | Mode selection for assignment 1-7 |
| Quiz | `/quiz/[assignment]/[mode]` | Quiz interface with specific assignment and mode |

## Parameter Validation

### Assignment Parameters
- **Valid values**: 1, 2, 3, 4, 5, 6, 7
- **Validation**: `isValidAssignment(assignment)`
- **Error handling**: Invalid assignments show error page with navigation back to home

### Mode Parameters
- **Valid values**: `learn`, `test-easy`, `test-difficult`
- **Validation**: `isValidMode(mode)`
- **Error handling**: Invalid modes show error page with navigation options

### Combined Validation
- **Function**: `validateQuizParams(assignment, mode)`
- **Returns**: `{ isValid: boolean, errors: string[] }`
- **Usage**: Used in quiz page to validate both parameters simultaneously

## Navigation Utilities

### Route Constants
```javascript
export const ROUTES = {
  HOME: '/',
  ASSIGNMENT: (id) => `/assignment/${id}`,
  QUIZ: (assignment, mode) => `/quiz/${assignment}/${mode}`,
};
```

### Navigation Helpers
```javascript
export const navigate = {
  toHome: (router) => router.push(ROUTES.HOME),
  toAssignment: (router, assignmentId) => router.push(ROUTES.ASSIGNMENT(assignmentId)),
  toQuiz: (router, assignment, mode) => router.push(ROUTES.QUIZ(assignment, mode)),
  back: (router) => router.back(),
  replace: (router, path) => router.replace(path)
};
```

## Component Integration

### HomePage
- **Route**: `/`
- **Navigation**: Uses `AssignmentCard` components that navigate to `/assignment/[id]`
- **Features**: 
  - Data validation for available assignments
  - Error handling for data loading failures
  - Personalized user experience

### Assignment Page
- **Route**: `/assignment/[id]`
- **Validation**: 
  - Parameter validation for assignment ID
  - Question availability validation
  - Loading states during validation
- **Navigation**: 
  - Back to home
  - Forward to quiz with mode selection

### Quiz Page
- **Route**: `/quiz/[assignment]/[mode]`
- **Validation**:
  - Combined parameter validation
  - Question loading and preparation
  - Error boundaries for runtime errors
- **Navigation**:
  - Back to mode selection
  - Back to home
  - Results screen integration

## Error Handling

### Route Protection
1. **Parameter Validation**: All dynamic routes validate parameters before rendering
2. **Data Validation**: Assignment pages verify question availability
3. **Error Boundaries**: Global and component-level error boundaries
4. **Fallback UI**: User-friendly error pages with navigation options

### Error Types
- **Invalid Parameters**: Show parameter error with navigation back
- **Data Loading Errors**: Show data error with retry options
- **Runtime Errors**: Caught by error boundaries with recovery options

## State Management

### Navigation State
- **Router State**: Managed by Next.js App Router
- **Parameter State**: Extracted from URL parameters
- **Validation State**: Computed from parameters and data availability

### Component State
- **Loading States**: During parameter validation and data loading
- **Error States**: For various error conditions
- **Success States**: When all validations pass

## Testing

### Unit Tests
- **Navigation Utils**: Complete test coverage for all utility functions
- **Parameter Validation**: Edge cases and boundary conditions
- **Route Generation**: Correct path generation for all routes

### Integration Tests
- **Complete Flow**: Home → Assignment → Quiz navigation
- **Error Scenarios**: Invalid parameters and data loading failures
- **Component Integration**: Navigation between all components

## Performance Considerations

### Route Optimization
- **Parameter Validation**: Early validation prevents unnecessary data loading
- **Error Boundaries**: Prevent cascading failures
- **Loading States**: Provide immediate feedback during navigation

### Data Loading
- **Assignment Validation**: Only load questions when needed
- **Question Preparation**: Prepare questions based on mode selection
- **Error Recovery**: Graceful handling of data loading failures

## Security Considerations

### Parameter Sanitization
- **Type Validation**: Ensure parameters are correct types
- **Range Validation**: Validate parameters are within expected ranges
- **Injection Prevention**: Parameters are validated before use

### Route Protection
- **Client-Side Validation**: Immediate feedback for invalid routes
- **Server-Side Validation**: Additional validation in page components
- **Error Boundaries**: Prevent malicious input from breaking the app

## Future Enhancements

### Potential Improvements
1. **Breadcrumb Navigation**: Visual navigation path indicator
2. **Route Preloading**: Preload likely next routes
3. **Deep Linking**: Support for bookmarking specific quiz states
4. **Route Analytics**: Track navigation patterns for UX improvements

### Scalability
- **Dynamic Routes**: Support for additional assignment types
- **Mode Extensions**: Easy addition of new learning modes
- **Internationalization**: Route structure supports i18n

## Implementation Checklist

- [x] Next.js App Router structure implemented
- [x] Parameter validation for all dynamic routes
- [x] Navigation utilities with consistent interface
- [x] Error handling and route protection
- [x] Component integration with navigation
- [x] Comprehensive test coverage
- [x] Documentation and examples
- [x] Performance optimization
- [x] Security considerations addressed

## Usage Examples

### Basic Navigation
```javascript
// Navigate to assignment 1
navigate.toAssignment(router, 1);

// Navigate to quiz
navigate.toQuiz(router, 1, 'learn');

// Go back to home
navigate.toHome(router);
```

### Parameter Validation
```javascript
// Validate quiz parameters
const validation = validateQuizParams(assignment, mode);
if (!validation.isValid) {
  console.error('Invalid parameters:', validation.errors);
}
```

### Route Generation
```javascript
// Generate routes programmatically
const homeRoute = ROUTES.HOME;
const assignmentRoute = ROUTES.ASSIGNMENT(3);
const quizRoute = ROUTES.QUIZ(2, 'test-difficult');
```

This routing implementation provides a robust, scalable, and user-friendly navigation system for the ML Quiz App.