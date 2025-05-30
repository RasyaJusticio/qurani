import QuraniForm from '@/features/home/components/forms/form';
import Maps from '@/features/home/components/maps';
import Table from '@/features/home/components/table';
import { Head } from '@inertiajs/react';
import React from 'react';

interface Option {
    value: string;
    name: string;
}

interface IndexProps {
    groups: Option[];
    user_fullname: string;
}

const Index: React.FC<IndexProps> = ({ groups, user_fullname }) => {
    return (
        <>
            <Head title="Qurani" />
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <div className="w-full md:w-1/2">
                            <QuraniForm />
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
