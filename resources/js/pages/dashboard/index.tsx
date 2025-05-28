import React from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiActivity } from 'react-icons/fi';
import Card from '@/features/dashboard/components/card';
import PieChartComponent from '@/features/dashboard/components/piechart';
import EnhancedBarChart from '@/features/dashboard/components/enhancedBarChart';
import EnhancedLineChart from '@/features/dashboard/components/enhancedLineChart';
import ProvinceTable from '@/features/dashboard/components/provinceTable';
import CityTable from '@/features/dashboard/components/cityTable';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          title="Total Revenue"
          value="$12,345"
          icon={<FiDollarSign className="text-blue-500 text-xl" />}
          trend="vs last month"
          trendValue="+12%"
          trendPositive={true}
        />
        <Card
          title="Users"
          value="1,234"
          icon={<FiUsers className="text-green-500 text-xl" />}
          trend="vs last month"
          trendValue="+8%"
          trendPositive={true}
        />
        <Card
          title="Conversion"
          value="3.2%"
          icon={<FiTrendingUp className="text-purple-500 text-xl" />}
          trend="vs last month"
          trendValue="-0.5%"
          trendPositive={false}
        />
        <Card
          title="Active Now"
          value="56"
          icon={<FiActivity className="text-orange-500 text-xl" />}
          trend="vs last hour"
          trendValue="+12"
          trendPositive={true}
        />
      </div>

      {/* Pie and Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PieChartComponent />
        <EnhancedBarChart />
      </div>

      {/* Full Width Line Chart */}
      <EnhancedLineChart />

      {/* Province and City Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProvinceTable />
        <CityTable />
      </div>
    </div>
  );
};

export default DashboardPage;
