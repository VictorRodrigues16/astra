/**
 * Tipografia da Astra.
 *
 * Usamos as fontes do sistema (sem download, funcionam em iOS/Android/Web)
 * e reservamos uma familia monoespacada para "telemetria": numeros de
 * coordenadas, velocidade e distancias — reforcando a estetica de centro
 * de comando.
 */
import { Platform } from 'react-native';

export const fontFamily = {
  /** Texto comum. */
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) as string,
  /** Numeros e leituras de telemetria. */
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  }) as string,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
  '5xl': 48,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 1.2,
  /** Para rotulos em caixa alta. */
  caps: 1.6,
} as const;

export type FontWeight = (typeof fontWeight)[keyof typeof fontWeight];
