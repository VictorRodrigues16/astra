/**
 * ExploreScreen — listagem de asteroides proximos a Terra (NeoWs) com busca,
 * filtros (todos / risco / seguros) e ordenacao (data, proximidade, tamanho,
 * velocidade). Usa FlatList para performance.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  AppHeader,
  AppText,
  AsteroidCard,
  Card,
  EmptyState,
  Screen,
  SearchSortBar,
  Skeleton,
} from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAsteroids, useDebounce } from '../hooks';
import {
  AsteroidFilter,
  AsteroidSort,
  applyAsteroidQuery,
} from '../utils/asteroids';
import type { Asteroid } from '../types';
import type { RootStackNavigation } from '../navigation/types';

export function ExploreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<RootStackNavigation>();
  const { addHistory } = useFavorites();
  const asteroids = useAsteroids();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AsteroidFilter>('all');
  const [sort, setSort] = useState<AsteroidSort>('date');
  const debouncedSearch = useDebounce(search, 250);

  const results = useMemo(
    () => applyAsteroidQuery(asteroids.data ?? [], { search: debouncedSearch, filter, sort }),
    [asteroids.data, debouncedSearch, filter, sort],
  );

  const openAsteroid = (asteroid: Asteroid) => {
    addHistory(asteroid);
    navigation.navigate('AsteroidDetail', { asteroid });
  };

  const initialLoading = asteroids.status === 'loading' && !asteroids.data;

  return (
    <Screen padded>
      <View style={{ paddingTop: theme.spacing.lg }}>
        <AppHeader overline="Sensoriamento" title="Explorar" subtitle="Asteroides próximos à Terra (NASA NeoWs)" />
        <SearchSortBar
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          sort={sort}
          onSort={setSort}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.lg }}>
          <AppText variant="caption">
            {initialLoading ? 'Carregando catálogo...' : `${results.length} asteroide(s) encontrados`}
          </AppText>
          {asteroids.fromCache ? <AppText variant="caption" color="warning">dados salvos</AppText> : null}
        </View>
      </View>

      {initialLoading ? (
        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height={92} radius={theme.radius.xl} />
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AsteroidCard asteroid={item} onPress={() => openAsteroid(item)} />}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          contentContainerStyle={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing['5xl'] }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={asteroids.refreshing}
              onRefresh={() => asteroids.refresh(true)}
              tintColor={theme.accent.color}
            />
          }
          ListEmptyComponent={
            <Card style={{ marginTop: theme.spacing.lg }}>
              <EmptyState
                icon={asteroids.status === 'error' ? 'cloud-offline-outline' : 'search-outline'}
                title={asteroids.status === 'error' ? 'Falha ao carregar' : 'Nada encontrado'}
                description={
                  asteroids.status === 'error'
                    ? asteroids.error ?? 'Tente novamente em instantes.'
                    : 'Ajuste a busca ou os filtros para ver outros asteroides.'
                }
                actionLabel={asteroids.status === 'error' ? 'Tentar novamente' : undefined}
                onAction={asteroids.status === 'error' ? () => asteroids.refresh(true) : undefined}
              />
            </Card>
          }
        />
      )}
    </Screen>
  );
}
