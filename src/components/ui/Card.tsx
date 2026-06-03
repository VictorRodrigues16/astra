/**
 * Card — superficie base do design system. Quando recebe `onPress`, vira um
 * botao com microanimacao de escala e feedback tatil.
 */
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import type { ShadowLevel } from '../../theme';
import { tapFeedback } from '../../utils/haptics';

type SpacingKey = keyof ReturnType<typeof useTheme>['theme']['spacing'];

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: SpacingKey | number;
  shadow?: ShadowLevel;
  variant?: 'surface' | 'alt' | 'outline';
  haptic?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  onPress,
  style,
  padding = 'lg',
  shadow = 'sm',
  variant = 'surface',
  haptic = true,
}: CardProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const scale = useRef(new Animated.Value(1)).current;

  const pad = typeof padding === 'number' ? padding : theme.spacing[padding];

  const base: ViewStyle = {
    backgroundColor:
      variant === 'outline'
        ? 'transparent'
        : variant === 'alt'
          ? theme.colors.surfaceAlt
          : theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: pad,
  };

  const animateTo = (to: number) => {
    if (settings.reduceMotion) return;
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  if (!onPress) {
    return <View style={[base, theme.shadow(shadow), style]}>{children}</View>;
  }

  return (
    <AnimatedPressable
      onPress={() => {
        if (haptic) tapFeedback();
        onPress();
      }}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      style={[base, theme.shadow(shadow), { transform: [{ scale }] }, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
