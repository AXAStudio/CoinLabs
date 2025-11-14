import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeOption = 'light' | 'dark' | 'system';

export interface Settings {
  theme: ThemeOption;
  primaryColor: string; // hex
  numberFormat: 'full' | 'abbreviated';
  decimals: number;
  autoRefresh: boolean;
}

const DEFAULTS: Settings = {
  theme: 'system',
  primaryColor: '#06b6d4', // cyan-500
  numberFormat: 'full',
  decimals: 2,
  autoRefresh: true,
};

const StorageKey = 'coinlabs_settings_v1';

const SettingsContext = createContext<{
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
}>({
  settings: DEFAULTS,
  setSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<Settings>(() => {
    try {
      const raw = localStorage.getItem(StorageKey);
      if (!raw) return DEFAULTS;
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch (e) {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(StorageKey, JSON.stringify(settings));
    } catch (e) {
      // ignore
    }

    // apply theme
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system: follow prefers-color-scheme
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }

    // apply primary color as CSS variable
    root.style.setProperty('--coinlabs-primary', settings.primaryColor || DEFAULTS.primaryColor);
  }, [settings]);

  const setSettings = (patch: Partial<Settings>) => {
    setSettingsState((prev) => ({ ...prev, ...patch }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
