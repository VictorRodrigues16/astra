/**
 * SearchSortBar — barra de busca + filtros + ordenacao da tela Explorar.
 * Componente controlado: recebe o estado e os callbacks da tela.
 */
import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../contexts/ThemeContext';
import {
  AsteroidFilter,
  AsteroidSort,
  FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../../utils/asteroids';
import { AppText } from '../ui/Text';
import { Chip } from '../ui/Chip';

interface SearchSortBarProps {
  search: string;
  onSearch: (text: string) => void;
  filter: AsteroidFilter;
  onFilter: (filter: AsteroidFilter) => void;
  sort: AsteroidSort;
  onSort: (sort: AsteroidSort) => void;
}

export function SearchSortBar({ search, onSearch, filter, onFilter, sort, onSort }: SearchSortBarProps) {
  const { theme } = useTheme();

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          height: 48,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={onSearch}
          placeholder="Buscar asteroide pelo nome"
          placeholderTextColor={theme.colors.textMuted}
          style={{ flex: 1, color: theme.colors.text, fontSize: theme.fontSize.md, height: '100%' }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <Pressable onPress={() => onSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
        {FILTER_OPTIONS.map((opt) => (
          <Chip key={opt.key} label={opt.label} active={filter === opt.key} onPress={() => onFilter(opt.key)} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <AppText variant="label" style={{ marginRight: 2 }}>
          Ordenar
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
          {SORT_OPTIONS.map((opt) => (
            <Chip
              key={opt.key}
              label={opt.label}
              icon={opt.icon as keyof typeof Ionicons.glyphMap}
              active={sort === opt.key}
              onPress={() => onSort(opt.key)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
