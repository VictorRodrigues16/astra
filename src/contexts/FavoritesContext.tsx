/**
 * FavoritesContext — gerencia favoritos (asteroides e imagens APOD) e o
 * historico de itens visualizados recentemente. Tudo persistido localmente
 * via AsyncStorage.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { StorageKeys } from '../storage/keys';
import { getItem, setItem } from '../storage/storage';
import type { Apod, Asteroid, FavoriteItem } from '../types';

const HISTORY_LIMIT = 20;

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  history: Asteroid[];
  ready: boolean;
  favoriteCount: number;
  isFavorite: (id: string) => boolean;
  toggleAsteroid: (asteroid: Asteroid) => void;
  toggleApod: (apod: Apod) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  addHistory: (asteroid: Asteroid) => void;
  clearHistory: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const apodFavoriteId = (apod: Apod) => `apod-${apod.date}`;

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<Asteroid[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [savedFav, savedHist] = await Promise.all([
        getItem<FavoriteItem[]>(StorageKeys.favorites),
        getItem<Asteroid[]>(StorageKeys.history),
      ]);
      if (mounted) {
        if (savedFav) setFavorites(savedFav);
        if (savedHist) setHistory(savedHist);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (ready) void setItem(StorageKeys.favorites, favorites);
  }, [favorites, ready]);

  useEffect(() => {
    if (ready) void setItem(StorageKeys.history, history);
  }, [history, ready]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggleAsteroid = useCallback((asteroid: Asteroid) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === asteroid.id)) {
        return prev.filter((f) => f.id !== asteroid.id);
      }
      return [{ id: asteroid.id, kind: 'asteroid', savedAt: Date.now(), asteroid }, ...prev];
    });
  }, []);

  const toggleApod = useCallback((apod: Apod) => {
    const id = apodFavoriteId(apod);
    setFavorites((prev) => {
      if (prev.some((f) => f.id === id)) {
        return prev.filter((f) => f.id !== id);
      }
      return [{ id, kind: 'apod', savedAt: Date.now(), apod }, ...prev];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  const addHistory = useCallback((asteroid: Asteroid) => {
    setHistory((prev) => {
      const deduped = prev.filter((a) => a.id !== asteroid.id);
      return [asteroid, ...deduped].slice(0, HISTORY_LIMIT);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      history,
      ready,
      favoriteCount: favorites.length,
      isFavorite,
      toggleAsteroid,
      toggleApod,
      removeFavorite,
      clearFavorites,
      addHistory,
      clearHistory,
    }),
    [
      favorites,
      history,
      ready,
      isFavorite,
      toggleAsteroid,
      toggleApod,
      removeFavorite,
      clearFavorites,
      addHistory,
      clearHistory,
    ],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites deve ser usado dentro de <FavoritesProvider>.');
  return ctx;
}
