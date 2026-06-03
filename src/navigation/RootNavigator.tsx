/**
 * RootNavigator — stack raiz (Native Stack). Contem as abas e a tela de
 * detalhe do asteroide, aberta por cima das abas.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AsteroidDetailScreen } from '../screens/AsteroidDetailScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="AsteroidDetail"
        component={AsteroidDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
