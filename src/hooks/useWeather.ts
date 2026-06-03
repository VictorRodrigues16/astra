/** Hook do clima local — depende de uma localizacao ja resolvida. */
import { useCallback } from 'react';

import { fetchWeather } from '../services/weather.service';
import type { ServiceResult } from '../services/withCache';
import type { GeoLocation, WeatherData } from '../types';
import { useAsync } from './useAsync';

export function useWeather(location: GeoLocation | null) {
  const lat = location?.lat;
  const lon = location?.lon;

  const fetcher = useCallback(
    (opts: { force?: boolean }): Promise<ServiceResult<WeatherData>> =>
      fetchWeather(lat as number, lon as number, opts),
    [lat, lon],
  );

  return useAsync<WeatherData>(fetcher, { enabled: location != null });
}
