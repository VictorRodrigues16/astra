/**
 * Escala de espacamento, raios de borda e duracoes de animacao.
 * Centralizar esses valores mantem o ritmo visual consistente no app inteiro.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 26,
  full: 999,
} as const;

export const duration = {
  fast: 160,
  base: 240,
  slow: 420,
  /** Intervalo de atualizacao do rastreamento da ISS (ms). */
  issPoll: 4000,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
