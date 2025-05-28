import React from 'react';

type CardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendValue: string;
  trendPositive: boolean;
};

const Card: React.FC<CardProps> = ({ title, value, icon, trend, trendValue, trendPositive }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
      </div>
      <div className={`mt-4 flex items-center ${trendPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span className="text-sm font-medium">
          {trendValue} {trend}
        </span>
      </div>
    </div>
  );
};

export default Card;
