import { IS_IN_IFRAME } from '@/constants/global';
import { EventsHandlerProvider } from '@/context/EventsHandler';
import React from 'react';
import IFrameGuard from './iframe-guard';

type AppWrapperProps = {
    children?: React.ReactNode;
};

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
    if (IS_IN_IFRAME) {
        return (
            <IFrameGuard>
                <EventsHandlerProvider>{children}</EventsHandlerProvider>
            </IFrameGuard>
        );
    } else {
        return <EventsHandlerProvider>{children}</EventsHandlerProvider>;
    }
};

export default AppWrapper;