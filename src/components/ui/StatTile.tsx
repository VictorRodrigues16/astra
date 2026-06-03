/**
 * StatTile — bloco de indicador para o dashboard. Mostra icone, valor de
 * destaque (em fonte de telemetria) e rotulo, com estado de carregamento.
 */
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { withAlpha } from '../../utils/color';
import { AppText } from './Text';
import { Card } from './Card';
import { LiveDot } from './LiveDot';
import { Skeleton } from './Skeleton';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  tint?: string;
  live?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

export function StatTile({ icon, label, value, unit, tint, live, loading, onPress }: StatTileProps) {
  const { theme } = useTheme();
  const color = tint ?? theme.accent.color;
  // Valores curtos ganham destaque; valores longos diminuem para nao quebrar.
  const valueSize =
    value.length <= 4 ? theme.fontSize['2xl'] : value.length <= 7 ? theme.fontSize.xl : theme.fontSize.lg;

  return (
    <Card variant="alt" padding="lg" shadow="none" onPress={onPress} style={{ flex: 1, minWidth: 150 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: withAlpha(color, 0.16),
          }}
        >
          <Ionicons name={icon} size={19} color={color} />
        </View>
        {live ? <LiveDot /> : null}
      </View>

      <View style={{ marginTop: theme.spacing.md }}>
        {loading ? (
          <Skeleton width={84} height={26} radius={6} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3 }}>
            <AppText
              mono
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{ fontSize: valueSize, fontWeight: '700', color: theme.colors.text, flexShrink: 1 }}
            >
              {value}
            </AppText>
            {unit ? (
              <AppText mono numberOfLines={1} variant="caption" style={{ color: theme.colors.textSecondary }}>
                {unit}
              </AppText>
            ) : null}
          </View>
        )}
        <AppText variant="label" style={{ marginTop: 6 }}>
          {label}
        </AppText>
      </View>
    </Card>
  );
}
