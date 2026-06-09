/**
 * Geocodificacao reversa (coordenadas -> nome da cidade) via BigDataCloud,
 * endpoint "client" gratuito e sem chave. Resultado cacheado por 24h.
 */
import { resolveBase } from '../config';
import { formatCoord } from '../utils/format';
import { createClient } from './http';
import { cachedRequest } from './withCache';
import type { GeoLocation } from '../types';

const client = createClient(resolveBase('bigdatacloud', 'https://api.bigdatacloud.net'));

/** Localizacao padrao caso o usuario negue o GPS (Sao Paulo, BR). */
export const DEFAULT_LOCATION: GeoLocation = {
  lat: -23.5505,
  lon: -46.6333,
  label: 'São Paulo, BR',
  source: 'fallback',
};

interface ReverseGeocodeRaw {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const cacheKey = `geo-${lat.toFixed(2)}-${lon.toFixed(2)}`;
  try {
    const result = await cachedRequest<string>(cacheKey, ONE_DAY, async () => {
      const { data } = await client.get<ReverseGeocodeRaw>('/data/reverse-geocode-client', {
        params: { latitude: lat, longitude: lon, localityLanguage: 'pt' },
      });
      const place = data.locality || data.city || data.principalSubdivision || 'Local';
      const country = data.countryCode ?? '';
      return country ? `${place}, ${country}` : place;
    });
    return result.data;
  } catch {
    // Fallback discreto: coordenadas formatadas.
    return `${formatCoord(lat, 'lat')} ${formatCoord(lon, 'lon')}`;
  }
}
