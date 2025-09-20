/**
 * Responsive Design Test Component
 * This component can be used to test responsive features
 */

import { useState } from 'react';
import Button from '../Button';
import Card from '../Card';
import OptionButton from '../OptionButton';
import ProgressBar from '../ProgressBar';

export default function ResponsiveTest() {
  const [selectedOption, setSelectedOption] = useState('');
  const [progress, setProgress] = useState(50);

  const testOption = {
    optionnumber: 'A',
    optiontext: 'This is a test option to verify touch targets and keyboard navigation',
    iscorrect: true
  };

  const handleKeyDown = (e) => {
    console.log('Key pressed:', e.key);
    if (e.key === 'ArrowUp' && progress < 100) {
      setProgress(prev => Math.min(prev + 10, 100));
    } else if (e.key === 'ArrowDown' && progress > 0) {
      setProgress(prev => Math.max(prev - 10, 0));
    }
  };

  return (
    <div className="p-4 space-y-6" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
        Responsive Design Test
      </h1>
      
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Progress Bar Test
        </h2>
        <ProgressBar 
          current={Math.floor(progress / 10)} 
          total={10} 
          percentage={progress} 
        />
        <p className="text-sm text-gray-600 mt-2">
          Use arrow keys to change progress
        </p>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Button Test
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="primary" size="sm">Small Button</Button>
          <Button variant="secondary" size="default">Default Button</Button>
          <Button variant="outline" size="lg">Large Button</Button>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          Option Button Test
        </h2>
        <OptionButton
          option={testOption}
          isSelected={selectedOption === 'A'}
          showFeedback={false}
          isMultipleChoice={false}
          onSelect={(option) => setSelectedOption(option)}
          disabled={false}
        />
      </Card>

      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>Test Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Resize browser window to test responsive breakpoints</li>
          <li>Use keyboard navigation (Tab, Enter, Space, Arrow keys)</li>
          <li>Test touch interactions on mobile devices</li>
          <li>Verify minimum touch target sizes (44px on mobile)</li>
          <li>Check focus states are visible</li>
        </ul>
      </div>
    </div>
  );
}