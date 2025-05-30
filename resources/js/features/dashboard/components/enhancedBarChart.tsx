import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Surat: 40, Juz: 2, Halaman: 10 },
  { name: 'Feb', Surat: 30, Juz: 39, Halaman: 21 },
  { name: 'Mar', Surat: 60, Juz: 45, Halaman: 20 },
  { name: 'Apr', Surat: 80, Juz: 39, Halaman: 80 },
  { name: 'May', Surat: 50, Juz: 40, Halaman: 50 },
  { name: 'Jun', Surat: 90, Juz: 30, Halaman: 20 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const EnhancedBarChart: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Tipe Setoran Terbanyak</h3>
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
          <Bar dataKey="Surat" fill={COLORS[0]} name="Surat" />
          <Bar dataKey="Juz" fill={COLORS[1]} name="Juz" />
          <Bar dataKey="Halaman" fill={COLORS[2]} name="Halaman" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnhancedBarChart;
