/**
 * HomePage Component
 * Main home page with assignment selection and personalized greeting
 * Handles first-time user name prompt and data loading errors
 */

'use client';

import { useState, useEffect } from 'react';
import { getUserName, isFirstTimeUser } from '../utils/storageUtils';
import { getPersonalizedGreeting } from '../utils/personalizationUtils';
import { loadQuestions, DataValidationError } from '../utils/dataLoader';
import { trackPageView } from '../utils/analytics';
import { signInUser, onAuthStateChange, autoLoginIfNeeded } from '../utils/firebase';
import NamePrompt from './NamePrompt';
import NameChangeModal from './NameChangeModal';
import Container from './Container';
import Grid from './Grid';
import AssignmentCard from './AssignmentCard';
import MegaTest from './MegaTest';
import ErrorBoundary from './ErrorBoundary';
import DataErrorFallback from './DataErrorFallback';

// Default assignment data with descriptions
const getDefaultAssignmentData = () => [
  {
    number: 1,
    title: "Assignment 1",
    description: "Introduction to Machine Learning fundamentals and basic concepts"
  },
  {
    number: 2,
    title: "Assignment 2", 
    description: "Supervised Learning algorithms and classification techniques"
  },
  {
    number: 3,
    title: "Assignment 3",
    description: "Regression analysis and predictive modeling methods"
  },
  {
    number: 4,
    title: "Assignment 4",
    description: "Unsupervised Learning, clustering, and dimensionality reduction"
  },
  {
    number: 5,
    title: "Assignment 5",
    description: "Neural Networks and deep learning fundamentals"
  },
  {
    number: 6,
    title: "Assignment 6",
    description: "Model evaluation, validation, and performance metrics"
  },
  {
    number: 7,
    title: "Assignment 7",
    description: "Advanced topics and real-world ML applications"
  },
  {
    number: 8,
    title: "Assignment 8",
    description: "Advanced topics and real-world ML applications"
  }
];

// Generate assignment data based on available questions
const generateAssignmentData = (questions) => {
  const defaultData = getDefaultAssignmentData();
  const availableAssignments = [...new Set(questions.map(q => parseInt(q.assignmentnumber)))].sort();
  
  return defaultData.filter(assignment => 
    availableAssignments.includes(assignment.number)
  ).map(assignment => ({
    ...assignment,
    questionCount: questions.filter(q => parseInt(q.assignmentnumber) === assignment.number).length
  }));
};

