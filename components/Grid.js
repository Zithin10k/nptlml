export default function Grid({ 
  children, 
  cols = 'auto',
  gap = 'default',
  className = '' 
}) {
  // Column variants for responsive grid with better mobile-first approach
  const colClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    '5': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    '6': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    '7': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7',
    'auto': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  };

  // Gap variants with responsive adjustments
  const gapClasses = {
    'none': 'gap-0',
    'sm': 'gap-2 sm:gap-3',
    'default': 'gap-3 sm:gap-4 md:gap-5',
    'lg': 'gap-4 sm:gap-6 md:gap-8',
    'xl': 'gap-6 sm:gap-8 md:gap-10'
  };

  const gridClasses = `
    grid 
    ${colClasses[cols]} 
    ${gapClasses[gap]} 
    ${className}
  `.trim();

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}