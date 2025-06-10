import { router } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import IFrameGuard from './iframe-guard';
import { ThemeProvider } from './theme-context';

interface AppWrapperProps {
  children?: React.ReactNode;
}

const parentUrl = import.meta.env.VITE_PARENT_URL;

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const [recipient, setRecipient] = useState<string | null>(null);

  const notifyParentRouteChange = (path: string) => {
    window.parent.postMessage(
      {
        type: 'route_change',
        path,
      },
      parentUrl,
    );
  };

  // Simpan recipient ke localStorage
  useEffect(() => {
    if (recipient) {
      const oldSetoranData = JSON.parse(localStorage.getItem('setoran-data') ?? '{}');
      const setoranData = {
        ...oldSetoranData,
        recipient,
      };
      localStorage.setItem('setoran-data', JSON.stringify(setoranData));
    }
  }, [recipient]);

  useEffect(() => {
    // Cek apakah diakses langsung (bukan di dalam iframe)
    if (window.self === window.top) {
      console.warn('Direct access detected, redirecting...');
      router.visit(route('redirect'));
      return;
    }

    const currentPath = window.location.pathname;

    // Kirim sinyal bahwa iframe sudah siap
    window.parent.postMessage(
      {
        type: 'iframe_ready',
        path: currentPath,
      },
      parentUrl,
    );

    // Juga kirim path sekarang ke parent
    notifyParentRouteChange(currentPath);

    // Cek apakah sudah ada recipient di localStorage
    const existingData = localStorage.getItem('setoran-data');
    if (existingData) {
      const parsedData = JSON.parse(existingData);
      if (parsedData.recipient) {
        setRecipient(parsedData.recipient);
      }
    }

    const handleMessage = (event: MessageEvent) => {
      // Validasi origin parent
      if (event.origin !== parentUrl) {
        console.warn('Origin mismatch, redirecting...');
        router.visit(route('redirect'));
        return;
      }

      const messageData = event.data?.data || event.data;

      // Tangani perubahan recipient
      if (typeof messageData?.c_user === 'string') {
        setRecipient(messageData.c_user);

        axios
          .post('/set-cookie', { u_id: messageData.c_user })
          .then(() => console.log('u_id berhasil dikirim ke Laravel'))
          .catch(console.error);
      }
    };

    window.addEventListener('message', handleMessage);

    const handleRouteChange = () => {
      notifyParentRouteChange(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);

    const handleInertia = () => setTimeout(() => {
      notifyParentRouteChange(window.location.pathname);
    }, 10);

    (window as any).Inertia?.on('navigate', handleInertia);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('popstate', handleRouteChange);
      (window as any).Inertia?.off('navigate', handleInertia);
    };
  }, []);

  return (
    <ThemeProvider>
      <IFrameGuard>{children}</IFrameGuard>
    </ThemeProvider>
  );
};

export default AppWrapper;
