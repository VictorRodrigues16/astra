/**
 * Tipos de navegacao — rotas tipadas garantem seguranca ao navegar e ao ler
 * parametros (ex.: o asteroide passado para a tela de detalhe).
 */
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Asteroid } from '../types';

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  AsteroidDetail: { asteroid: Asteroid };
};

/** Tipo do objeto de navegacao do stack raiz, usado com useNavigation. */
export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
