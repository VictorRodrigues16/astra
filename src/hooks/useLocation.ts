/**
 * useLocation — resolve a localizacao do usuario com expo-location.
 *
 * Pede permissao, obtem as coordenadas e faz geocodificacao reversa para um
 * nome amigavel. Em qualquer falha (permissao negada, sem GPS, erro de rede)
 * cai para uma localizacao padrao, garantindo que o app sempre funcione.
 */
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { DEFAULT_LOCATION, reverseGeocode } from '../services/geo.service';
import type { GeoLocation } from '../types';

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'fallback';

export interface UseLocationResult {
  location: GeoLocation | null;
  status: LocationStatus;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [status, setStatus] = useState<LocationStatus>('loading');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission !== 'granted') {
          if (mounted) {
            setLocation(DEFAULT_LOCATION);
            setStatus('denied');
          }
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        const { latitude, longitude } = position.coords;
        const label = await reverseGeocode(latitude, longitude);

        if (mounted) {
          setLocation({ lat: latitude, lon: longitude, label, source: 'device' });
          setStatus('granted');
        }
      } catch {
        if (mounted) {
          setLocation(DEFAULT_LOCATION);
          setStatus('fallback');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { location, status };
}
