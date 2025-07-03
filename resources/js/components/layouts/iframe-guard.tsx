import React from 'react';

interface IFrameGuardProps {
    children?: React.ReactNode;
}

const isAllowed = window.name === 'qurani-iframe' || import.meta.env.VITE_ENVIRONMENT === 'DEV';
if (!isAllowed) {
    window.location.replace(route('redirect'));
    document.documentElement.style.visibility = 'visible';
    document.documentElement.style.cssText = 'visibility: hidden !important; opacity: 0 !important;';
}

const IFrameGuard: React.FC<IFrameGuardProps> = ({ children }) => {
    if (!isAllowed) {
        return null;
    }

    return <>{children}</>;
};

export default IFrameGuard;
