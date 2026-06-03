/** EmptyState — estado vazio amigavel com icone, texto e acao opcional. */
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { withAlpha } from '../../utils/color';
import { AppText } from './Text';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing['4xl'], paddingHorizontal: theme.spacing.xl }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: withAlpha(theme.accent.color, 0.14),
          marginBottom: theme.spacing.lg,
        }}
      >
        <Ionicons name={icon} size={32} color={theme.accent.color} />
      </View>
      <AppText variant="heading" center>
        {title}
      </AppText>
      {description ? (
        <AppText variant="bodySecondary" center style={{ marginTop: theme.spacing.xs, maxWidth: 280 }}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: theme.spacing.lg }} />
      ) : null}
    </View>
  );
}
