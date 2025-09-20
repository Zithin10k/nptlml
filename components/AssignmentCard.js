/**
 * AssignmentCard Component
 * Individual assignment selection card with number, description, and navigation
 */

'use client';

import { useRouter } from 'next/navigation';
import Card from './Card';
import { navigate } from '../utils/navigationUtils';

export default function AssignmentCard({ 
  assignmentNumber, 
  title, 
  description,
  questionCount,
  className = '' 
}) {
  const router = useRouter();

  const handleAssignmentSelect = () => {
    // Navigate to assignment mode selection page
    navigate.toAssignment(router, assignmentNumber);
  };

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-400 hover:-translate-y-1 min-h-[200px] sm:min-h-[180px] ${className}`}
      onClick={handleAssignmentSelect}
      hover={true}
      padding="sm"
    >
      <div className="text-center p-2 sm:p-3 h-full flex flex-col justify-between">
        {/* Assignment Number */}
        <div className="text-5xl sm:text-4xl font-bold text-blue-600 mb-3 sm:mb-2">
          {assignmentNumber}
        </div>
        
        {/* Assignment Title */}
        <h4 className="text-xl sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-1">
          {title || `Assignment ${assignmentNumber}`}
        </h4>
        
        {/* Assignment Description */}
        <p className="text-sm sm:text-xs text-gray-600 leading-relaxed flex-grow mb-3 sm:mb-2">
          {description || `Practice ML concepts from week ${assignmentNumber}`}
        </p>
        
        {/* Question count if available */}
        {questionCount && (
          <div className="text-xs text-gray-500 mb-2">
            {questionCount} questions
          </div>
        )}
        
        {/* Visual indicator for interactivity */}
        <div className="mt-auto pt-3 sm:pt-2 border-t border-blue-100">
          <span className="text-sm sm:text-xs text-blue-600 font-medium">
            Tap to start
          </span>
        </div>
      </div>
    </Card>
  );
}