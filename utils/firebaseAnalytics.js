// Firebase Analytics utilities for viewing user data
import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

// Get user events by type
export const getUserEvents = async (eventType, limitCount = 50) => {
  try {
    const eventsRef = collection(db, 'user_events');
    const q = query(
      eventsRef,
      where('event_type', '==', eventType),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

// Get events for a specific user
export const getUserEventsByName = async (userName, limitCount = 50) => {
  try {
    const eventsRef = collection(db, 'user_events');
    const q = query(
      eventsRef,
      where('user_name', '==', userName),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching user events by name:', error);
    return [];
  }
};

// Get recent activity (all event types)
export const getRecentActivity = async (limitCount = 100) => {
  try {
    const eventsRef = collection(db, 'user_events');
    const q = query(
      eventsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Get user statistics
export const getUserStats = async (userName) => {
  try {
    const events = await getUserEventsByName(userName, 1000);
    
    const stats = {
      totalLogins: 0,
      testsStarted: 0,
      testsCompleted: 0,
      totalScore: 0,
      totalQuestions: 0,
      averageScore: 0,
      testTypes: {},
      lastActivity: null
    };
    
    events.forEach(event => {
      if (event.timestamp && (!stats.lastActivity || event.timestamp > stats.lastActivity)) {
        stats.lastActivity = event.timestamp;
      }
      
      switch (event.event_type) {
        case 'user_login':
          stats.totalLogins++;
          break;
        case 'test_start':
          stats.testsStarted++;
          if (event.test_type) {
            stats.testTypes[event.test_type] = (stats.testTypes[event.test_type] || 0) + 1;
          }
          break;
        case 'test_complete':
          stats.testsCompleted++;
          if (typeof event.score === 'number') {
            stats.totalScore += event.score;
          }
          if (typeof event.total_questions === 'number') {
            stats.totalQuestions += event.total_questions;
          }
          break;
      }
    });
    
    if (stats.testsCompleted > 0 && stats.totalQuestions > 0) {
      stats.averageScore = Math.round((stats.totalScore / stats.totalQuestions) * 100);
    }
    
    return stats;
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return null;
  }
};

// Format timestamp for display
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp;
  }
  
  return date.toLocaleString();
};