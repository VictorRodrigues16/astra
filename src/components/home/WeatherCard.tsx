/**
 * WeatherCard — clima atual na localizacao do usuario + grafico das maximas
 * dos proximos 7 dias. Une sensoriamento climatico (Open-Meteo) a estetica do
 * painel. Respeita a unidade de temperatura escolhida nas Configuracoes.
 */
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { parseISODate } from '../../utils/date';
import { formatNumber, formatTemp, toFahrenheit } from '../../utils/format';
import type { RequestStatus, WeatherData } from '../../types';
import { AppText } from '../ui/Text';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { BarChart, BarDatum } from '../charts/BarChart';

interface WeatherCardProps {
  weather: WeatherData | null;
  status: RequestStatus;
  locationLabel: string;
}

function MiniStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
      <AppText mono style={{ fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text }}>
        {value}
      </AppText>
      <AppText style={{ fontSize: 10, color: theme.colors.textMuted }}>{label}</AppText>
    </View>
  );
}

function weekdayLabel(date: string, index: number): string {
  if (index === 0) return 'Hoje';
  const wd = parseISODate(date).toLocaleDateString('pt-BR', { weekday: 'short' });
  return wd.replace('.', '').slice(0, 3);
}

export function WeatherCard({ weather, status, locationLabel }: WeatherCardProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const loading = status === 'loading' && !weather;

  const iconColor = (icon: string) =>
    icon === 'sunny' ? theme.colors.warning : icon === 'moon' ? theme.colors.info : theme.accent.color;

  const chartData: BarDatum[] = (weather?.daily ?? []).slice(0, 7).map((d, i) => ({
    label: weekdayLabel(d.date, i),
    value: d.max,
    highlight: i === 0,
  }));

  return (
    <Card shadow="sm">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: theme.spacing.lg }}>
        <Ionicons name="location" size={14} color={theme.accent.color} />
        <AppText variant="caption" style={{ flex: 1 }} numberOfLines={1}>
          {locationLabel}
        </AppText>
        <AppText variant="label">Clima local</AppText>
      </View>

      {loading ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <Skeleton width={64} height={64} radius={16} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width={120} height={34} radius={8} />
              <Skeleton width={160} height={14} radius={5} />
            </View>
          </View>
          <Skeleton width="100%" height={150} radius={12} style={{ marginTop: theme.spacing.xl }} />
        </View>
      ) : weather ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.surfaceAlt,
              }}
            >
              <Ionicons name={weather.now.icon as keyof typeof Ionicons.glyphMap} size={34} color={iconColor(weather.now.icon)} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText mono style={{ fontSize: theme.fontSize['4xl'], fontWeight: '800', color: theme.colors.text }}>
                {formatTemp(weather.now.tempC, settings.tempUnit)}
              </AppText>
              <AppText variant="bodySecondary">
                {weather.now.condition} · sensação {formatTemp(weather.now.feelsLikeC, settings.tempUnit)}
              </AppText>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surfaceAlt,
            }}
          >
            <MiniStat icon="water-outline" value={`${formatNumber(weather.now.humidity)}%`} label="Umidade" />
            <MiniStat icon="navigate-outline" value={`${formatNumber(weather.now.windKph)}`} label="km/h vento" />
            <MiniStat icon="speedometer-outline" value={`${formatNumber(weather.now.pressure)}`} label="hPa" />
          </View>

          {chartData.length > 0 ? (
            <View style={{ marginTop: theme.spacing.xl }}>
              <AppText variant="label" style={{ marginBottom: theme.spacing.md }}>
                Máximas dos próximos 7 dias
              </AppText>
              <BarChart
                data={chartData}
                height={130}
                formatValue={(v) =>
                  `${Math.round(settings.tempUnit === 'fahrenheit' ? toFahrenheit(v) : v)}°`
                }
              />
            </View>
          ) : null}
        </>
      ) : (
        <AppText variant="bodySecondary">Clima indisponível no momento.</AppText>
      )}
    </Card>
  );
}
