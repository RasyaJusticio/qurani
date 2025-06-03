import AppWrapper from '@/components/layouts/app-wrapper';
import QuraniForm from '@/features/home/components/forms/form';
import Maps from '@/features/home/components/maps';
import Table from '@/features/home/components/table';
import { Chapter } from '@/features/home/types/chapter';
import { Friend } from '@/features/home/types/friend';
import { Group } from '@/features/home/types/group';
import { Juz } from '@/features/home/types/juz';
import { UserSetting } from '@/features/home/types/userSettings';
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
    juzs: Juz[];
    userSettings: UserSetting[];
}

const Index: React.FC<IndexProps> = ({ friends, groups, chapters, juzs, userSettings }) => {

    useEffect(() => {
        console.log("User Settings:", userSettings);
    }, [userSettings]);
    return (
        <AppWrapper>
            <Head title="Qurani" />
            <div className=" w-full flex justify-center py-6 px-18 mt-15">
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="w-full">
                            <QuraniForm friends={friends} groups={groups} chapters={chapters} juzs={juzs}/>
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
