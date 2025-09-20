import { memo } from 'react';

const ProgressBar = memo(function ProgressBar({ current, total, percentage, customTheme = null }) {
  return (
    <div className="w-full mb-4 sm:mb-6">
      {/* Progress bar container */}
      <div className="w-full bg-gray-200 rounded-full h-4 sm:h-3 mb-3 sm:mb-2 shadow-inner">
        <div 
          className={`h-4 sm:h-3 rounded-full progress-bar-fill shadow-sm ${
            customTheme ? `bg-gradient-to-r ${customTheme.primary}` : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${current} of ${total} questions completed`}
        ></div>
      </div>
      
      {/* Question counter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-center sm:text-left">
        <span className="font-medium text-base sm:text-sm text-gray-700 mb-1 sm:mb-0">
          Question {current} of {total}
        </span>
        <span className={`font-bold text-lg sm:text-sm ${
          customTheme ? `text-${customTheme.accent}` : 'text-blue-600'
        } sm:text-gray-600`}>
          {percentage}% Complete
        </span>
      </div>
    </div>
  );
});

export default ProgressBar;