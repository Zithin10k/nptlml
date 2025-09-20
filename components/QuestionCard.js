import { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import OptionButton from './OptionButton';
import LaTeXRenderer from './LaTeXRenderer';

const QuestionCard = memo(function QuestionCard({
  question,
  selectedAnswers = [],
  showFeedback = false,
  mode = 'test-easy',
  onAnswerSelect,
  disabled = false,
  compact = false
}) {
  // Memoized calculations to prevent unnecessary recalculations
  const correctAnswers = useMemo(() =>
    question.options.filter(opt => opt.iscorrect),
    [question.options]
  );

  const isMultipleChoice = useMemo(() =>
    correctAnswers.length > 1,
    [correctAnswers.length]
  );

  // Memoized answer selection handler
  const handleAnswerSelect = useCallback((optionNumber) => {
    if (disabled) return;

    let newSelectedAnswers;

    if (isMultipleChoice) {
      // Multiple choice: toggle selection
      if (selectedAnswers.includes(optionNumber)) {
        newSelectedAnswers = selectedAnswers.filter(ans => ans !== optionNumber);
      } else {
        newSelectedAnswers = [...selectedAnswers, optionNumber];
      }
    } else {
      // Single choice: replace selection
      newSelectedAnswers = [optionNumber];
    }

    onAnswerSelect(newSelectedAnswers);
  }, [disabled, isMultipleChoice, selectedAnswers, onAnswerSelect]);

  // In learn mode, show feedback immediately
  const shouldShowFeedback = useMemo(() =>
    mode === 'learn' || showFeedback,
    [mode, showFeedback]
  );

  const containerClass = compact ? 
    "bg-white rounded border p-2 mb-2" : 
    "bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 animate-fadeIn";

  const questionClass = compact ?
    "mb-2" :
    "mb-4 sm:mb-6";

  const titleClass = compact ?
    "text-sm font-semibold text-gray-800 leading-tight mb-1" :
    "text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-relaxed mb-3 sm:mb-4";

  const optionsClass = compact ?
    "options-horizontal" :
    "space-y-2";

  return (
    <div className={containerClass}>
      {/* Question text */}
      <div className={questionClass}>
        <h2 className={titleClass}>
          <LaTeXRenderer>{question.question}</LaTeXRenderer>
        </h2>

        {/* Question image if present */}
        {question.image && question.image.trim() !== '' && (
          <div className={compact ? "mb-2 flex justify-center" : "mb-4 flex justify-center"}>
            <div className="relative max-w-full">
              <Image
                src={`/${question.image}`}
                alt="Question illustration"
                width={compact ? 300 : 600}
                height={compact ? 200 : 400}
                className="rounded border border-gray-200"
                style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
                priority={false}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Selection type indicator */}
      {!compact && (
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            {isMultipleChoice ?
              'Select all correct answers:' :
              'Select the correct answer:'
            }
          </p>
        </div>
      )}

      {/* Answer options */}
      <div className={optionsClass}>
        {question.options.map((option) => (
          <OptionButton
            key={option.optionnumber}
            option={option}
            isSelected={selectedAnswers.includes(option.optionnumber)}
            isCorrect={option.iscorrect}
            showFeedback={shouldShowFeedback}
            isMultipleChoice={isMultipleChoice}
            onSelect={handleAnswerSelect}
            disabled={disabled}
            compact={compact}
          />
        ))}
      </div>

      {/* Selection summary for multiple choice - only show if not compact */}
      {!compact && isMultipleChoice && selectedAnswers.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm sm:text-base text-blue-800">
            <span className="font-medium">Selected:</span> {selectedAnswers.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
});

export default QuestionCard;