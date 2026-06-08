/**
 * Chaves centralizadas do AsyncStorage. Concentrar aqui evita strings
 * espalhadas e colisoes de chave.
 */
export const StorageKeys = {
  settings: '@astra/settings',
  favorites: '@astra/favorites',
  history: '@astra/history',
  /** Prefixo do cache de respostas de API (com TTL). */
  cachePrefix: '@astra/cache:',
} as const;
