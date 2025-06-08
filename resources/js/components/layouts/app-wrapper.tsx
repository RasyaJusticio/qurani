import { router } from '@inertiajs/react';
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import IFrameGuard from './iframe-guard';

interface AppWrapperProps {
    children?: React.ReactNode;
}

const parentUrl = import.meta.env.VITE_PARENT_URL;

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
    const notifyParentRouteChange = (path: string) => {
        window.parent.postMessage(
            {
                type: 'route_change',
                path: path,
            },
            parentUrl,
        );
    };

    useEffect(() => {

        const currentPath = window.location.pathname;

        window.parent.postMessage(
            {
                type: 'iframe_ready',
                path: currentPath,
            },
            '*',
        );

        notifyParentRouteChange(currentPath);

        const handleMessage = (event: MessageEvent) => {
            const cUser = event.data?.data?.c_user;
            const setoranData = {
                recipient: cUser,
            }
            localStorage.setItem('setoran-data',JSON.stringify(setoranData));
            axios
                .post('/set-cookie', {
                    u_id: cUser,
                })
                .then(() => {
                    console.log('u_id berhasil dikirim ke Laravel dan disimpan ke cookie');

                })
                .catch((error) => {
                    console.error('Gagal kirim ke Laravel:', error);
                });

            if (event.origin !== parentUrl) {
                console.log('Origin mismatch, redirecting...');
                router.visit(route('redirect'));
                return;
            }
        };

        window.addEventListener('message', handleMessage);

        const handleRouteChange = () => {
            const newPath = window.location.pathname;
            notifyParentRouteChange(newPath);
        };

        window.addEventListener('popstate', handleRouteChange);

        const handleInertiaNavigation = (event: any) => {
            setTimeout(() => {
                const newPath = window.location.pathname;
                notifyParentRouteChange(newPath);
            }, 10);
        };

        if (typeof window !== 'undefined' && (window as any).Inertia) {
            (window as any).Inertia.on('navigate', handleInertiaNavigation);
        }

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('popstate', handleRouteChange);
            if (typeof window !== 'undefined' && (window as any).Inertia) {
                (window as any).Inertia.off('navigate', handleInertiaNavigation);
            }
        };
    }, []);

    useEffect(() => {
        const currentPath = window.location.pathname;
        notifyParentRouteChange(currentPath);
    }, [window.location.pathname]);

    return <IFrameGuard>{children}</IFrameGuard>;
};

export default AppWrapper;
