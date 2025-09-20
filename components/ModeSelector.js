/**
 * ModeSelector Component
 * Displays three learning mode options with descriptions and visual indicators
 * Handles navigation to quiz interface with selected mode
 */

'use client';

import { useRouter } from 'next/navigation';
import Card from './Card';
import Button from './Button';
import { navigate } from '../utils/navigationUtils';

const LEARNING_MODES = [
  {
    id: 'learn',
    title: 'Learn Mode',
    description: 'Study with correct answers pre-highlighted. Perfect for first-time learning and review.',
    icon: '📚',
    color: 'green',
    features: [
      'Correct answers shown immediately',
      'No time pressure',
      'Focus on understanding concepts'
    ]
  },
  {
    id: 'test-easy',
    title: 'Test Easy',
    description: 'Test your knowledge with questions in original order. Good for practice and reinforcement.',
    icon: '✏️',
    color: 'blue',
    features: [
      'Questions in original order',
      'Feedback after each answer',
      'Build confidence gradually'
    ]
  },
  {
    id: 'test-difficult',
    title: 'Test Difficult',
    description: 'Challenge yourself with shuffled questions and options. Best for final assessment.',
    icon: '🎯',
    color: 'purple',
    features: [
      'Questions and options shuffled',
      'Feedback after each answer',
      'Maximum challenge level'
    ]
  }
];

export default function ModeSelector({ assignmentNumber, onBack }) {
  const router = useRouter();

  const handleModeSelect = (mode) => {
    // Navigate to quiz interface with assignment and mode parameters
    navigate.toQuiz(router, assignmentNumber, mode);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      green: {
        border: 'border-green-200 hover:border-green-300',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        accent: 'text-green-600'
      },
      blue: {
        border: 'border-blue-200 hover:border-blue-300',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        accent: 'text-blue-600'
      },
      purple: {
        border: 'border-purple-200 hover:border-purple-300',
        icon: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
        accent: 'text-purple-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Assignment {assignmentNumber}
        </h1>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-700 mb-4 sm:mb-6">
          Choose Your Learning Mode
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Select the learning mode that best fits your current knowledge level and learning goals.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {LEARNING_MODES.map((mode) => {
          const colors = getColorClasses(mode.color);
          
          return (
            <Card 
              key={mode.id}
              className={`border-2 ${colors.border} card-hover min-h-[400px] sm:min-h-[380px] animate-fadeIn`}
              padding="sm"
            >
              <div className="p-4 sm:p-6 text-center h-full flex flex-col">
                {/* Mode Icon */}
                <div className={`text-5xl sm:text-6xl mb-3 sm:mb-4 ${colors.icon}`}>
                  {mode.icon}
                </div>
                
                {/* Mode Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {mode.title}
                </h3>
                
                {/* Mode Description */}
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed flex-grow">
                  {mode.description}
                </p>
                
                {/* Features List */}
                <div className="mb-6 sm:mb-8">
                  <h4 className={`text-xs sm:text-sm font-semibold ${colors.accent} mb-2 sm:mb-3 uppercase tracking-wide`}>
                    Features
                  </h4>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                    {mode.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-center">
                        <span className={`text-xs ${colors.accent} mr-2`}>✓</span>
                        <span className="text-center">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Select Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => handleModeSelect(mode.id)}
                    className={`${colors.button} text-white border-transparent w-full px-6 py-4 text-lg min-h-[52px] inline-flex items-center justify-center border rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 touch-manipulation select-none`}
                  >
                    Start {mode.title}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="text-center px-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-6 sm:px-8 w-full sm:w-auto"
        >
          ← Back to Assignments
        </Button>
      </div>
    </div>
  );
}