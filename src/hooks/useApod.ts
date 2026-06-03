/** Hook da imagem astronomica do dia (APOD). */
import { useCallback } from 'react';

import { fetchApod } from '../services/nasa.service';
import type { ServiceResult } from '../services/withCache';
import type { Apod } from '../types';
import { useAsync } from './useAsync';

export function useApod() {
  const fetcher = useCallback(
    (opts: { force?: boolean }): Promise<ServiceResult<Apod>> => fetchApod(opts),
    [],
  );
  return useAsync<Apod>(fetcher);
}
