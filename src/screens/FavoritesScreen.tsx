/**
 * FavoritesScreen — itens salvos localmente (asteroides e imagens APOD) e o
 * historico de asteroides visualizados recentemente. Tudo vem do
 * FavoritesContext, que persiste no AsyncStorage. Alterna entre as duas
 * visoes por um seletor segmentado.
 */
import React, { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  AppHeader,
  AppText,
  AsteroidCard,
  Card,
  Chip,
  EmptyState,
  RemoteImage,
  Screen,
} from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { confirmAction } from '../utils/confirm';
import { formatDate } from '../utils/date';
import { tapFeedback } from '../utils/haptics';
import type { Asteroid, ApodFavorite, FavoriteItem } from '../types';
import type { RootStackNavigation } from '../navigation/types';

type Tab = 'favorites' | 'history';

function ApodFavoriteRow({ item, onRemove }: { item: ApodFavorite; onRemove: () => void }) {
  const { theme } = useTheme();
  return (
    <Card padding="md">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <RemoteImage uri={item.apod.imageUrl} height={56} radius={12} style={{ width: 56 }} />
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color="accent" style={{ fontWeight: '700' }}>
            NASA · APOD
          </AppText>
          <AppText variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>
            {item.apod.title}
          </AppText>
          <AppText variant="caption">{formatDate(item.apod.date)}</AppText>
        </View>
        <Pressable
          onPress={() => {
            tapFeedback();
            onRemove();
          }}
          hitSlop={10}
          accessibilityLabel="Remover dos favoritos"
        >
          <Ionicons name="heart" size={22} color={theme.colors.danger} />
        </Pressable>
      </View>
    </Card>
  );
}

export function FavoritesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<RootStackNavigation>();
  const { favorites, history, removeFavorite, clearFavorites, clearHistory } = useFavorites();
  const [tab, setTab] = useState<Tab>('favorites');

  const openAsteroid = (asteroid: Asteroid) => navigation.navigate('AsteroidDetail', { asteroid });

  const renderFavorite = (item: FavoriteItem) => {
    if (item.kind === 'asteroid') {
      return <AsteroidCard asteroid={item.asteroid} onPress={() => openAsteroid(item.asteroid)} />;
    }
    return <ApodFavoriteRow item={item} onRemove={() => removeFavorite(item.id)} />;
  };

  const showingFavorites = tab === 'favorites';
  const canClear = showingFavorites ? favorites.length > 0 : history.length > 0;

  const onClear = () => {
    if (showingFavorites) {
      confirmAction('Limpar favoritos', 'Remover todos os itens salvos?', clearFavorites, 'Limpar');
    } else {
      confirmAction('Limpar histórico', 'Apagar o histórico de visualizações?', clearHistory, 'Limpar');
    }
  };

  return (
    <Screen padded>
      <View style={{ paddingTop: theme.spacing.sm }}>
        <AppHeader
          overline="Sua coleção"
          title="Favoritos"
          subtitle="Salvos e vistos recentemente"
          right={
            canClear ? (
              <Pressable onPress={onClear} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                <AppText variant="caption" style={{ color: theme.colors.danger, fontWeight: '700' }}>
                  Limpar
                </AppText>
              </Pressable>
            ) : undefined
          }
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
          <Chip label={`Favoritos (${favorites.length})`} active={showingFavorites} onPress={() => setTab('favorites')} icon="heart" />
          <Chip label={`Histórico (${history.length})`} active={!showingFavorites} onPress={() => setTab('history')} icon="time" />
        </View>
      </View>

      {showingFavorites ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderFavorite(item)}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          contentContainerStyle={{ paddingTop: theme.spacing.xs, paddingBottom: theme.spacing['5xl'] }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="Nenhum favorito ainda"
              description="Toque no coração de um asteroide ou da imagem do dia para salvar aqui."
            />
          }
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AsteroidCard asteroid={item} onPress={() => openAsteroid(item)} />}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
          contentContainerStyle={{ paddingTop: theme.spacing.xs, paddingBottom: theme.spacing['5xl'] }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="Histórico vazio"
              description="Os asteroides que você abrir aparecem aqui para acesso rápido."
            />
          }
        />
      )}
    </Screen>
  );
}
