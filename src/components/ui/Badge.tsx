/** Badge — pilula compacta para status (perigo, info, destaque, etc.). */
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { withAlpha } from '../../utils/color';
import { AppText } from './Text';

export type BadgeTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  solid?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', solid = false, icon, style }: BadgeProps) {
  const { theme } = useTheme();

  const toneColor = (() => {
    switch (tone) {
      case 'accent':
        return theme.accent.color;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'danger':
        return theme.colors.danger;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  })();

  const backgroundColor = solid ? toneColor : withAlpha(toneColor, theme.mode === 'dark' ? 0.16 : 0.13);
  const textColor = solid ? theme.colors.textInverse : toneColor;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 4,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 4,
          borderRadius: theme.radius.full,
          backgroundColor,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={12} color={textColor} /> : null}
      <AppText variant="caption" style={{ color: textColor, fontWeight: '700', fontSize: 11, letterSpacing: 0.3 }}>
        {label}
      </AppText>
    </View>
  );
}
