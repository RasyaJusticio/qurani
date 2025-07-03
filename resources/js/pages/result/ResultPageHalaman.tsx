import AppWrapper from '@/components/layouts/app-wrapper';
import RecapHeader from '@/components/layouts/recap-header';
import PageRecapFormLayout from '@/features/result/components/pageHalamanResultForm';
import { Head } from '@inertiajs/react';

const index = () => {
    return (
        <AppWrapper>
            <Head title="Recap" />
            <RecapHeader page={1} translateMode="read" classNav="" target="/result-page" />
            <div>
                <PageRecapFormLayout />
            </div>
        </AppWrapper>
    );
};

export default index;
