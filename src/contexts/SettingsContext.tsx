/**
 * SettingsContext — fonte unica de verdade das preferencias do usuario.
 *
 * Persistido no AsyncStorage e carregado na inicializacao. Tambem sincroniza
 * a chave da NASA com a camada de servico.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { setNasaApiKey } from '../services/nasa.service';
import { StorageKeys } from '../storage/keys';
import { getItem, setItem } from '../storage/storage';
import type { TempUnit } from '../utils/format';
import { defaultAccentKey } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Settings {
  themeMode: ThemeMode;
  accentKey: string;
  tempUnit: TempUnit;
  /** Chave pessoal da NASA; vazio usa a DEMO_KEY. */
  nasaApiKey: string;
  /** Reduz animacoes (acessibilidade / preferencia). */
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  themeMode: 'dark',
  accentKey: defaultAccentKey,
  tempUnit: 'celsius',
  nasaApiKey: '',
  reduceMotion: false,
};

interface SettingsContextValue {
  settings: Settings;
  /** false enquanto carrega do armazenamento. */
  ready: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentKey: (key: string) => void;
  setTempUnit: (unit: TempUnit) => void;
  setNasaKey: (key: string) => void;
  setReduceMotion: (value: boolean) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  // carrega preferencias salvas
  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await getItem<Partial<Settings>>(StorageKeys.settings);
      if (mounted && saved) {
        const merged = { ...DEFAULT_SETTINGS, ...saved };
        setSettings(merged);
        setNasaApiKey(merged.nasaApiKey);
      }
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // persiste a cada mudanca (apos o carregamento inicial)
  useEffect(() => {
    if (ready) void setItem(StorageKeys.settings, settings);
  }, [settings, ready]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode) => update({ themeMode }), [update]);
  const setAccentKey = useCallback((accentKey: string) => update({ accentKey }), [update]);
  const setTempUnit = useCallback((tempUnit: TempUnit) => update({ tempUnit }), [update]);
  const setReduceMotion = useCallback((reduceMotion: boolean) => update({ reduceMotion }), [update]);

  const setNasaKey = useCallback(
    (nasaApiKey: string) => {
      setNasaApiKey(nasaApiKey);
      update({ nasaApiKey });
    },
    [update],
  );

  const resetSettings = useCallback(() => {
    setNasaApiKey(DEFAULT_SETTINGS.nasaApiKey);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      ready,
      setThemeMode,
      setAccentKey,
      setTempUnit,
      setNasaKey,
      setReduceMotion,
      resetSettings,
    }),
    [settings, ready, setThemeMode, setAccentKey, setTempUnit, setNasaKey, setReduceMotion, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings deve ser usado dentro de <SettingsProvider>.');
  return ctx;
}
