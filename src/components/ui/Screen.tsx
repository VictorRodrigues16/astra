/**
 * Screen — contêiner base de cada tela. Define o fundo do tema, a status bar
 * e um brilho decorativo no topo (no tema escuro) que reforca a estetica
 * espacial. As telas cuidam da propria rolagem (ScrollView/FlatList).
 */
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../contexts/ThemeContext';
import { withAlpha } from '../../utils/color';

interface ScreenProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, padded = false, style }: ScreenProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {isDark ? (
        <LinearGradient
          colors={[withAlpha(theme.accent.color, 0.12), 'transparent']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }}
          pointerEvents="none"
        />
      ) : null}

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[{ flex: 1, paddingHorizontal: padded ? theme.spacing.lg : 0 }, style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
