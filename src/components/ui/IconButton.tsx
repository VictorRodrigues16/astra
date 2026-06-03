/** IconButton — botao circular de icone para acoes de cabecalho. */
import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { tapFeedback } from '../../utils/haptics';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  variant?: 'surface' | 'ghost';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  onPress,
  size = 42,
  color,
  variant = 'surface',
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (to: number) => {
    if (settings.reduceMotion) return;
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 6 }).start();
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      onPressIn={() => animateTo(0.9)}
      onPressOut={() => animateTo(1)}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: variant === 'surface' ? theme.colors.surfaceAlt : 'transparent',
          borderWidth: variant === 'surface' ? 1 : 0,
          borderColor: theme.colors.border,
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color={color ?? theme.colors.text} />
    </AnimatedPressable>
  );
}
