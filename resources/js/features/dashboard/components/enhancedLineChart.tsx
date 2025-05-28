import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartToggle from './chartToggle';

const generateData = (range: 'week' | 'month' | 'year') => {
  if (range === 'week') {
    return Array.from({ length: 7 }, (_, i) => ({
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      value: Math.floor(Math.random() * 2000) + 500,
    }));
  }

  if (range === 'month') {
    return Array.from({ length: 30 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 2000) + 500,
    }));
  }

  return Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(Math.random() * 2000) + 500,
  }));
};

const EnhancedLineChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [data, setData] = React.useState(generateData('month'));

  const handleRangeChange = (range: 'week' | 'month' | 'year') => {
    setTimeRange(range);
    setData(generateData(range));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Performance Trend</h3>
        <ChartToggle onRangeChange={handleRangeChange} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: 'none'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedLineChart;
