/** Chip — pilula selecionavel para filtros e ordenacao. */
import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { withAlpha } from '../../utils/color';
import { tapFeedback } from '../../utils/haptics';
import { AppText } from './Text';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Chip({ label, active = false, onPress, icon }: ChipProps) {
  const { theme } = useTheme();
  const color = active ? theme.accent.color : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: theme.spacing.md,
        height: 36,
        borderRadius: theme.radius.full,
        backgroundColor: active ? withAlpha(theme.accent.color, theme.mode === 'dark' ? 0.18 : 0.12) : theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: active ? withAlpha(theme.accent.color, 0.5) : theme.colors.border,
      }}
    >
      {icon ? <Ionicons name={icon} size={14} color={color} /> : null}
      <AppText style={{ fontSize: 13, fontWeight: '600', color }}>{label}</AppText>
    </Pressable>
  );
}
