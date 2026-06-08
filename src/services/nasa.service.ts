/**
 * Servico das APIs da NASA: APOD (imagem astronomica do dia) e NeoWs
 * (asteroides proximos a Terra).
 *
 * A chave da API e definida em src/constants.ts (NASA_API_KEY).
 */
import { NASA_API_KEY } from '../constants';
import { addDays, toISODate } from '../utils/date';
import { createClient } from './http';
import { ServiceResult, cachedRequest } from './withCache';
import type {
  Apod,
  ApodRaw,
  Asteroid,
  NeoFeedRaw,
  NeoRaw,
} from '../types';

const client = createClient('https://api.nasa.gov');

/* --------------------------------- APOD --------------------------------- */
function normalizeApod(raw: ApodRaw): Apod {
  return {
    date: raw.date,
    title: raw.title,
    explanation: raw.explanation,
    imageUrl: raw.media_type === 'image' ? raw.url : (raw.thumbnail_url ?? raw.hdurl ?? raw.url),
    hdImageUrl: raw.hdurl,
    mediaType: raw.media_type,
    // O campo copyright costuma vir com quebras de linha e creditos extensos;
    // colapsamos os espacos para uma linha so.
    copyright: raw.copyright?.replace(/\s+/g, ' ').trim() || undefined,
  };
}

const SIX_HOURS = 6 * 60 * 60 * 1000;

export async function fetchApod(options: { force?: boolean } = {}): Promise<ServiceResult<Apod>> {
  return cachedRequest<Apod>(
    'apod',
    SIX_HOURS,
    async () => {
      const { data } = await client.get<ApodRaw>('/planetary/apod', {
        params: { api_key: NASA_API_KEY, thumbs: true },
      });
      return normalizeApod(data);
    },
    options,
  );
}

/* --------------------------------- NeoWs -------------------------------- */
function cleanName(name: string): string {
  // Remove os parenteses apenas quando envolvem o nome inteiro
  // ("(2020 AB1)" -> "2020 AB1"), preservando casos como
  // "437844 (1999 MN)" que ficariam desbalanceados.
  const trimmed = name.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function normalizeNeo(raw: NeoRaw, dateKey: string): Asteroid {
  const approach =
    raw.close_approach_data.find((a) => a.close_approach_date === dateKey) ??
    raw.close_approach_data[0];

  const min = raw.estimated_diameter.meters.estimated_diameter_min;
  const max = raw.estimated_diameter.meters.estimated_diameter_max;

  return {
    id: raw.id,
    name: cleanName(raw.name),
    rawName: raw.name,
    hazardous: raw.is_potentially_hazardous_asteroid,
    sentry: raw.is_sentry_object,
    magnitude: raw.absolute_magnitude_h,
    diameterMinM: min,
    diameterMaxM: max,
    diameterAvgM: (min + max) / 2,
    approachDate: approach?.close_approach_date ?? dateKey,
    approachEpoch: approach?.epoch_date_close_approach ?? 0,
    velocityKph: approach ? Number(approach.relative_velocity.kilometers_per_hour) : 0,
    velocityKps: approach ? Number(approach.relative_velocity.kilometers_per_second) : 0,
    missDistanceKm: approach ? Number(approach.miss_distance.kilometers) : 0,
    missDistanceLunar: approach ? Number(approach.miss_distance.lunar) : 0,
    orbitingBody: approach?.orbiting_body ?? 'Earth',
    jplUrl: raw.nasa_jpl_url,
  };
}

function flattenFeed(feed: NeoFeedRaw): Asteroid[] {
  const out: Asteroid[] = [];
  for (const [dateKey, list] of Object.entries(feed.near_earth_objects)) {
    for (const neo of list) out.push(normalizeNeo(neo, dateKey));
  }
  // ordena por data/horario de aproximacao por padrao
  return out.sort((a, b) => a.approachEpoch - b.approachEpoch);
}

const THIRTY_MIN = 30 * 60 * 1000;

/**
 * Busca o feed de aproximacoes dos proximos 7 dias (limite da NeoWs por
 * requisicao) e devolve a lista normalizada de asteroides.
 */
export async function fetchAsteroids(
  options: { force?: boolean } = {},
): Promise<ServiceResult<Asteroid[]>> {
  const today = new Date();
  const start = toISODate(today);
  const end = toISODate(addDays(today, 6));

  return cachedRequest<Asteroid[]>(
    `neo-feed-${start}`,
    THIRTY_MIN,
    async () => {
      const { data } = await client.get<NeoFeedRaw>('/neo/rest/v1/feed', {
        params: { start_date: start, end_date: end, api_key: NASA_API_KEY },
      });
      return flattenFeed(data);
    },
    options,
  );
}
