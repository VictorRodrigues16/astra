/** SectionHeader — titulo de secao com legenda e acao opcional ("ver tudo"). */
import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { tapFeedback } from '../../utils/haptics';
import { AppText } from './Text';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
      }}
    >
      <View style={{ flex: 1, paddingRight: theme.spacing.md }}>
        <AppText variant="subtitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {actionLabel && onAction ? (
        <Pressable
          onPress={() => {
            tapFeedback();
            onAction();
          }}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        >
          <AppText variant="caption" color="accent" style={{ fontWeight: '700' }}>
            {actionLabel}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={theme.accent.color} />
        </Pressable>
      ) : null}
    </View>
  );
}
