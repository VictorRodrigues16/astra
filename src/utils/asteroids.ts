/**
 * Logica de filtro, busca e ordenacao de asteroides — isolada da UI para ser
 * reutilizavel (Explorar e Home) e facil de testar.
 */
import type { Asteroid } from '../types';

export type AsteroidFilter = 'all' | 'hazardous' | 'safe';
export type AsteroidSort = 'date' | 'distance' | 'diameter' | 'velocity';

export const FILTER_OPTIONS: { key: AsteroidFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'hazardous', label: 'Risco potencial' },
  { key: 'safe', label: 'Seguros' },
];

export const SORT_OPTIONS: { key: AsteroidSort; label: string; icon: string }[] = [
  { key: 'date', label: 'Data', icon: 'calendar-outline' },
  { key: 'distance', label: 'Proximidade', icon: 'magnet-outline' },
  { key: 'diameter', label: 'Tamanho', icon: 'resize-outline' },
  { key: 'velocity', label: 'Velocidade', icon: 'speedometer-outline' },
];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export interface AsteroidQuery {
  search: string;
  filter: AsteroidFilter;
  sort: AsteroidSort;
}

export function applyAsteroidQuery(list: Asteroid[], query: AsteroidQuery): Asteroid[] {
  const term = normalize(query.search);

  const filtered = list.filter((a) => {
    if (query.filter === 'hazardous' && !a.hazardous) return false;
    if (query.filter === 'safe' && a.hazardous) return false;
    if (term && !normalize(a.name).includes(term)) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (query.sort) {
    case 'distance':
      sorted.sort((a, b) => a.missDistanceKm - b.missDistanceKm);
      break;
    case 'diameter':
      sorted.sort((a, b) => b.diameterAvgM - a.diameterAvgM);
      break;
    case 'velocity':
      sorted.sort((a, b) => b.velocityKph - a.velocityKph);
      break;
    case 'date':
    default:
      sorted.sort((a, b) => a.approachEpoch - b.approachEpoch);
      break;
  }
  return sorted;
}

export interface AsteroidSummary {
  total: number;
  hazardous: number;
  closestLunar: number | null;
  largestM: number | null;
}

export function summarizeAsteroids(list: Asteroid[]): AsteroidSummary {
  if (list.length === 0) {
    return { total: 0, hazardous: 0, closestLunar: null, largestM: null };
  }
  return {
    total: list.length,
    hazardous: list.filter((a) => a.hazardous).length,
    closestLunar: Math.min(...list.map((a) => a.missDistanceLunar)),
    largestM: Math.max(...list.map((a) => a.diameterAvgM)),
  };
}
