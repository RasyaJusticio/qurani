import QuranHeader from '@/components/layouts/main-header';
import Card from '@/features/dashboard/components/card';
import CityTable from '@/features/dashboard/components/cityTable';
import EnhancedBarChart from '@/features/dashboard/components/enhancedBarChart';
import EnhancedLineChart from '@/features/dashboard/components/enhancedLineChart';
import PieChartComponent from '@/features/dashboard/components/piechart';
import ProvinceTable from '@/features/dashboard/components/provinceTable';
import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { FaBookOpen } from 'react-icons/fa';
import { FiActivity, FiTrendingUp, FiUsers } from 'react-icons/fi';

interface PageProps {
    usersCount: Number;
    setoranCount: Number;
    popularSurah: {
        info: string;
        total: Number;
    };
}

const DashboardPage: React.FC<PageProps> = ({ usersCount, setoranCount, popularSurah }) => {
    useEffect(() => {});
    return (
        <>
        <Head title='Dashboard'/>
        <div className="min-h-screen bg-gray-50">
            {/* QuranHeader component */}
            <QuranHeader page={1} translateMode="read" classNav="" finishButtonPath="/Rekapan-surah" isJuz={false} />
            <div className="min-h-screen bg-gray-50 p-6 ">
                {/* 4 Cards */}
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4  mt-12">
                    <Card
                        title="Total Setoran"
                        value={setoranCount.toString()}
                        icon={<FaBookOpen className="text-xl text-blue-500" />}
                        trend="dari bulan terakhir"
                        trendValue="+12%"
                        trendPositive={true}
                    />
                    <Card
                        title="Pengguna"
                        value={usersCount.toString()}
                        icon={<FiUsers className="text-xl text-green-500" />}
                        trend="dari bulan terakhir"
                        trendValue="+8%"
                        trendPositive={true}
                    />
                    <Card
                        title="Total Setoran Hari Ini"
                        value="4"
                        icon={<FiTrendingUp className="text-xl text-purple-500" />}
                        trend="dari hari terakhir"
                        trendValue="-0.5%"
                        trendPositive={false}
                    />
                    <Card
                        title="Surat Terpopuler"
                        value={popularSurah.info}
                        icon={<FiActivity className="text-xl text-orange-500" />}
                        trend=""
                        trendValue=""
                        trendPositive={true}
                    />
                </div>

                {/* Pie and Bar Charts */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <PieChartComponent />
                    <EnhancedBarChart />
                </div>

                {/* Full Width Line Chart */}
                <EnhancedLineChart />

                {/* Province and City Tables */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ProvinceTable />
                    <CityTable />
                </div>
            </div>
        </div>
        </>
    );
};

export default DashboardPage;
