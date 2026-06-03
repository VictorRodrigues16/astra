/**
 * Button — botao do design system com variantes (primario em gradiente,
 * secundario, fantasma e perigo), estado de carregamento, icone opcional,
 * microanimacao de escala e feedback tatil.
 */
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { tapFeedback } from '../../utils/haptics';
import { AppText } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const scale = useRef(new Animated.Value(1)).current;

  const height = size === 'sm' ? 40 : 52;
  const fontSize = size === 'sm' ? theme.fontSize.sm : theme.fontSize.md;
  const isDisabled = disabled || loading;

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? theme.colors.text
        : theme.accent.color;

  const animateTo = (to: number) => {
    if (settings.reduceMotion) return;
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        height,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={textColor} /> : null}
          <AppText style={{ color: textColor, fontSize, fontWeight: '700' }}>{label}</AppText>
        </>
      )}
    </View>
  );

  const radius = theme.radius.lg;

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      onPressIn={() => animateTo(0.96)}
      onPressOut={() => animateTo(1)}
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          transform: [{ scale }],
        },
        variant === 'secondary' && {
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        variant === 'danger' && { backgroundColor: theme.colors.danger },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={theme.accent.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {inner}
        </LinearGradient>
      ) : (
        inner
      )}
    </AnimatedPressable>
  );
}
