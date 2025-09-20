# Firebase Integration Setup

This document explains how Firebase is integrated into the ML Quiz App for user tracking and analytics.

## Features Implemented

### 1. User Authentication
- Anonymous authentication when users enter their name
- Automatic sign-in on first use
- User session management

### 2. Event Tracking
The app tracks three main events:

#### User Login
- Triggered when a user enters their name for the first time
- Logs: user name, user ID, timestamp

#### Test Start
- Triggered when a user begins any quiz or mega test
- Logs: user name, test type, question count, timestamp

#### Test Complete
- Triggered when a user finishes a quiz
- Logs: user name, test type, score, total questions, time spent, percentage, timestamp

### 3. Analytics Integration
- Google Analytics events for user behavior tracking
- Custom events for quiz interactions
- Performance monitoring

## Firebase Configuration

The app is configured with the following Firebase services:
- **Authentication**: Anonymous sign-in
- **Firestore**: Event logging and user data storage
- **Analytics**: User behavior tracking
- **Hosting**: Web app deployment

### Project Details
- Project ID: `test-62511`
- App ID: `1:513517917760:web:80876f42d7256bae15f1a5`
- Environment: Production ready

## Database Structure

### Collections

#### `user_events`
```javascript
{
  event_type: 'user_login' | 'test_start' | 'test_complete',
  user_name: string,
  user_id: string,
  timestamp: Timestamp,
  // Additional fields based on event type
}
```

#### Event Type Specific Fields

**user_login:**
- No additional fields

**test_start:**
- `test_type`: string (e.g., "Assignment 1", "Mega Test")
- `question_count`: number

**test_complete:**
- `test_type`: string
- `score`: number
- `total_questions`: number
- `time_spent_seconds`: number
- `percentage`: number

## Security Rules

Firestore security rules ensure:
- Only authenticated users can read/write data
- Users can only access their own data
- All operations require authentication

## Analytics Utilities

### Available Functions

```javascript
// Get events by type
const logins = await getUserEvents('user_login', 50);

// Get user-specific events
const userEvents = await getUserEventsByName('John Doe', 100);

// Get recent activity across all users
const activity = await getRecentActivity(50);

// Get comprehensive user statistics
const stats = await getUserStats('John Doe');
```

### User Statistics Include:
- Total logins
- Tests started vs completed
- Average score percentage
- Test type breakdown
- Last activity timestamp

## Deployment

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize project: `firebase init`

### Deploy Commands
```bash
# Deploy everything
npm run firebase:deploy

# Test locally
npm run firebase:serve
```

### Environment Setup
The Firebase configuration is included directly in the code. For production, consider using environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... other config
};
```

## Monitoring and Analytics

### Firebase Console
Access your project at: https://console.firebase.google.com/project/test-62511

### Key Metrics to Monitor:
1. **User Engagement**: Login frequency and session duration
2. **Quiz Performance**: Completion rates and average scores
3. **Popular Content**: Most attempted assignments
4. **User Retention**: Return user patterns

### Analytics Events
All events are automatically sent to Google Analytics with custom parameters for detailed analysis.

## Troubleshooting

### Common Issues:

1. **Authentication Errors**: Check Firebase project configuration
2. **Permission Denied**: Verify Firestore security rules
3. **Analytics Not Working**: Ensure Analytics is enabled in Firebase console
4. **Deployment Issues**: Check Firebase CLI authentication and project selection

### Debug Mode
Enable debug logging by setting:
```javascript
// In firebase.js
import { connectFirestoreEmulator } from 'firebase/firestore';

// For development only
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Privacy Considerations

- Only anonymous authentication is used
- User names are stored but no personal information
- All data is associated with anonymous user IDs
- Users can clear their data by clearing browser storage

## Future Enhancements

Potential improvements:
1. User profiles with progress tracking
2. Leaderboards and social features
3. Detailed performance analytics
4. Export user data functionality
5. Admin dashboard for viewing analytics