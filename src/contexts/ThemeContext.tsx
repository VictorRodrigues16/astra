/**
 * ThemeContext — deriva o tema ativo a partir das preferencias do usuario
 * (modo claro/escuro/sistema + cor de destaque) e o disponibiliza para toda
 * a arvore de componentes.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme, type ColorMode, type Theme } from '../theme';
import { useSettings } from './SettingsContext';

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  mode: ColorMode;
  /** Alterna explicitamente entre claro e escuro. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, setThemeMode } = useSettings();
  // useColorScheme pode retornar 'light' | 'dark' | null; normalizamos para ColorMode.
  const systemScheme: ColorMode = useColorScheme() === 'light' ? 'light' : 'dark';

  const mode: ColorMode = settings.themeMode === 'system' ? systemScheme : settings.themeMode;

  const value = useMemo<ThemeContextValue>(() => {
    const theme = buildTheme(mode, settings.accentKey);
    return {
      theme,
      isDark: mode === 'dark',
      mode,
      toggleTheme: () => setThemeMode(mode === 'dark' ? 'light' : 'dark'),
    };
  }, [mode, settings.accentKey, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>.');
  return ctx;
}
