export default function Card({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  hover = false,
  onClick,
  disabled = false
}) {
  // Padding variants with responsive adjustments
  const paddingClasses = {
    'none': '',
    'sm': 'p-3 sm:p-4',
    'default': 'p-4 sm:p-6',
    'lg': 'p-6 sm:p-8'
  };

  // Shadow variants
  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'default': 'shadow-lg',
    'lg': 'shadow-xl'
  };

  // Build classes - Blue outline theme
  let cardClasses = `
    bg-white 
    rounded-lg 
    border-2 
    border-blue-200 
    ${paddingClasses[padding]} 
    ${shadowClasses[shadow]}
    ${className}
  `.trim();

  // Add interactive classes if clickable - Blue outline theme
  if (onClick && !disabled) {
    cardClasses += ' cursor-pointer transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    if (hover) {
      cardClasses += ' hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 active:translate-y-0 active:shadow-lg';
    }
  }

  // Add disabled styling
  if (disabled) {
    cardClasses += ' opacity-50 cursor-not-allowed';
  }

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}