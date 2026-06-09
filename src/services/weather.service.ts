/**
 * Servico de clima via Open-Meteo (gratuito, sem chave de API e com CORS
 * liberado — funciona inclusive na versao Web).
 */
import { resolveBase } from '../config';
import { describeWeather } from '../utils/weather';
import { createClient } from './http';
import { ServiceResult, cachedRequest } from './withCache';
import type { OpenMeteoRaw, WeatherData } from '../types';

const client = createClient(resolveBase('openmeteo', 'https://api.open-meteo.com'));

const FIFTEEN_MIN = 15 * 60 * 1000;

function normalize(raw: OpenMeteoRaw): WeatherData {
  const isDay = raw.current.is_day === 1;
  const nowDesc = describeWeather(raw.current.weather_code, isDay);

  const daily = raw.daily.time.map((date, i) => {
    const code = raw.daily.weather_code[i] ?? 0;
    const desc = describeWeather(code, true);
    return {
      date,
      min: raw.daily.temperature_2m_min[i] ?? 0,
      max: raw.daily.temperature_2m_max[i] ?? 0,
      code,
      precipProb: raw.daily.precipitation_probability_max[i] ?? 0,
      condition: desc.condition,
      icon: desc.icon,
    };
  });

  // proximas 24 horas a partir do horario atual
  const nowTime = raw.current.time;
  const startIndex = Math.max(
    0,
    raw.hourly.time.findIndex((t) => t >= nowTime),
  );
  const hourly = raw.hourly.time
    .slice(startIndex, startIndex + 24)
    .map((time, i) => ({ time, temp: raw.hourly.temperature_2m[startIndex + i] ?? 0 }));

  return {
    now: {
      tempC: raw.current.temperature_2m,
      feelsLikeC: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      windKph: raw.current.wind_speed_10m,
      pressure: raw.current.surface_pressure,
      isDay,
      code: raw.current.weather_code,
      condition: nowDesc.condition,
      icon: nowDesc.icon,
    },
    daily,
    hourly,
  };
}

export async function fetchWeather(
  lat: number,
  lon: number,
  options: { force?: boolean } = {},
): Promise<ServiceResult<WeatherData>> {
  const cacheKey = `weather-${lat.toFixed(2)}-${lon.toFixed(2)}`;
  return cachedRequest<WeatherData>(
    cacheKey,
    FIFTEEN_MIN,
    async () => {
      const { data } = await client.get<OpenMeteoRaw>('/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current:
            'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,surface_pressure',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          hourly: 'temperature_2m',
          timezone: 'auto',
          forecast_days: 7,
        },
      });
      return normalize(data);
    },
    options,
  );
}
