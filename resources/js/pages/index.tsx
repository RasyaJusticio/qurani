import AppWrapper from '@/components/layouts/app-wrapper';
import QuraniForm from '@/features/home/components/forms/form';
import Maps from '@/features/home/components/maps';
import Table from '@/features/home/components/table';
import { Chapter } from '@/features/home/types/chapter';
import { Friend } from '@/features/home/types/friend';
import { Group } from '@/features/home/types/group';
import { Juz } from '@/features/home/types/juz';
import { Setoran } from '@/features/home/types/setoran';
import { Periode, SetoranRekap, SetoranRekapTotal } from '@/features/home/types/setoranRekap';
import { UserSetting } from '@/features/home/types/userSettings';
import { Head } from '@inertiajs/react';
import React, { useEffect } from 'react';

interface IndexProps {
    friends: Friend[];
    groups: Group[];
    chapters: Chapter[];
    juzs: Juz[];
    userSettings: UserSetting[];
    setoran: Setoran[];
    setoranRekap: SetoranRekap[];
    setoranRekapTotal: SetoranRekapTotal[];
    periodes: Periode[];
    selectedPeriode: Periode | null;
    u_id: Number;
}

const Index: React.FC<IndexProps> = ({
    friends,
    groups,
    chapters,
    juzs,
    userSettings,
    setoran,
    setoranRekap,
    periodes,
    selectedPeriode,
    setoranRekapTotal,
    u_id,
}) => {

    useEffect(() => {
        console.log('cookie:', u_id);
        localStorage.removeItem('setoran-data');
    }, [setoranRekap]);


    return (
        <AppWrapper>
            <Head title="Qurani" />
            <div className="mt-15 flex w-full justify-center px-18 py-6">
                <div className="flex w-full flex-col gap-2">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <div className="w-full">
                            <QuraniForm friends={friends} groups={groups} chapters={chapters} juzs={juzs} />
                        </div>
                        <div className="w-full">
                            <Maps
                                setoranRekap={setoranRekap}
                                setoranRekapTotal={setoranRekapTotal}
                                periodes={periodes}
                                selectedPeriode={selectedPeriode}
                            />
                        </div>
                    </div>
                    <div className="w-full">
                        <Table fluidDesign={true} setoran={setoran} />
                    </div>
                </div>
            </div>
        </AppWrapper>
    );
};

export default Index;
