/**
 * Text — componente tipografico do design system. Garante cor, tamanho e
 * peso coerentes com o tema atual e expoe uma variante monoespacada para a
 * "telemetria" (numeros de coordenadas, velocidade, etc.).
 */
import React from 'react';
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import type { SchemePalette } from '../../theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'heading'
  | 'body'
  | 'bodySecondary'
  | 'label'
  | 'caption';

interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  /** Chave da paleta ("text", "textSecondary"...), "accent" ou cor literal. */
  color?: keyof SchemePalette | 'accent' | (string & {});
  weight?: '400' | '500' | '600' | '700' | '800';
  uppercase?: boolean;
  mono?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
}

export function AppText({
  variant = 'body',
  color,
  weight,
  uppercase,
  mono,
  center,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { theme } = useTheme();

  const variantStyle = buildVariant(variant, theme);

  const resolvedColor =
    color === 'accent'
      ? theme.accent.color
      : color && color in theme.colors
        ? theme.colors[color as keyof SchemePalette]
        : (color as string | undefined) ?? variantStyle.color;

  const composed: TextStyle = {
    ...variantStyle,
    color: resolvedColor,
    fontFamily: mono ? theme.fontFamily.mono : theme.fontFamily.sans,
    ...(weight ? { fontWeight: weight } : null),
    ...(uppercase ? { textTransform: 'uppercase', letterSpacing: theme.letterSpacing.caps } : null),
    ...(center ? { textAlign: 'center' } : null),
  };

  return (
    <RNText style={[composed, style]} {...rest}>
      {children}
    </RNText>
  );
}

function buildVariant(variant: TextVariant, theme: ReturnType<typeof useTheme>['theme']): TextStyle {
  const { colors, fontSize, fontWeight, letterSpacing } = theme;
  switch (variant) {
    case 'display':
      return {
        fontSize: fontSize['4xl'],
        fontWeight: fontWeight.heavy,
        color: colors.text,
        letterSpacing: letterSpacing.tight,
      };
    case 'title':
      return { fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: colors.text, letterSpacing: letterSpacing.tight };
    case 'subtitle':
      return { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text };
    case 'heading':
      return { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text };
    case 'bodySecondary':
      return { fontSize: fontSize.md, fontWeight: fontWeight.regular, color: colors.textSecondary };
    case 'label':
      return {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.textMuted,
        letterSpacing: letterSpacing.caps,
        textTransform: 'uppercase',
      };
    case 'caption':
      return { fontSize: fontSize.sm, fontWeight: fontWeight.regular, color: colors.textMuted };
    case 'body':
    default:
      return { fontSize: fontSize.md, fontWeight: fontWeight.regular, color: colors.text };
  }
}
