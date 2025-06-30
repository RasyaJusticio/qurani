import { IS_IN_IFRAME } from '../constants/global';
import { useAppearance } from '@/hooks/use-appearance';
import { BaseEvent, InitialDataEvent } from '@/types/events';
import { changeLanguage } from '@/utils/changeLanguage';
import { postMessage } from '@/utils/postMessage';
import { createContext, FC, ReactNode, useEffect } from 'react';

const EventsHandlerContext = createContext(null);

type Props = {
    children?: ReactNode;
};

export const EventsHandlerProvider: FC<Props> = ({ children }) => {
    const { updateAppearance } = useAppearance();

    useEffect(() => {
        const handleMessage = (event: MessageEvent<BaseEvent>) => {
            const evMethod = event.data.method;
            const evType = event.data.type;

            if (evMethod === 'RESP') {
                switch (evType) {
                    case 'initial_data': {
                        const evData = event.data as InitialDataEvent;

                        updateAppearance(evData.data.appearance);
                        changeLanguage(evData.data.language);
                        break;
                    }
                }
            }
        };

        if (IS_IN_IFRAME) {
            window.addEventListener('message', handleMessage);

            postMessage('GET', 'initial_data');
        }

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [updateAppearance]);

    return <EventsHandlerContext.Provider value={null}>{children}</EventsHandlerContext.Provider>;
};