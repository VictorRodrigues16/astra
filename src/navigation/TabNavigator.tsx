/**
 * TabNavigator — navegacao principal por abas (Bottom Tabs): Inicio, Explorar,
 * Favoritos e Ajustes. Os icones e cores seguem o tema ativo.
 */
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<keyof TabParamList, [IconName, IconName]> = {
  Home: ['home', 'home-outline'],
  Explore: ['search', 'search-outline'],
  Favorites: ['heart', 'heart-outline'],
  Settings: ['settings', 'settings-outline'],
};

export function TabNavigator() {
  const { theme } = useTheme();
  const { favoriteCount } = useFavorites();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent.color,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundElevated,
          borderTopColor: theme.colors.border,
          paddingTop: 6,
          ...Platform.select({ web: { height: 64 }, default: {} }),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const [active, inactive] = ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size ?? 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explorar' }} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favoritos', tabBarBadge: favoriteCount > 0 ? favoriteCount : undefined }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}
