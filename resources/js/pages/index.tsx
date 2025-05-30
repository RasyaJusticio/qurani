import QuraniForm from '@/features/home/components/forms/form';
import Maps from '@/features/home/components/maps';
import Table from '@/features/home/components/table';
import { Friend } from '@/features/home/types/friend';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Option {
    value: string;
    name: string;
}

interface IndexProps {
    friends: Friend[];
}

const Index: React.FC<IndexProps> = ({ friends }) => {
    return (
        <>
            <Head title="Qurani" />
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <div className="w-full md:w-1/2">
                            <QuraniForm friends={friends} />
                        </div>
                        <div className="w-full md:w-1/2">
                            <Maps />
                        </div>
                    </div>
                    <div className="w-full">
                        <Table />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
