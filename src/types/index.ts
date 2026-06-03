/**
 * Barril de tipos do dominio + tipos transversais (localizacao, favoritos,
 * estado de requisicoes).
 */
export * from './nasa';
export * from './weather';
export * from './iss';

import type { Apod, Asteroid } from './nasa';

export interface GeoLocation {
  lat: number;
  lon: number;
  /** Rotulo amigavel, ex.: "Sao Paulo, BR". */
  label: string;
  /** Indica se veio do GPS do dispositivo ou de um fallback. */
  source: 'device' | 'fallback';
}

/* ------------------------------ Favoritos ------------------------------- */
export type FavoriteKind = 'asteroid' | 'apod';

interface FavoriteBase {
  id: string;
  kind: FavoriteKind;
  savedAt: number;
}

export interface AsteroidFavorite extends FavoriteBase {
  kind: 'asteroid';
  asteroid: Asteroid;
}

export interface ApodFavorite extends FavoriteBase {
  kind: 'apod';
  apod: Apod;
}

/** Uniao discriminada — permite tratar cada tipo de favorito com seguranca. */
export type FavoriteItem = AsteroidFavorite | ApodFavorite;

/* --------------------------- Estado de async ---------------------------- */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
  /** Quando os dados vieram do cache local (offline / limite de API). */
  fromCache: boolean;
  /** Momento da ultima atualizacao bem-sucedida. */
  updatedAt: number | null;
}
