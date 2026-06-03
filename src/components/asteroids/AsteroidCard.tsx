/**
 * AsteroidCard — item de lista de um asteroide proximo a Terra. Usado na tela
 * Explorar, nos Favoritos e no historico. Inclui atalho para favoritar.
 */
import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { formatDate } from '../../utils/date';
import { formatDiameter, formatLunar, formatNumber } from '../../utils/format';
import { withAlpha } from '../../utils/color';
import { tapFeedback } from '../../utils/haptics';
import type { Asteroid } from '../../types';
import { AppText } from '../ui/Text';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

function Fact({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={13} color={theme.colors.textMuted} />
      <AppText mono style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' }}>
        {value}
      </AppText>
    </View>
  );
}

export function AsteroidCard({ asteroid, onPress }: { asteroid: Asteroid; onPress: () => void }) {
  const { theme } = useTheme();
  const { isFavorite, toggleAsteroid } = useFavorites();
  const favorite = isFavorite(asteroid.id);
  const accent = asteroid.hazardous ? theme.colors.danger : theme.accent.color;

  return (
    <Card onPress={onPress} padding="md" shadow="sm">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: withAlpha(accent, 0.16),
          }}
        >
          <Ionicons name="planet-outline" size={22} color={accent} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <AppText variant="heading" style={{ flexShrink: 1 }} numberOfLines={1}>
              {asteroid.name}
            </AppText>
            {asteroid.hazardous ? <Badge label="Risco" tone="danger" icon="warning" /> : null}
          </View>
          <AppText variant="caption" style={{ marginTop: 1 }}>
            Aproximação em {formatDate(asteroid.approachDate)}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
            <Fact icon="resize-outline" value={formatDiameter(asteroid.diameterAvgM)} />
            <Fact icon="moon-outline" value={formatLunar(asteroid.missDistanceLunar)} />
            <Fact icon="speedometer-outline" value={`${formatNumber(asteroid.velocityKps, 1)} km/s`} />
          </View>
        </View>

        <Pressable
          onPress={() => {
            tapFeedback();
            toggleAsteroid(asteroid);
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={22}
            color={favorite ? theme.colors.danger : theme.colors.textMuted}
          />
        </Pressable>
      </View>
    </Card>
  );
}
