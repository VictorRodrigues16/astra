/**
 * Cache de respostas de API com TTL, persistido no AsyncStorage.
 *
 * Estrategia "stale-while-error": a camada de servico le o cache antes da
 * rede; se ainda estiver fresco, evita a requisicao (poupando o limite da
 * NASA). Se a rede falhar, devolvemos o cache mesmo vencido, garantindo que
 * o app funcione offline ou sob rate limit.
 */
import { StorageKeys } from './keys';
import { getItem, setItem } from './storage';

interface CacheEnvelope<T> {
  value: T;
  storedAt: number;
}

export interface CacheRead<T> {
  value: T;
  storedAt: number;
  /** true quando o conteudo ja passou do tempo de validade informado. */
  stale: boolean;
}

const keyFor = (name: string) => `${StorageKeys.cachePrefix}${name}`;

export async function readCache<T>(
  name: string,
  maxAgeMs: number,
  now: number = Date.now(),
): Promise<CacheRead<T> | null> {
  const env = await getItem<CacheEnvelope<T>>(keyFor(name));
  if (!env) return null;
  return {
    value: env.value,
    storedAt: env.storedAt,
    stale: now - env.storedAt > maxAgeMs,
  };
}

export async function writeCache<T>(
  name: string,
  value: T,
  now: number = Date.now(),
): Promise<void> {
  await setItem<CacheEnvelope<T>>(keyFor(name), { value, storedAt: now });
}
