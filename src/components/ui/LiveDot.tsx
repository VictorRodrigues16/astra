/** LiveDot — ponto pulsante que sinaliza dados em tempo real. */
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';

interface LiveDotProps {
  color?: string;
  size?: number;
}

export function LiveDot({ color, size = 8 }: LiveDotProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const dotColor = color ?? theme.colors.success;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (settings.reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 1600, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, settings.reduceMotion]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {!settings.reduceMotion ? (
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dotColor,
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
          }}
        />
      ) : null}
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: dotColor }} />
    </View>
  );
}
