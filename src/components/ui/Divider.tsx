/** Divider — linha separadora fina coerente com o tema. */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';

export function Divider({ inset = 0 }: { inset?: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.colors.border,
        marginLeft: inset,
      }}
    />
  );
}
