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
            // Handle error
        }
    }

    // Function to notify parent about route changes
    const notifyParentRouteChange = (path: string) => {
        window.parent.postMessage(
            {
                type: 'route_change',
                path: path,
            },
            parentUrl
        );
    };

    useEffect(() => {
        const currentPath = window.location.pathname;

        // Initial notification to parent
        window.parent.postMessage(
            {
                type: 'iframe_ready',
                path: currentPath,
            },
            '*'
        );

        // Notify parent about current route
        notifyParentRouteChange(currentPath);

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== parentUrl) {
                router.visit(route('redirect'));
                return;
            }

            const eventType: GenericEvent['type'] = event.data.type;
            if (eventType === "parent_state") {
                const { data } = event.data as ParentStateEvent;
                handleParentStateEvent(data);
            }
        }

        window.addEventListener('message', handleMessage);

        // Listen for route changes (for SPA navigation)
        const handleRouteChange = () => {
            const newPath = window.location.pathname;
            notifyParentRouteChange(newPath);
        };

        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', handleRouteChange);

        // If using Inertia.js, listen for navigation events
        const handleInertiaNavigation = (event: any) => {
            // Delay to ensure URL has changed
            setTimeout(() => {
                const newPath = window.location.pathname;
                notifyParentRouteChange(newPath);
            }, 10);
        };

        // Listen for Inertia navigation events if available
        if (typeof window !== 'undefined' && (window as any).Inertia) {
            (window as any).Inertia.on('navigate', handleInertiaNavigation);
        }

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('popstate', handleRouteChange);
            if (typeof window !== 'undefined' && (window as any).Inertia) {
                (window as any).Inertia.off('navigate', handleInertiaNavigation);
            }
        }
    }, []);

    // Also notify parent when component mounts with different routes
    useEffect(() => {
        const currentPath = window.location.pathname;
        notifyParentRouteChange(currentPath);
    }, [window.location.pathname]);

    return (
        <IFrameGuard>
            {children}
        </IFrameGuard>
    );
}

export default AppWrapper;
