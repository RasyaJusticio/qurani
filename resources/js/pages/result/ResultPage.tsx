import AppWrapper from '@/components/layouts/app-wrapper';
import QuranHeader from '@/components/layouts/main-header';
import PageRecapFormLayout from '@/features/result/components/pageRecapForm';
import { Head } from '@inertiajs/react';

const index = () => {
    return (
        <AppWrapper>
            <Head title="Recap" />
            <QuranHeader page={1} translateMode="read" classNav="ms-3" target="/result-page" />
            <div>
                <PageRecapFormLayout />
            </div>
        </AppWrapper>
    );
};

export default index;
