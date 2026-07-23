import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: typeof Colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark'); // Default to dark

  // Determine actual theme based on mode
  const theme: 'light' | 'dark' = themeMode === 'system'
    ? (systemColorScheme as 'light' | 'dark' || 'light')
    : themeMode;

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      // Switch to explicit mode opposite of current system
      const newMode = systemColorScheme === 'dark' ? 'light' : 'dark';
      setThemeMode(newMode);
    } else {
      const newMode = theme === 'light' ? 'dark' : 'light';
      setThemeMode(newMode);
    }
  };

  const colors = Colors[theme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode: handleSetThemeMode,
        toggleTheme,
        colors
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