export default function HomePage() {
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [showNameChangeModal, setShowNameChangeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentData, setAssignmentData] = useState([]);
  const [dataError, setDataError] = useState(null);
  const [authState, setAuthState] = useState('loading'); // 'loading', 'authenticated', 'unauthenticated'

  useEffect(() => {
    // Initialize user name and load assignment data
    const initializeApp = async () => {
      try {
        // Auto-login if user has stored name but isn't authenticated
        const loginResult = await autoLoginIfNeeded();
        
        if (loginResult.success && loginResult.userName) {
          setUserName(loginResult.userName);
          if (loginResult.alreadyAuthenticated) {
            console.log('User already authenticated');
          } else {
            console.log('Auto-login successful for:', loginResult.userName);
          }
        } else if (isFirstTimeUser()) {
          setShowNamePrompt(true);
        } else {
          // User has stored name but auto-login failed
          const storedName = getUserName();
          if (storedName) {
            setUserName(storedName);
            console.warn('Auto-login failed, using stored name locally');
          } else {
            setShowNamePrompt(true);
          }
        }

        // Load questions to determine available assignments
        try {
          const questions = await loadQuestions();
          const assignments = generateAssignmentData(questions);
          setAssignmentData(assignments);
        } catch (error) {
          console.warn('Could not load question data for assignment validation:', error);
          // Fall back to default assignments if data loading fails
          setAssignmentData(getDefaultAssignmentData());
          
          // Only show data error if it's a critical issue
          if (error instanceof DataValidationError && error.message.includes('empty')) {
            setDataError(error);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // If there's an error, show name prompt to be safe
        setShowNamePrompt(true);
        setAssignmentData(getDefaultAssignmentData());
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        setAuthState('authenticated');
        console.log('User authenticated:', user.uid);
      } else {
        setAuthState('unauthenticated');
        console.log('User not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  // Track page view when component mounts and when userName changes
  useEffect(() => {
    if (!isLoading) {
      trackPageView(window.location.href, userName);
    }
  }, [userName, isLoading]);

  const handleNameSubmit = async (name) => {
    try {
      // Sign in user with Firebase (only if not already authenticated)
      if (authState !== 'authenticated') {
        await signInUser(name);
      }
      setUserName(name);
      setShowNamePrompt(false);
    } catch (error) {
      console.error('Error signing in user:', error);
      // Still allow local usage if Firebase fails
      setUserName(name);
      setShowNamePrompt(false);
    }
  };

  const handleNameChange = (name) => {
    setUserName(name);
    if (!name) {
      // If name is cleared, show the name prompt again
      setShowNamePrompt(true);
    }
  };

  const handleShowNameChange = () => {
    setShowNameChangeModal(true);
  };

  const handleCloseNameChange = () => {
    setShowNameChangeModal(false);
  };



  // Show loading state while initializing
  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Container>
    );
  }

  // Show data error if critical data loading failed
  if (dataError) {
    return (
      <DataErrorFallback
        error={dataError}
        onRetry={() => {
          setDataError(null);
          setIsLoading(true);
          window.location.reload();
        }}
        showRetry={true}
      />
    );
  }

  return (
    <ErrorBoundary>
      {showNamePrompt && (
        <NamePrompt onNameSubmit={handleNameSubmit} />
      )}
      
      {showNameChangeModal && (
        <NameChangeModal 
          currentName={userName}
          onNameChange={handleNameChange}
          onClose={handleCloseNameChange}
        />
      )}
      
      <Container>
        <div className="min-h-screen py-8 scroll-container">
          {/* Header Section */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              ML Quiz App
            </h1>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-blue-600 mb-3 sm:mb-4">
                {getPersonalizedGreeting(userName)}
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                Master machine learning concepts through interactive quizzes. 
                Choose an assignment below to get started on your learning journey.
              </p>
            </div>
          </div>

         

          {/* Assignment Selection Section */}
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Choose Your Assignment
              </h3>
              <p className="text-base sm:text-lg text-gray-600 px-4">
                Select from {assignmentData.length} comprehensive assignments covering all aspects of machine learning
              </p>
            </div>
            
            {assignmentData.length > 0 ? (
              <Grid className="max-w-6xl mx-auto" cols="7" gap="lg">
                {assignmentData.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.number}
                    assignmentNumber={assignment.number}
                    title={assignment.title}
                    description={assignment.description}
                    questionCount={assignment.questionCount}
                  />
                ))}
              </Grid>
            ) : (
              <div className="text-center p-8 bg-yellow-50 rounded-lg max-w-md mx-auto">
                <p className="text-yellow-800">
                  No assignments are currently available. Please check back later or contact support.
                </p>
              </div>
            )}
             {/* Mega Test Section */}
          <div className="mb-12 sm:mb-16">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Special Challenge
              </h3>
              <p className="text-base sm:text-lg text-gray-600 px-4">
                Take on the ultimate ML quiz and earn amazing rewards
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <MegaTest />
            </div>
          </div>
          </div>

          {/* User Info Section */}
          {userName && (
            <div className="text-center mt-8 sm:mt-12 p-4 sm:p-6 bg-blue-50 rounded-lg max-w-md mx-auto">
              <p className="text-sm sm:text-base text-blue-800">
                <span className="font-medium">Logged in as:</span> {userName}
              </p>
              <button
                onClick={handleShowNameChange}
                className="text-sm sm:text-xs text-blue-600 hover:text-blue-800 underline mt-2 sm:mt-1 min-h-[44px] sm:min-h-auto py-2 sm:py-0 touch-manipulation"
              >
                Change name
              </button>
            </div>
          )}
        </div>
      </Container>
    </ErrorBoundary>
  );
}