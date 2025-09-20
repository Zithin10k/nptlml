# Requirements Document

## Introduction

This document outlines the requirements for a Machine Learning Quiz Application built with Next.js, vanilla JavaScript, and Tailwind CSS. The application will help students memorize machine learning concepts through interactive quizzes with multiple learning modes, progress tracking, and personalized experiences.

## Requirements

### Requirement 1

**User Story:** As a student, I want to select from different assignments (1-7) so that I can focus on specific topics or weeks of material.

#### Acceptance Criteria

1. WHEN the user visits the home page THEN the system SHALL display assignment options from 1 to 7
2. WHEN the user selects an assignment THEN the system SHALL navigate to the assignment-specific interface
3. WHEN displaying assignments THEN the system SHALL show clear labels and descriptions for each assignment

### Requirement 2

**User Story:** As a student, I want to choose between different learning modes (Learn, Test Easy, Test Difficult) so that I can study according to my current knowledge level and goals.

#### Acceptance Criteria

1. WHEN the user selects an assignment THEN the system SHALL display three mode options: Learn, Test Easy, and Test Difficult
2. WHEN the user selects "Learn" mode THEN the system SHALL show questions with correct answers pre-highlighted
3. WHEN the user selects "Test Easy" mode THEN the system SHALL present questions in their original order
4. WHEN the user selects "Test Difficult" mode THEN the system SHALL shuffle both question order and option order within questions
5. WHEN in any test mode THEN the system SHALL require user interaction before showing correct answers

### Requirement 3

**User Story:** As a student, I want to see a clean progress bar during quizzes so that I can track my completion status and stay motivated.

#### Acceptance Criteria

1. WHEN taking a quiz THEN the system SHALL display a progress bar showing current question number and total questions
2. WHEN the user answers a question THEN the system SHALL update the progress bar to reflect advancement
3. WHEN displaying progress THEN the system SHALL use clear visual indicators and percentage completion
4. WHEN the progress bar is displayed THEN it SHALL be visually prominent but not distracting from the content

### Requirement 4

**User Story:** As a student, I want immediate visual feedback on my answers so that I can learn from mistakes and reinforce correct knowledge.

#### Acceptance Criteria

1. WHEN the user selects an answer in test mode THEN the system SHALL highlight the selected option
2. WHEN the user clicks "Next" after selecting an answer THEN the system SHALL highlight correct answers in green and incorrect answers in red
3. WHEN in Learn mode THEN the system SHALL pre-highlight correct answers in green
4. WHEN there are multiple correct answers THEN the system SHALL support multiple selection and highlight all correct options in green
5. WHEN displaying feedback THEN the system SHALL maintain highlighting until the user moves to the next question

### Requirement 5

**User Story:** As a student, I want to handle both single and multiple-choice questions so that I can practice different types of ML assessment formats.

#### Acceptance Criteria

1. WHEN a question has multiple correct answers THEN the system SHALL allow multiple option selection
2. WHEN a question has a single correct answer THEN the system SHALL allow only one option selection
3. WHEN displaying multiple-choice questions THEN the system SHALL use checkboxes for multiple selection and radio buttons for single selection
4. WHEN the user attempts to select multiple options on a single-answer question THEN the system SHALL replace the previous selection
5. WHEN scoring multiple-choice questions THEN the system SHALL require all correct answers to be selected for full credit

### Requirement 6

**User Story:** As a student, I want to see my test results and completion time so that I can track my performance and improvement over time.

#### Acceptance Criteria

1. WHEN the user completes a test THEN the system SHALL display the final score as a percentage and fraction
2. WHEN showing results THEN the system SHALL display the total time taken to complete the test
3. WHEN displaying completion screen THEN the system SHALL show personalized congratulatory messages using the stored user name
4. WHEN results are shown THEN the system SHALL provide options to retake the test or return to assignment selection
5. WHEN calculating scores THEN the system SHALL handle both single and multiple-choice questions appropriately

### Requirement 7

**User Story:** As a new user, I want to enter my name when I first use the application so that I can receive personalized messages and track my progress.

#### Acceptance Criteria

1. WHEN a user visits the application for the first time THEN the system SHALL prompt for name entry
2. WHEN the user enters their name THEN the system SHALL store it in local storage for future sessions
3. WHEN the user returns to the application THEN the system SHALL retrieve and use the stored name for personalization
4. WHEN displaying personalized messages THEN the system SHALL use the stored name in completion screens and greetings
5. WHEN the name is stored THEN the system SHALL persist it across browser sessions until manually cleared

### Requirement 8

**User Story:** As a student, I want the application to work with the existing question data format so that all 70 questions across 7 assignments are available for practice.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL read questions from the public/data.json file
2. WHEN filtering questions by assignment THEN the system SHALL use the assignmentnumber field to group questions
3. WHEN displaying questions THEN the system SHALL support questions with and without images
4. WHEN handling options THEN the system SHALL read optionnumber, optiontext, and iscorrect fields correctly
5. WHEN processing question data THEN the system SHALL handle all existing question formats without modification to the data structure

### Requirement 9

**User Story:** As a student, I want a responsive and clean user interface so that I can use the application effectively on different devices.

#### Acceptance Criteria

1. WHEN using the application on mobile devices THEN the system SHALL display content in a mobile-friendly layout
2. WHEN using the application on desktop THEN the system SHALL utilize available screen space effectively
3. WHEN displaying questions and options THEN the system SHALL use clear typography and adequate spacing
4. WHEN showing interactive elements THEN the system SHALL provide clear hover and focus states
5. WHEN using Tailwind CSS THEN the system SHALL maintain consistent styling throughout the application