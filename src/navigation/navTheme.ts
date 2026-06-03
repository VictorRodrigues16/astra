/**
 * Adapta o tema da Astra para o formato de Theme do React Navigation,
 * evitando "flashes" brancos entre telas e mantendo as cores coerentes.
 */
import { DarkTheme, DefaultTheme, type Theme as NavTheme } from '@react-navigation/native';

import type { Theme } from '../theme';

export function buildNavTheme(theme: Theme): NavTheme {
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.accent.color,
      background: theme.colors.background,
      card: theme.colors.backgroundElevated,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.accent.color,
    },
  };
}
