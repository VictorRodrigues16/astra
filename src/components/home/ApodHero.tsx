/**
 * ApodHero — destaque visual da Home com a imagem astronomica do dia (NASA
 * APOD): foto, overlay em gradiente, titulo, data, favoritar e explicacao
 * expansivel.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../contexts/ThemeContext';
import { apodFavoriteId, useFavorites } from '../../contexts/FavoritesContext';
import { formatDate } from '../../utils/date';
import { tapFeedback } from '../../utils/haptics';
import type { Apod } from '../../types';
import { AppText } from '../ui/Text';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { RemoteImage } from '../ui/RemoteImage';
import { Skeleton } from '../ui/Skeleton';

export function ApodHero({ apod }: { apod: Apod }) {
  const { theme } = useTheme();
  const { isFavorite, toggleApod } = useFavorites();
  const [expanded, setExpanded] = useState(false);

  const favorite = isFavorite(apodFavoriteId(apod));
  const IMAGE_HEIGHT = 236;

  return (
    <Card padding={0} shadow="md" style={{ overflow: 'hidden' }}>
      <View>
        <RemoteImage uri={apod.imageUrl} height={IMAGE_HEIGHT} />

        <LinearGradient
          colors={['rgba(4,7,14,0)', 'rgba(4,7,14,0.35)', 'rgba(4,7,14,0.92)']}
          locations={[0, 0.5, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: IMAGE_HEIGHT }}
          pointerEvents="none"
        />

        <View
          style={{
            position: 'absolute',
            top: theme.spacing.md,
            left: theme.spacing.md,
            right: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Badge label={apod.mediaType === 'video' ? 'NASA · Vídeo' : 'NASA · APOD'} tone="accent" icon="planet" />
          <Pressable
            onPress={() => {
              tapFeedback();
              toggleApod(apod);
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(8,12,22,0.55)',
            }}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? theme.colors.danger : '#FFFFFF'}
            />
          </Pressable>
        </View>

        <View style={{ position: 'absolute', left: theme.spacing.lg, right: theme.spacing.lg, bottom: theme.spacing.lg }}>
          <AppText variant="caption" numberOfLines={1} style={{ color: 'rgba(255,255,255,0.75)' }}>
            {formatDate(apod.date)}
            {apod.copyright ? `  ·  ${apod.copyright}` : ''}
          </AppText>
          <AppText variant="title" style={{ color: '#FFFFFF', marginTop: 2 }} numberOfLines={2}>
            {apod.title}
          </AppText>
        </View>
      </View>

      <Pressable onPress={() => setExpanded((v) => !v)} style={{ padding: theme.spacing.lg }}>
        <AppText variant="bodySecondary" numberOfLines={expanded ? undefined : 3} style={{ lineHeight: 21 }}>
          {apod.explanation}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: theme.spacing.sm }}>
          <AppText variant="caption" color="accent" style={{ fontWeight: '700' }}>
            {expanded ? 'Ler menos' : 'Ler mais'}
          </AppText>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={theme.accent.color} />
        </View>
      </Pressable>
    </Card>
  );
}

/** Placeholder do ApodHero enquanto a imagem do dia carrega. */
export function ApodHeroSkeleton() {
  return (
    <Card padding={0} shadow="md" style={{ overflow: 'hidden' }}>
      <Skeleton width="100%" height={236} radius={0} />
      <View style={{ padding: 16, gap: 8 }}>
        <Skeleton width="100%" height={14} radius={5} />
        <Skeleton width="90%" height={14} radius={5} />
        <Skeleton width="60%" height={14} radius={5} />
      </View>
    </Card>
  );
}
