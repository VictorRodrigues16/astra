/**
 * Ponto de entrada do design system.
 *
 * `buildTheme` combina o esquema de cor (claro/escuro) com a cor de destaque
 * escolhida pelo usuario e devolve um objeto `Theme` imutavel, consumido por
 * toda a UI atraves do ThemeContext.
 */
import { Platform } from 'react-native';

import {
  AccentPreset,
  SchemePalette,
  getAccent,
  getPalette,
} from './colors';
import { duration, radius, spacing } from './spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing } from './typography';

export type ColorMode = 'light' | 'dark';

export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';

export interface Theme {
  mode: ColorMode;
  colors: SchemePalette;
  accent: AccentPreset;
  spacing: typeof spacing;
  radius: typeof radius;
  duration: typeof duration;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  letterSpacing: typeof letterSpacing;
  /** Sombra coerente com o tema atual. No tema escuro a sombra e mais densa. */
  shadow: (level: ShadowLevel) => object;
  /** Fundo translucido do accent adequado ao tema atual. */
  accentSoft: string;
}

function makeShadow(mode: ColorMode) {
  const color = mode === 'dark' ? '#000000' : '#1E293B';
  const map: Record<ShadowLevel, object> = {
    none: {},
    sm: Platform.select({
      web: { boxShadow: `0 2px 8px ${mode === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(30,41,59,0.08)'}` },
      default: {
        shadowColor: color,
        shadowOpacity: mode === 'dark' ? 0.4 : 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      },
    }) as object,
    md: Platform.select({
      web: { boxShadow: `0 8px 24px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(30,41,59,0.12)'}` },
      default: {
        shadowColor: color,
        shadowOpacity: mode === 'dark' ? 0.5 : 0.12,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
    }) as object,
    lg: Platform.select({
      web: { boxShadow: `0 18px 48px ${mode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(30,41,59,0.18)'}` },
      default: {
        shadowColor: color,
        shadowOpacity: mode === 'dark' ? 0.55 : 0.18,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 16 },
        elevation: 12,
      },
    }) as object,
  };
  return (level: ShadowLevel) => map[level];
}

export function buildTheme(mode: ColorMode, accentKey: string): Theme {
  const colors = getPalette(mode);
  const accent = getAccent(accentKey);
  return {
    mode,
    colors,
    accent,
    spacing,
    radius,
    duration,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    shadow: makeShadow(mode),
    accentSoft: mode === 'dark' ? accent.soft : accent.softLight,
  };
}

export { accentPresets, defaultAccentKey } from './colors';
export type { AccentPreset, SchemePalette } from './colors';
