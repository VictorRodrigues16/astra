/**
 * Tipos de clima — usamos a API Open-Meteo (gratuita e sem chave).
 * `WeatherData` e o modelo de dominio entregue a UI.
 */

export interface OpenMeteoRaw {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    surface_pressure: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export interface WeatherNow {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  pressure: number;
  isDay: boolean;
  code: number;
  condition: string;
  /** Nome do icone Ionicons correspondente. */
  icon: string;
}

export interface WeatherDay {
  date: string;
  min: number;
  max: number;
  code: number;
  precipProb: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  now: WeatherNow;
  daily: WeatherDay[];
  /** Temperaturas horarias das proximas 24h (para o grafico). */
  hourly: { time: string; temp: number }[];
}
