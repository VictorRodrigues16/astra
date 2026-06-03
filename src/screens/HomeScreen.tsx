/**
 * HomeScreen — o "Centro de Comando". Dashboard que reune, em tempo real:
 * indicadores (clima, asteroides, ISS), a imagem astronomica do dia, a
 * telemetria da ISS, o clima local e as proximas aproximacoes de asteroides.
 */
import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  AppHeader,
  ApodHeroSkeleton,
  Card,
  EmptyState,
  FadeInView,
  IconButton,
  Screen,
  SectionHeader,
  Skeleton,
  StatTile,
} from '../components';
import { ApodHero } from '../components/home/ApodHero';
import { IssCard } from '../components/home/IssCard';
import { WeatherCard } from '../components/home/WeatherCard';
import { AsteroidCard } from '../components/asteroids/AsteroidCard';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useApod, useAsteroids, useIss, useLocation, useWeather } from '../hooks';
import { summarizeAsteroids } from '../utils/asteroids';
import { formatCompact, formatTemp } from '../utils/format';
import type { Asteroid } from '../types';
import type { RootStackNavigation } from '../navigation/types';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<RootStackNavigation>();
  const { addHistory } = useFavorites();

  const apod = useApod();
  const asteroids = useAsteroids();
  const { location } = useLocation();
  const weather = useWeather(location);
  const iss = useIss();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([apod.refresh(true), asteroids.refresh(true), weather.refresh(true)]);
    setRefreshing(false);
  };

  const summary = useMemo(() => summarizeAsteroids(asteroids.data ?? []), [asteroids.data]);
  const upcoming = useMemo(() => (asteroids.data ?? []).slice(0, 3), [asteroids.data]);

  const openAsteroid = (asteroid: Asteroid) => {
    addHistory(asteroid);
    navigation.navigate('AsteroidDetail', { asteroid });
  };

  const weatherStatus = location ? weather.status : 'loading';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing['5xl'],
          gap: theme.spacing.xl,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.color} />
        }
      >
        <AppHeader
          overline={`${greeting()} 👋`}
          title="Astra"
          subtitle="Monitoramento da Terra e do espaço próximo"
          right={
            <IconButton
              icon={isDark ? 'sunny' : 'moon'}
              onPress={toggleTheme}
              accessibilityLabel="Alternar tema"
            />
          }
        />

        <FadeInView delay={40}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <StatTile
              icon="thermometer"
              label="Temperatura local"
              value={weather.data ? formatTemp(weather.data.now.tempC) : '--'}
              tint={theme.colors.warning}
              loading={weatherStatus === 'loading' && !weather.data}
            />
            <StatTile
              icon="rocket"
              label="Velocidade da ISS"
              value={iss.position ? formatCompact(iss.position.velocityKph) : '--'}
              unit="km/h"
              live
              loading={!iss.position}
            />
            <StatTile
              icon="planet"
              label="Asteroides (7 dias)"
              value={asteroids.data ? String(summary.total) : '--'}
              loading={asteroids.status === 'loading' && !asteroids.data}
              onPress={() => navigation.navigate('Tabs', { screen: 'Explore' })}
            />
            <StatTile
              icon="warning"
              label="Em risco potencial"
              value={asteroids.data ? String(summary.hazardous) : '--'}
              tint={theme.colors.danger}
              loading={asteroids.status === 'loading' && !asteroids.data}
              onPress={() => navigation.navigate('Tabs', { screen: 'Explore' })}
            />
          </View>
        </FadeInView>

        <FadeInView delay={90}>
          {apod.status === 'loading' && !apod.data ? (
            <ApodHeroSkeleton />
          ) : apod.data ? (
            <ApodHero apod={apod.data} />
          ) : (
            <Card>
              <EmptyState
                icon="cloud-offline-outline"
                title="Imagem indisponível"
                description={apod.error ?? 'Não foi possível carregar a foto do dia.'}
                actionLabel="Tentar novamente"
                onAction={() => apod.refresh(true)}
              />
            </Card>
          )}
        </FadeInView>

        <FadeInView delay={140}>
          <IssCard position={iss.position} status={iss.status} />
        </FadeInView>

        <FadeInView delay={190}>
          <WeatherCard weather={weather.data} status={weatherStatus} locationLabel={location?.label ?? 'Localizando...'} />
        </FadeInView>

        <FadeInView delay={240}>
          <View>
            <SectionHeader
              title="Próximas aproximações"
              subtitle="Asteroides que passam perto nos próximos dias"
              actionLabel="Ver todos"
              onAction={() => navigation.navigate('Tabs', { screen: 'Explore' })}
            />
            {asteroids.status === 'loading' && !asteroids.data ? (
              <View style={{ gap: theme.spacing.md }}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} width="100%" height={92} radius={theme.radius.xl} />
                ))}
              </View>
            ) : upcoming.length > 0 ? (
              <View style={{ gap: theme.spacing.md }}>
                {upcoming.map((a) => (
                  <AsteroidCard key={a.id} asteroid={a} onPress={() => openAsteroid(a)} />
                ))}
              </View>
            ) : (
              <Card>
                <EmptyState
                  icon="planet-outline"
                  title="Sem dados de asteroides"
                  description={asteroids.error ?? 'Nenhuma aproximação encontrada para o período.'}
                  actionLabel="Recarregar"
                  onAction={() => asteroids.refresh(true)}
                />
              </Card>
            )}
          </View>
        </FadeInView>
      </ScrollView>
    </Screen>
  );
}
