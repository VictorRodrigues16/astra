/**
 * FadeInView — anima a entrada do conteudo (fade + leve subida). Usado para
 * dar ritmo as secoes da Home. Respeita a preferencia "reduzir animacoes".
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

import { useSettings } from '../../contexts/SettingsContext';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  offset?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeInView({ children, delay = 0, offset = 14, style }: FadeInViewProps) {
  const { settings } = useSettings();
  const progress = useRef(new Animated.Value(settings.reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (settings.reduceMotion) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, settings.reduceMotion]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
