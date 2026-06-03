/**
 * IssCard — telemetria ao vivo da Estacao Espacial Internacional. Recebe a
 * posicao do hook useIss (mantido na Home para haver um unico poller).
 */
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { formatCoord, formatNumber } from '../../utils/format';
import { withAlpha } from '../../utils/color';
import type { IssPosition, RequestStatus } from '../../types';
import { AppText } from '../ui/Text';
import { Card } from '../ui/Card';
import { LiveDot } from '../ui/LiveDot';
import { Skeleton } from '../ui/Skeleton';

interface IssCardProps {
  position: IssPosition | null;
  status: RequestStatus;
}

function Telemetry({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ width: '48%', marginBottom: theme.spacing.md }}>
      <AppText variant="label">{label}</AppText>
      <AppText mono style={{ fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.text, marginTop: 3 }}>
        {value}
      </AppText>
    </View>
  );
}

export function IssCard({ position, status }: IssCardProps) {
  const { theme } = useTheme();
  const loading = status === 'loading' && !position;

  const visibility =
    position?.visibility === 'daylight'
      ? 'Iluminada pelo Sol'
      : position?.visibility === 'eclipsed'
        ? 'Na sombra da Terra'
        : '--';

  return (
    <Card shadow="sm">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: withAlpha(theme.accent.color, 0.16),
            }}
          >
            <Ionicons name="rocket" size={20} color={theme.accent.color} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="heading">Estação Espacial (ISS)</AppText>
            <AppText variant="caption">Posição orbital em tempo real</AppText>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.radius.full,
            backgroundColor: withAlpha(theme.colors.success, 0.16),
          }}
        >
          <LiveDot size={7} />
          <AppText style={{ fontSize: 10, fontWeight: '800', color: theme.colors.success, letterSpacing: 1 }}>
            AO VIVO
          </AppText>
        </View>
      </View>

      {loading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: '48%', marginBottom: theme.spacing.md }}>
              <Skeleton width={70} height={10} radius={4} />
              <Skeleton width={110} height={18} radius={5} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Telemetry label="Latitude" value={position ? formatCoord(position.latitude, 'lat') : '--'} />
          <Telemetry label="Longitude" value={position ? formatCoord(position.longitude, 'lon') : '--'} />
          <Telemetry label="Altitude" value={position ? `${formatNumber(position.altitudeKm)} km` : '--'} />
          <Telemetry label="Velocidade" value={position ? `${formatNumber(position.velocityKph)} km/h` : '--'} />
        </View>
      )}

      {!loading ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 2,
            paddingTop: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <Ionicons
            name={position?.visibility === 'daylight' ? 'sunny' : 'moon'}
            size={14}
            color={theme.colors.textSecondary}
          />
          <AppText variant="caption">{visibility}</AppText>
        </View>
      ) : null}
    </Card>
  );
}
