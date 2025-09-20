export default function Container({ children, className = '', size = 'default', compact = false }) {
  // Size variants for different container widths with better responsive breakpoints
  const sizeClasses = {
    'sm': 'max-w-2xl',
    'default': 'max-w-4xl', 
    'lg': 'max-w-6xl',
    'xl': 'max-w-7xl',
    'full': 'max-w-full'
  };

  const paddingClasses = compact ? 'px-2 sm:px-3' : 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12';

  const containerClasses = `
    ${sizeClasses[size]} 
    mx-auto 
    ${paddingClasses}
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}