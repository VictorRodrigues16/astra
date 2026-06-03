/**
 * AsteroidDetailScreen — ficha completa de um asteroide. Mostra classificacao
 * de risco, dados orbitais e uma comparacao visual de tamanho com referencias
 * do dia a dia, alem de link para a pagina oficial no NASA JPL.
 */
import React from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  AppText,
  Badge,
  BarChart,
  Button,
  Card,
  IconButton,
  Screen,
} from '../components';
import type { BarDatum } from '../components/charts/BarChart';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { withAlpha } from '../utils/color';
import { formatDate, formatTime } from '../utils/date';
import {
  formatDiameter,
  formatDistanceKm,
  formatLunar,
  formatNumber,
} from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AsteroidDetail'>;

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.colors.border,
        gap: theme.spacing.md,
      }}
    >
      <AppText variant="bodySecondary" style={{ flexShrink: 1 }}>
        {label}
      </AppText>
      <AppText mono style={{ fontWeight: '700', color: theme.colors.text, textAlign: 'right', flexShrink: 1 }}>
        {value}
      </AppText>
    </View>
  );
}

export function AsteroidDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const { asteroid } = route.params;
  const { isFavorite, toggleAsteroid } = useFavorites();
  const favorite = isFavorite(asteroid.id);
  const accent = asteroid.hazardous ? theme.colors.danger : theme.accent.color;

  const sizeData: BarDatum[] = [
    { label: 'Ônibus', value: 12 },
    { label: 'Cristo', value: 38 },
    { label: 'B-747', value: 70 },
    { label: 'Estádio', value: 105 },
    { label: 'Eiffel', value: 330 },
    { label: 'Este', value: asteroid.diameterAvgM, highlight: true },
  ].sort((a, b) => a.value - b.value);

  return (
    <Screen padded>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.sm,
        }}
      >
        <IconButton icon="chevron-back" onPress={() => navigation.goBack()} accessibilityLabel="Voltar" />
        <AppText variant="heading">Detalhes</AppText>
        <IconButton
          icon={favorite ? 'heart' : 'heart-outline'}
          color={favorite ? theme.colors.danger : theme.colors.text}
          onPress={() => toggleAsteroid(asteroid)}
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing['5xl'], gap: theme.spacing.lg }}
      >
        <View style={{ alignItems: 'center', gap: theme.spacing.md }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(accent, 0.16),
            }}
          >
            <Ionicons name="planet" size={46} color={accent} />
          </View>
          <AppText variant="display" center style={{ fontSize: theme.fontSize['3xl'] }}>
            {asteroid.name}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' }}>
            <Badge
              label={asteroid.hazardous ? 'Risco potencial' : 'Sem risco'}
              tone={asteroid.hazardous ? 'danger' : 'success'}
              icon={asteroid.hazardous ? 'warning' : 'shield-checkmark'}
            />
            {asteroid.sentry ? <Badge label="Monitorado (Sentry)" tone="warning" icon="eye" /> : null}
            <Badge label={`Orbita: ${asteroid.orbitingBody}`} tone="neutral" icon="ellipse" />
          </View>
        </View>

        <Card>
          <AppText variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Distância na maior aproximação
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm }}>
            <AppText mono style={{ fontSize: theme.fontSize['3xl'], fontWeight: '800', color: accent }}>
              {formatLunar(asteroid.missDistanceLunar)}
            </AppText>
            <AppText variant="bodySecondary">({formatDistanceKm(asteroid.missDistanceKm)})</AppText>
          </View>
          <AppText variant="caption" style={{ marginTop: 4 }}>
            1 LD = distância média entre a Terra e a Lua (≈384.400 km)
          </AppText>
        </Card>

        <Card>
          <DetailRow label="Diâmetro estimado" value={`${formatDiameter(asteroid.diameterMinM)} – ${formatDiameter(asteroid.diameterMaxM)}`} />
          <DetailRow label="Velocidade relativa" value={`${formatNumber(asteroid.velocityKph)} km/h`} />
          <DetailRow label="Velocidade (km/s)" value={`${formatNumber(asteroid.velocityKps, 2)} km/s`} />
          <DetailRow label="Magnitude absoluta (H)" value={formatNumber(asteroid.magnitude, 1)} />
          <DetailRow label="Data de aproximação" value={formatDate(asteroid.approachDate)} />
          <DetailRow label="Horário (local)" value={formatTime(asteroid.approachEpoch)} last />
        </Card>

        <Card>
          <AppText variant="heading" style={{ marginBottom: theme.spacing.xs }}>
            Comparação de tamanho
          </AppText>
          <AppText variant="caption" style={{ marginBottom: theme.spacing.lg }}>
            Diâmetro médio do asteroide frente a referências conhecidas
          </AppText>
          <BarChart
            data={sizeData}
            height={150}
            formatValue={(v) => (v >= 1000 ? `${formatNumber(v / 1000, 1)}k` : `${formatNumber(v)}m`)}
          />
        </Card>

        <Button
          label="Abrir no NASA JPL"
          icon="open-outline"
          variant="secondary"
          fullWidth
          onPress={() => Linking.openURL(asteroid.jplUrl).catch(() => {})}
        />
      </ScrollView>
    </Screen>
  );
}
