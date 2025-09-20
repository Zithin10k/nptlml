/**
 * AdminDashboard Component
 * Simple dashboard to view Firebase analytics data
 * Access by adding ?admin=true to any URL
 */

'use client';

import { useState, useEffect } from 'react';
import { getUserEvents, getRecentActivity, getUserStats, formatTimestamp } from '../utils/firebaseAnalytics';
import Container from './Container';
import Card from './Card';
import Button from './Button';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('recent');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const loadData = async (type) => {
    setLoading(true);
    try {
      let result;
      switch (type) {
        case 'recent':
          result = await getRecentActivity(50);
          break;
        case 'logins':
          result = await getUserEvents('user_login', 50);
          break;
        case 'starts':
          result = await getUserEvents('test_start', 50);
          break;
        case 'completions':
          result = await getUserEvents('test_complete', 50);
          break;
        case 'user':
          if (userSearch.trim()) {
            result = await getUserStats(userSearch.trim());
          }
          break;
        default:
          result = [];
      }
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setData(null);
  };

  const handleUserSearch = () => {
    if (userSearch.trim()) {
      setActiveTab('user');
      loadData('user');
    }
  };

  const renderEventList = (events) => (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {events.map((event, index) => (
        <div key={event.id || index} className="p-3 bg-gray-50 rounded border text-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium text-blue-600">{event.event_type}</span>
            <span className="text-gray-500 text-xs">{formatTimestamp(event.timestamp)}</span>
          </div>
          <div className="text-gray-700">
            <strong>User:</strong> {event.user_name || 'Unknown'}
          </div>
          {event.test_type && (
            <div className="text-gray-700">
              <strong>Test:</strong> {event.test_type}
            </div>
          )}
          {event.score !== undefined && (
            <div className="text-gray-700">
              <strong>Score:</strong> {event.score}/{event.total_questions} ({event.percentage}%)
            </div>
          )}
          {event.time_spent_seconds && (
            <div className="text-gray-700">
              <strong>Time:</strong> {Math.floor(event.time_spent_seconds / 60)}m {event.time_spent_seconds % 60}s
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderUserStats = (stats) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card padding="md">
        <h4 className="font-bold text-lg mb-3">Activity Summary</h4>
        <div className="space-y-2 text-sm">
          <div><strong>Total Logins:</strong> {stats.totalLogins}</div>
          <div><strong>Tests Started:</strong> {stats.testsStarted}</div>
          <div><strong>Tests Completed:</strong> {stats.testsCompleted}</div>
          <div><strong>Completion Rate:</strong> {stats.testsStarted > 0 ? Math.round((stats.testsCompleted / stats.testsStarted) * 100) : 0}%</div>
          <div><strong>Average Score:</strong> {stats.averageScore}%</div>
          <div><strong>Last Activity:</strong> {formatTimestamp(stats.lastActivity)}</div>
        </div>
      </Card>
      
      <Card padding="md">
        <h4 className="font-bold text-lg mb-3">Test Breakdown</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(stats.testTypes).map(([testType, count]) => (
            <div key={testType}>
              <strong>{testType}:</strong> {count} attempts
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { key: 'recent', label: 'Recent Activity' },
            { key: 'logins', label: 'User Logins' },
            { key: 'starts', label: 'Test Starts' },
            { key: 'completions', label: 'Test Completions' }
          ].map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* User Search */}
        <Card className="mb-6" padding="md">
          <h3 className="font-bold text-lg mb-3">User Statistics</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter user name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
            />
            <Button onClick={handleUserSearch} disabled={!userSearch.trim()}>
              Search
            </Button>
          </div>
        </Card>

        {/* Data Display */}
        <Card padding="lg">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading data...</p>
            </div>
          ) : data ? (
            activeTab === 'user' ? (
              data.totalLogins !== undefined ? renderUserStats(data) : (
                <p className="text-center text-gray-500">No data found for this user.</p>
              )
            ) : Array.isArray(data) ? (
              data.length > 0 ? renderEventList(data) : (
                <p className="text-center text-gray-500">No events found.</p>
              )
            ) : (
              <p className="text-center text-gray-500">Invalid data format.</p>
            )
          ) : (
            <p className="text-center text-gray-500">Select a tab to view data.</p>
          )}
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>This dashboard shows Firebase analytics data for the ML Quiz App.</p>
          <p>Data is updated in real-time as users interact with the application.</p>
        </div>
      </div>
    </Container>
  );
}