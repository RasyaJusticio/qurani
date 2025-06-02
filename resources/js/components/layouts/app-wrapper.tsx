import React, { useEffect } from 'react';
import IFrameGuard from './iframe-guard';
import { router } from '@inertiajs/react';
import { GenericEvent, ParentStateEvent } from '@/types/PostMessageEvents';

interface AppWrapperProps {
    children?: React.ReactNode;
}

const parentUrl = import.meta.env.VITE_PARENT_URL;

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
    const handleParentStateEvent = async (data: ParentStateEvent['data']) => {
        try {
            console.log(data);

            localStorage.setItem('parent_data', JSON.stringify(data));

        } catch (error) {
        }
    }

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== parentUrl) { router.visit(route('redirect'));
                return;
            }

            const eventType: GenericEvent['type'] = event.data.type;

            if (eventType === "parent_state") {
                const { data } = event.data as ParentStateEvent;

                handleParentStateEvent(data);
            }
        }

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        }
    }, []);

    return <IFrameGuard>
        {children}
    </IFrameGuard>
}

export default AppWrapper;
