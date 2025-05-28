import FilterSection from '@/features/dashboard/components/filter';
import Table from '@/features/home/components/table';
import React from 'react';

const DashboardPage: React.FC = () => {
    return (
        <>
        <div className="min-hscreen">
            <div className="mx-20">
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
