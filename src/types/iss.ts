/**
 * Tipos do rastreamento da Estacao Espacial Internacional (ISS).
 * Fonte: API publica wheretheiss.at (sem chave).
 */

export interface IssRaw {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

export interface IssPosition {
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKph: number;
  visibility: string;
  footprintKm: number;
  timestamp: number;
}
