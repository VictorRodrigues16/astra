/**
 * App — raiz da aplicacao Astra.
 *
 * Monta a arvore de providers (área segura, configuracoes, tema e favoritos)
 * e o container de navegacao. Enquanto as preferencias carregam do
 * armazenamento local, exibe uma tela de abertura para evitar "flashes" de
 * tema incorreto.
 */
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { RootNavigator, buildNavTheme } from './src/navigation';
import { AppText } from './src/components';

function BootScreen() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background, gap: 16 }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Ionicons name="planet" size={56} color={theme.accent.color} />
      <AppText variant="title">Astra</AppText>
      <ActivityIndicator color={theme.accent.color} />
    </View>
  );
}

function Root() {
  const { theme } = useTheme();
  const { ready } = useSettings();

  if (!ready) return <BootScreen />;

  return (
    <NavigationContainer theme={buildNavTheme(theme)}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <FavoritesProvider>
              <Root />
            </FavoritesProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
