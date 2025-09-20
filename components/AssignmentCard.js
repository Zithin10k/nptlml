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
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-400 hover:-translate-y-1 min-h-[160px] sm:min-h-[140px] ${className}`}
      onClick={handleAssignmentSelect}
      hover={true}
      padding="sm"
    >
      <div className="p-3 sm:p-4 h-full flex items-center gap-4">
        {/* Assignment Number - Left Side */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">
              {assignmentNumber}
            </span>
          </div>
        </div>
        
        {/* Content - Right Side */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Assignment Title */}
          <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 truncate">
            {title || `Assignment ${assignmentNumber}`}
          </h4>
          
          {/* Assignment Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
            {description || `Practice ML concepts from week ${assignmentNumber}`}
          </p>
          
          {/* Bottom Row: Question count and Start indicator */}
          <div className="flex items-center justify-between">
            {questionCount && (
              <span className="text-xs text-gray-500">
                {questionCount} questions
              </span>
            )}
            <span className="text-sm text-blue-600 font-medium ml-auto">
              Start →
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}