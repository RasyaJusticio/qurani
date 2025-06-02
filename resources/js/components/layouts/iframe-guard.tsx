import { router } from '@inertiajs/react';
import React from 'react';

interface IFrameGuardProps {
    children?: React.ReactNode;
}

const IFrameGuard: React.FC<IFrameGuardProps> = ({ children }) => {
    if (window.name === 'qurani-iframe' || import.meta.env.VITE_ENVIRONMENT == "DEV") {
        return (
            <>
                {children}
            </>
        );
    }

    router.visit(route('redirect'));
}

export default IFrameGuard;
