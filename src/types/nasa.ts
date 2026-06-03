/**
 * Tipos das APIs da NASA (APOD e NeoWs) — separamos a forma "crua" devolvida
 * pela API dos modelos de dominio normalizados que a UI consome. A conversao
 * acontece na camada de servico.
 */

/* ------------------------------- APOD ----------------------------------- */
export interface ApodRaw {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  /** Presente para videos quando a requisicao usa thumbs=true. */
  thumbnail_url?: string;
  media_type: 'image' | 'video';
  copyright?: string;
  service_version?: string;
}

export interface Apod {
  date: string;
  title: string;
  explanation: string;
  imageUrl: string;
  hdImageUrl?: string;
  mediaType: 'image' | 'video';
  copyright?: string;
}

/* ------------------------------- NeoWs ---------------------------------- */
export interface NeoFeedRaw {
  element_count: number;
  near_earth_objects: Record<string, NeoRaw[]>;
}

export interface NeoRaw {
  id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object: boolean;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  close_approach_data: NeoApproachRaw[];
}

export interface NeoApproachRaw {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: { kilometers_per_second: string; kilometers_per_hour: string };
  miss_distance: { astronomical: string; lunar: string; kilometers: string };
  orbiting_body: string;
}

/** Modelo de dominio normalizado de um asteroide proximo a Terra. */
export interface Asteroid {
  id: string;
  name: string;
  rawName: string;
  hazardous: boolean;
  sentry: boolean;
  magnitude: number;
  diameterMinM: number;
  diameterMaxM: number;
  diameterAvgM: number;
  approachDate: string;
  approachEpoch: number;
  velocityKph: number;
  velocityKps: number;
  missDistanceKm: number;
  missDistanceLunar: number;
  orbitingBody: string;
  jplUrl: string;
}
