/** Hook do feed de asteroides proximos a Terra (NeoWs). */
import { useCallback } from 'react';

import { fetchAsteroids } from '../services/nasa.service';
import type { ServiceResult } from '../services/withCache';
import type { Asteroid } from '../types';
import { useAsync } from './useAsync';

export function useAsteroids() {
  const fetcher = useCallback(
    (opts: { force?: boolean }): Promise<ServiceResult<Asteroid[]>> => fetchAsteroids(opts),
    [],
  );
  return useAsync<Asteroid[]>(fetcher);
}
