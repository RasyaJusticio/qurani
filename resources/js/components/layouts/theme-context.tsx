import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextValue {
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isDarkMode: false });

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_PARENT_URL) return;
      const { s_night_mode } = event.data?.data || {};
      if (typeof s_night_mode !== 'undefined') {
        setIsDarkMode(s_night_mode === 1 || s_night_mode === '1' || s_night_mode === true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? 'rgb(30,37,43)' : 'rgb(238,240,243)';
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
