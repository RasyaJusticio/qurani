import React from 'react'
import RecapForm from '@/features/recap/components/recapForm'
import { Head } from '@inertiajs/react'
import AppWrapper from '@/components/layouts/app-wrapper'
import QuranHeader from '@/components/layouts/main-header'
import { Inertia } from '@inertiajs/inertia'

const index = () => {
  return (
    <AppWrapper>
        <Head title='Recap'/>
        <QuranHeader
                page={1}
                translateMode="read"
                classNav="ms-3"
                onFinish={() => {
                Inertia.visit('/result');
                }}
        />
        <div>
            <RecapForm/>
        </div>
    </AppWrapper>
  )
}

export default index
