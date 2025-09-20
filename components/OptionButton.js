import { memo, useCallback, useMemo } from 'react';
import LaTeXRenderer from './LaTeXRenderer';

const OptionButton = memo(function OptionButton({ 
  option, 
  isSelected, 
  showFeedback, 
  isMultipleChoice, 
  onSelect, 
  disabled 
}) {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(option.optionnumber);
    }
  }, [disabled, onSelect, option.optionnumber]);

  // Memoized button styling based on state
  const buttonClasses = useMemo(() => {
    let baseClasses = "w-full p-4 sm:p-5 text-left border-2 rounded-lg option-button cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation min-h-[56px] sm:min-h-[48px] ";
    
    // Add animation classes based on state
    if (showFeedback && option.iscorrect) {
      baseClasses += "feedback-correct ";
    } else if (showFeedback && isSelected && !option.iscorrect) {
      baseClasses += "feedback-incorrect ";
    } else if (isSelected) {
      baseClasses += "selected ";
    }
    
    if (showFeedback) {
      if (option.iscorrect) {
        // Correct answer - always green when feedback is shown
        baseClasses += "border-green-500 bg-green-50 text-green-800 focus:ring-green-500 ";
      } else if (isSelected && !option.iscorrect) {
        // Selected wrong answer - red
        baseClasses += "border-red-500 bg-red-50 text-red-800 focus:ring-red-500 ";
      } else {
        // Unselected options when feedback is shown
        baseClasses += "border-gray-300 bg-gray-50 text-gray-600 focus:ring-gray-500 ";
      }
    } else {
      if (isSelected) {
        // Selected but no feedback yet - blue
        baseClasses += "border-blue-500 bg-blue-50 text-blue-800 focus:ring-blue-500 ";
      } else {
        // Default unselected state
        baseClasses += "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:ring-blue-500 ";
      }
    }

    if (disabled) {
      baseClasses += "cursor-not-allowed opacity-75 ";
    }

    return baseClasses;
  }, [showFeedback, option.iscorrect, isSelected, disabled]);

  return (
    <div className="mb-3 sm:mb-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={buttonClasses}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-pressed={isSelected}
        aria-describedby={`option-${option.optionnumber}-description`}
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* Input element for visual consistency */}
          <div className="flex-shrink-0 mt-1">
            {isMultipleChoice ? (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}} // Handled by button click
                className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 touch-manipulation"
                disabled={disabled}
                tabIndex={-1}
              />
            ) : (
              <input
                type="radio"
                checked={isSelected}
                onChange={() => {}} // Handled by button click
                className="w-5 h-5 sm:w-4 sm:h-4 text-blue-600 border-gray-300 focus:ring-blue-500 touch-manipulation"
                disabled={disabled}
                tabIndex={-1}
              />
            )}
          </div>
          
          {/* Option content */}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-base sm:text-sm text-gray-800 mr-2">
              {option.optionnumber}.
            </span>
            <span className="text-base sm:text-sm leading-relaxed break-words" id={`option-${option.optionnumber}-description`}>
              <LaTeXRenderer>{option.optiontext}</LaTeXRenderer>
            </span>
          </div>
        </div>
      </button>
    </div>
  );
});

export default OptionButton;