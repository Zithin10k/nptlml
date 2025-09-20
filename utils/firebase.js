// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfQiI6wSLLF240CZGC1gpxCFTubSvd8Q4",
  authDomain: "test-62511.firebaseapp.com",
  projectId: "test-62511",
  storageBucket: "test-62511.firebasestorage.app",
  messagingSenderId: "513517917760",
  appId: "1:513517917760:web:80876f42d7256bae15f1a5",
  measurementId: "G-R1LMX221BP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

// Authentication functions
export const signInUser = async (userName) => {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    // Log the login event
    await logUserEvent('user_login', {
      user_name: userName,
      user_id: user.uid,
      timestamp: new Date().toISOString()
    });

    // Track with Analytics
    if (analytics) {
      logEvent(analytics, 'login', {
        method: 'anonymous',
        user_name: userName
      });
    }

    return { user, userName };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Event logging functions
export const logUserEvent = async (eventType, eventData) => {
  try {
    await addDoc(collection(db, 'user_events'), {
      event_type: eventType,
      ...eventData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

export const logTestStart = async (userName, testType, questionCount) => {
  const user = auth.currentUser;
  if (!user) return;

  const eventData = {
    user_name: userName,
    user_id: user.uid,
    test_type: testType,
    question_count: questionCount,
    timestamp: new Date().toISOString()
  };

  await logUserEvent('test_start', eventData);

  // Track with Analytics
  if (analytics) {
    logEvent(analytics, 'test_start', {
      test_type: testType,
      question_count: questionCount,
      user_name: userName
    });
  }
};

export const logTestComplete = async (userName, testType, score, totalQuestions, timeSpent) => {
  const user = auth.currentUser;
  if (!user) return;

  const eventData = {
    user_name: userName,
    user_id: user.uid,
    test_type: testType,
    score: score,
    total_questions: totalQuestions,
    time_spent_seconds: timeSpent,
    percentage: Math.round((score / totalQuestions) * 100),
    timestamp: new Date().toISOString()
  };

  await logUserEvent('test_complete', eventData);

  // Track with Analytics
  if (analytics) {
    logEvent(analytics, 'test_complete', {
      test_type: testType,
      score: score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      time_spent: timeSpent,
      user_name: userName
    });
  }
};

// Check if user is currently authenticated
export const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};

// Auto-login function for users with stored names
export const autoLoginIfNeeded = async () => {
  // Import here to avoid circular dependency
  const { getUserName } = await import('./storageUtils');

  const storedName = getUserName();

  // If user has a stored name but isn't authenticated, auto-login
  if (storedName && !isUserAuthenticated()) {
    try {
      console.log('Auto-logging in user with stored name:', storedName);
      await signInUser(storedName);
      return { success: true, userName: storedName, autoLoggedIn: true };
    } catch (error) {
      console.error('Auto-login failed:', error);
      return { success: false, error, userName: storedName };
    }
  }

  // Return current state if already authenticated or no stored name
  return {
    success: isUserAuthenticated(),
    userName: storedName,
    alreadyAuthenticated: isUserAuthenticated(),
    autoLoggedIn: false
  };
};

// Ensure user is authenticated (auto-login if needed)
export const ensureAuthenticated = async () => {
  const result = await autoLoginIfNeeded();
  if (!result.success && result.userName) {
    // If auto-login failed but we have a stored name, try again
    try {
      await signInUser(result.userName);
      return { success: true, userName: result.userName, retried: true };
    } catch (error) {
      console.error('Retry authentication failed:', error);
      return { success: false, error, userName: result.userName };
    }
  }
  return result;
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};