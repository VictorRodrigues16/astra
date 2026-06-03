/**
 * useIss — rastreamento em tempo real da ISS por polling.
 *
 * Usa setTimeout recursivo (em vez de setInterval) para nao empilhar
 * requisicoes caso a rede esteja lenta, e pausa enquanto o app esta em
 * segundo plano para economizar bateria e dados.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { fetchIssPosition } from '../services/iss.service';
import { ApiError } from '../services/http';
import { duration } from '../theme/spacing';
import type { IssPosition, RequestStatus } from '../types';

export interface UseIssResult {
  position: IssPosition | null;
  status: RequestStatus;
  error: string | null;
}

export function useIss(intervalMs: number = duration.issPoll): UseIssResult {
  const [position, setPosition] = useState<IssPosition | null>(null);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      // Pausa o polling em segundo plano para poupar bateria/dados, mas sempre
      // garante a primeira busca (mesmo que o app inicie sem estar em foco).
      if (AppState.currentState !== 'active' && hasData.current) {
        if (active) timer = setTimeout(tick, intervalMs);
        return;
      }
      try {
        const result = await fetchIssPosition({ force: true });
        if (!active) return;
        setPosition(result.data);
        hasData.current = true;
        setStatus('success');
        setError(null);
      } catch (err) {
        if (!active) return;
        const message = err instanceof ApiError ? err.message : 'Sinal da ISS indisponível.';
        setError(message);
        // So marca erro se nunca recebemos nada; senao mantem a ultima posicao.
        setStatus(hasData.current ? 'success' : 'error');
      } finally {
        if (active) timer = setTimeout(tick, intervalMs);
      }
    };

    void tick();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [intervalMs]);

  return { position, status, error };
}
