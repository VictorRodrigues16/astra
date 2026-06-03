/**
 * Traducao dos codigos WMO (padrao usado pela Open-Meteo) para uma descricao
 * em pt-BR e um icone Ionicons. Referencia:
 * https://open-meteo.com/en/docs (tabela "Weather variable documentation").
 */
import type { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface WeatherDescriptor {
  condition: string;
  /** Icone para o dia. */
  icon: IoniconName;
}

const TABLE: Record<number, WeatherDescriptor> = {
  0: { condition: 'Céu limpo', icon: 'sunny' },
  1: { condition: 'Predomínio de sol', icon: 'partly-sunny' },
  2: { condition: 'Parcialmente nublado', icon: 'partly-sunny' },
  3: { condition: 'Nublado', icon: 'cloudy' },
  45: { condition: 'Névoa', icon: 'cloudy' },
  48: { condition: 'Névoa com geada', icon: 'cloudy' },
  51: { condition: 'Garoa fraca', icon: 'rainy' },
  53: { condition: 'Garoa', icon: 'rainy' },
  55: { condition: 'Garoa intensa', icon: 'rainy' },
  56: { condition: 'Garoa congelante', icon: 'rainy' },
  57: { condition: 'Garoa congelante', icon: 'rainy' },
  61: { condition: 'Chuva fraca', icon: 'rainy' },
  63: { condition: 'Chuva', icon: 'rainy' },
  65: { condition: 'Chuva forte', icon: 'rainy' },
  66: { condition: 'Chuva congelante', icon: 'rainy' },
  67: { condition: 'Chuva congelante', icon: 'rainy' },
  71: { condition: 'Neve fraca', icon: 'snow' },
  73: { condition: 'Neve', icon: 'snow' },
  75: { condition: 'Neve intensa', icon: 'snow' },
  77: { condition: 'Grãos de neve', icon: 'snow' },
  80: { condition: 'Pancadas de chuva', icon: 'rainy' },
  81: { condition: 'Pancadas de chuva', icon: 'rainy' },
  82: { condition: 'Pancadas fortes', icon: 'rainy' },
  85: { condition: 'Pancadas de neve', icon: 'snow' },
  86: { condition: 'Pancadas de neve', icon: 'snow' },
  95: { condition: 'Tempestade', icon: 'thunderstorm' },
  96: { condition: 'Tempestade com granizo', icon: 'thunderstorm' },
  99: { condition: 'Tempestade com granizo', icon: 'thunderstorm' },
};

const FALLBACK: WeatherDescriptor = { condition: 'Indisponível', icon: 'cloudy' };

export function describeWeather(code: number, isDay = true): WeatherDescriptor {
  const base = TABLE[code] ?? FALLBACK;
  // A noite, ceu limpo vira lua.
  if (!isDay && code === 0) return { condition: 'Céu limpo', icon: 'moon' };
  return base;
}
