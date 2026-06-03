/**
 * useAsync — hook generico que orquestra qualquer chamada da camada de
 * servico (que devolve `ServiceResult<T>`), expondo um `AsyncState<T>`
 * completo: status, erro, indicador de cache, timestamp e funcao de refresh.
 *
 * Mantem os dados visiveis durante o refresh (status permanece "success"
 * enquanto `refreshing` fica true) — ideal para pull-to-refresh.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/http';
import type { ServiceResult } from '../services/withCache';
import type { AsyncState } from '../types';

type ServiceFetcher<T> = (opts: { force?: boolean }) => Promise<ServiceResult<T>>;

export interface UseAsyncResult<T> extends AsyncState<T> {
  refreshing: boolean;
  refresh: (force?: boolean) => Promise<void>;
}

const INITIAL: AsyncState<unknown> = {
  data: null,
  status: 'idle',
  error: null,
  fromCache: false,
  updatedAt: null,
};

export function useAsync<T>(
  fetcher: ServiceFetcher<T>,
  options: { enabled?: boolean } = {},
): UseAsyncResult<T> {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<AsyncState<T>>(INITIAL as AsyncState<T>);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (force = false) => {
      if (force) setRefreshing(true);
      setState((prev) => ({
        ...prev,
        status: prev.data ? prev.status : 'loading',
      }));
      try {
        const result = await fetcher({ force });
        if (!mounted.current) return;
        setState({
          data: result.data,
          status: 'success',
          error: null,
          fromCache: result.fromCache,
          updatedAt: result.updatedAt,
        });
      } catch (error) {
        if (!mounted.current) return;
        const message =
          error instanceof ApiError ? error.message : 'Não foi possível carregar os dados.';
        setState((prev) => ({ ...prev, status: 'error', error: message }));
      } finally {
        if (mounted.current) setRefreshing(false);
      }
    },
    [fetcher],
  );

  useEffect(() => {
    if (enabled) void run(false);
  }, [enabled, run]);

  return { ...state, refreshing, refresh: run };
}
