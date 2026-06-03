/**
 * Funcoes puras de formatacao de numeros, distancias, velocidades e
 * temperatura. Manter como funcoes puras facilita testar e reutilizar.
 */
export type TempUnit = 'celsius' | 'fahrenheit';

/** Formata numero com separador de milhar pt-BR e casas decimais opcionais. */
export function formatNumber(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '--';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Versao compacta para numeros grandes: 12.500 vira "12,5 mil". */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '--';
  if (Math.abs(value) >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)} mi`;
  if (Math.abs(value) >= 1_000) return `${formatNumber(value / 1_000, 1)} mil`;
  return formatNumber(value);
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km)) return '--';
  if (km >= 1_000_000) return `${formatNumber(km / 1_000_000, 2)} mi km`;
  return `${formatNumber(km)} km`;
}

export function formatSpeedKph(kph: number): string {
  return `${formatNumber(kph)} km/h`;
}

/** Diametro em metros, com salto para km quando grande. */
export function formatDiameter(meters: number): string {
  if (!Number.isFinite(meters)) return '--';
  if (meters >= 1000) return `${formatNumber(meters / 1000, 2)} km`;
  return `${formatNumber(meters)} m`;
}

export function toFahrenheit(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

export function formatTemp(celsius: number, unit: TempUnit = 'celsius'): string {
  if (!Number.isFinite(celsius)) return '--';
  const value = unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${Math.round(value)}${symbol}`;
}

/** Distancia em multiplos da distancia Terra-Lua (LD). */
export function formatLunar(ld: number): string {
  if (!Number.isFinite(ld)) return '--';
  return `${formatNumber(ld, 1)} LD`;
}

/** Coordenada geografica com hemisferio. */
export function formatCoord(value: number, axis: 'lat' | 'lon'): string {
  const hemi =
    axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'L' : 'O';
  return `${Math.abs(value).toFixed(2)}° ${hemi}`;
}
