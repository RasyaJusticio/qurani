import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', productA: 400, productB: 240, productC: 180 },
  { name: 'Feb', productA: 300, productB: 139, productC: 221 },
  { name: 'Mar', productA: 600, productB: 450, productC: 320 },
  { name: 'Apr', productA: 800, productB: 390, productC: 280 },
  { name: 'May', productA: 500, productB: 480, productC: 350 },
  { name: 'Jun', productA: 900, productB: 380, productC: 420 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const EnhancedBarChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Product Comparison</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
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
          <Bar dataKey="productA" fill={COLORS[0]} name="Product A" />
          <Bar dataKey="productB" fill={COLORS[1]} name="Product B" />
          <Bar dataKey="productC" fill={COLORS[2]} name="Product C" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedBarChart;
