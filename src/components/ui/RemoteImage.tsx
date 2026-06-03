/**
 * RemoteImage — imagem remota com skeleton durante o carregamento, fade-in
 * suave ao concluir e estado de erro com icone. Centraliza o tratamento de
 * loading/erro de imagens (ex.: foto astronomica do dia).
 */
import React, { useRef, useState } from 'react';
import { Animated, StyleProp, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import { Skeleton } from './Skeleton';

interface RemoteImageProps {
  uri: string;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function RemoteImage({ uri, height, radius = 0, style }: RemoteImageProps) {
  const { theme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const onLoad = () => {
    setLoaded(true);
    Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  };

  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt }, style]}>
      {!loaded && !failed ? <Skeleton width="100%" height={height} radius={radius} /> : null}

      {failed ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
        </View>
      ) : (
        <Animated.Image
          source={{ uri }}
          resizeMode="cover"
          onLoad={onLoad}
          onError={() => setFailed(true)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity }}
        />
      )}
    </View>
  );
}
