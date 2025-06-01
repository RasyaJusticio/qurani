import QuranHeader from '@/components/layouts/main-header';
import FilterSection from '@/features/dashboard/components/filter';
import Table from '@/features/home/components/table';
import { Head } from '@inertiajs/react';
import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <>
            <QuranHeader page={1} translateMode="read" classNav="fixed top-0 right-0 left-0" finishButtonPath="/Rekapan-surah" isJuz={false}/>
            <Head title="Filter" />
            <div className="min-hscreen">
                <div className="mx-20 mt-15">
                    <FilterSection />
                    <div className="mx-5">
                        <Table />
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
