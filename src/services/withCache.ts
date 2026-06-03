/**
 * Envelopa uma chamada de API com a estrategia de cache TTL.
 *
 * Fluxo:
 *  1. Se ha cache fresco e nao foi pedido refresh forcado, devolve o cache
 *     (poupa o limite da API).
 *  2. Caso contrario, busca na rede e atualiza o cache.
 *  3. Se a rede falhar mas houver cache (mesmo vencido), devolve o cache —
 *     mantendo o app util offline ou sob rate limit.
 */
import { readCache, writeCache } from '../storage/cache';

export interface ServiceResult<T> {
  data: T;
  /** true quando os dados vieram do armazenamento local, nao da rede. */
  fromCache: boolean;
  updatedAt: number;
}

/**
 * Requisicoes de rede em andamento, por chave de cache. Permite que chamadas
 * concorrentes identicas (ex.: re-render do React, StrictMode) compartilhem a
 * mesma promessa, evitando disparar a mesma requisicao varias vezes e poupando
 * o limite da API.
 */
const inflight = new Map<string, Promise<ServiceResult<unknown>>>();

export async function cachedRequest<T>(
  cacheName: string,
  maxAgeMs: number,
  fetcher: () => Promise<T>,
  options: { force?: boolean } = {},
): Promise<ServiceResult<T>> {
  const now = Date.now();
  const cached = await readCache<T>(cacheName, maxAgeMs, now);

  if (!options.force && cached && !cached.stale) {
    return { data: cached.value, fromCache: true, updatedAt: cached.storedAt };
  }

  // Reaproveita uma requisicao identica que ja esteja em andamento.
  const pending = inflight.get(cacheName);
  if (pending) return pending as Promise<ServiceResult<T>>;

  const request = (async (): Promise<ServiceResult<T>> => {
    try {
      const data = await fetcher();
      await writeCache(cacheName, data, now);
      return { data, fromCache: false, updatedAt: now };
    } catch (error) {
      if (cached) {
        return { data: cached.value, fromCache: true, updatedAt: cached.storedAt };
      }
      throw error;
    } finally {
      inflight.delete(cacheName);
    }
  })();

  inflight.set(cacheName, request as Promise<ServiceResult<unknown>>);
  return request;
}
