/**
 * BarChart — grafico de barras animado construido apenas com Views + a API
 * Animated nativa do React Native (sem dependencias de grafico, o que mantem
 * o app leve e 100% compativel com Web/iOS/Android).
 *
 * As barras "crescem" em cascata na montagem. Valores subsequentes (ex.: troca
 * de unidade C/F) atualizam a altura instantaneamente, sem re-animar.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { withAlpha } from '../../utils/color';
import { AppText } from '../ui/Text';

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  formatValue?: (value: number) => string;
  showValues?: boolean;
}

export function BarChart({
  data,
  height = 140,
  formatValue = (v) => String(Math.round(v)),
  showValues = true,
}: BarChartProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  // base abaixo do menor valor para que a menor barra ainda tenha altura.
  const base = min - range * 0.25;
  const fraction = (v: number) => Math.max(0.08, Math.min(1, (v - base) / (max - base || 1)));

  const grows = useRef<Animated.Value[]>([]);
  if (grows.current.length !== data.length) {
    grows.current = data.map((_, i) => grows.current[i] ?? new Animated.Value(0));
  }

  useEffect(() => {
    if (settings.reduceMotion) {
      grows.current.forEach((v) => v.setValue(1));
      return;
    }
    const anims = grows.current.map((v) =>
      Animated.timing(v, { toValue: 1, duration: 520, useNativeDriver: false }),
    );
    Animated.stagger(55, anims).start();
    // anima apenas na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: 6 }}>
        {data.map((bar, i) => {
          const target = height * fraction(bar.value);
          const animatedHeight = grows.current[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0, target],
          });
          const colors: [string, string] = bar.highlight
            ? theme.accent.gradient
            : [withAlpha(theme.accent.color, 0.5), withAlpha(theme.accent.color, 0.18)];

          return (
            <View key={`${bar.label}-${i}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              {showValues ? (
                <AppText
                  mono
                  style={{
                    fontSize: 10,
                    marginBottom: 4,
                    color: bar.highlight ? theme.accent.color : theme.colors.textSecondary,
                    fontWeight: '700',
                  }}
                >
                  {formatValue(bar.value)}
                </AppText>
              ) : null}
              <Animated.View
                style={{
                  width: '74%',
                  height: animatedHeight,
                  borderRadius: theme.radius.sm,
                  overflow: 'hidden',
                  minHeight: 4,
                }}
              >
                <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }} />
              </Animated.View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', marginTop: 8, gap: 6 }}>
        {data.map((bar, i) => (
          <View key={`label-${bar.label}-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <AppText
              style={{
                fontSize: 10,
                color: bar.highlight ? theme.colors.text : theme.colors.textMuted,
                fontWeight: bar.highlight ? '700' : '500',
              }}
              numberOfLines={1}
            >
              {bar.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}
