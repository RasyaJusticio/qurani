import AppWrapper from '@/components/layouts/app-wrapper';
import QuraniForm from '@/features/home/components/forms/form';
import Maps from '@/features/home/components/maps';
import Table from '@/features/home/components/table';
import { Chapter } from '@/features/home/types/chapter';
import { Friend } from '@/features/home/types/friend';
import { Group } from '@/features/home/types/group';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface Option {
    value: string;
    name: string;
}

interface IndexProps {
    friends: Friend[];
    groups: Group[];
    chapters: Chapter[];
}

const Index: React.FC<IndexProps> = ({ friends, groups, chapters }) => {
    return (
        <AppWrapper>
            <Head title="Qurani" />
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="w-full">
                            <QuraniForm friends={friends} groups={groups} chapters={chapters}/>
                        </div>
                        <div className="w-full">
                            <Maps />
                        </div>
                    </div>
                    <div className="w-full">
                        <Table />
                    </div>
                </div>
            </div>
        </AppWrapper>
    );
};

export default Index;
