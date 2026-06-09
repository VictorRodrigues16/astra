/**
 * Rastreamento em tempo real da Estacao Espacial Internacional (ISS).
 * Fonte: API publica wheretheiss.at (sem chave). O TTL curto faz com que
 * cada atualizacao do polling busque dados frescos, mas guarda a ultima
 * posicao para fallback em caso de falha de rede.
 */
import { resolveBase } from '../config';
import { createClient } from './http';
import { ServiceResult, cachedRequest } from './withCache';
import type { IssPosition, IssRaw } from '../types';

const client = createClient(resolveBase('iss', 'https://api.wheretheiss.at'));

/** ID NORAD da ISS. */
const ISS_ID = 25544;

function normalize(raw: IssRaw): IssPosition {
  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    altitudeKm: raw.altitude,
    velocityKph: raw.velocity,
    visibility: raw.visibility,
    footprintKm: raw.footprint,
    timestamp: raw.timestamp * 1000,
  };
}

export async function fetchIssPosition(
  options: { force?: boolean } = {},
): Promise<ServiceResult<IssPosition>> {
  return cachedRequest<IssPosition>(
    'iss-position',
    1500,
    async () => {
      const { data } = await client.get<IssRaw>(`/v1/satellites/${ISS_ID}`, {
        params: { units: 'kilometers' },
      });
      return normalize(data);
    },
    options,
  );
}
