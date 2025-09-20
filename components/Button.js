export default function Button({
  children,
  onClick,
  onKeyDown,
  type = 'button',
  variant = 'primary',
  size = 'default',
  disabled = false,
  className = '',
  fullWidth = false
}) {
  // Variant styles - Blue outline theme
  const variantClasses = {
    primary: 'bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 border-blue-600 border-2 focus:ring-blue-500',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 border-gray-400 border-2 focus:ring-gray-500',
    outline: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border-gray-300 border-2 focus:ring-gray-500',
    success: 'bg-white hover:bg-green-50 active:bg-green-100 text-green-600 border-green-600 border-2 focus:ring-green-500',
    danger: 'bg-white hover:bg-red-50 active:bg-red-100 text-red-600 border-red-600 border-2 focus:ring-red-500',
    mega: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-transparent border-2 focus:ring-yellow-500 shadow-lg'
  };

  // Size styles with better touch targets
  const sizeClasses = {
    sm: 'px-4 py-3 text-sm min-h-[44px]',
    default: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };

  // Build button classes
  let buttonClasses = `
    inline-flex 
    items-center 
    justify-center 
    border 
    rounded-lg 
    font-semibold 
    transition-all 
    duration-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2
    touch-manipulation
    select-none
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  // Add disabled styling
  if (disabled) {
    buttonClasses += ' opacity-50 cursor-not-allowed';
    buttonClasses = buttonClasses.replace(/hover:\S+/g, '').replace(/active:\S+/g, ''); // Remove hover and active effects
  }

  const handleKeyDown = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    // Add keyboard interaction for better accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && onClick) {
        onClick(e);
      }
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={buttonClasses}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}