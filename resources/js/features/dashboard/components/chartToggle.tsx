import React, { useState } from 'react';

type TimeRange = 'week' | 'month' | 'year';

const ChartToggle: React.FC<{ onRangeChange: (range: TimeRange) => void }> = ({ onRangeChange }) => {
  const [activeRange, setActiveRange] = useState<TimeRange>('month');

  const handleRangeChange = (range: TimeRange) => {
    setActiveRange(range);
    onRangeChange(range);
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-500">Time Range:</span>
      {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => handleRangeChange(range)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            activeRange === range
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {range.charAt(0).toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ChartToggle;
