/**
 * Skeleton — placeholder de carregamento com pulsacao suave. Usado enquanto
 * os dados das APIs chegam, evitando saltos de layout (CLS).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (settings.reduceMotion) {
      pulse.setValue(0.8);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, settings.reduceMotion]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.skeleton,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
