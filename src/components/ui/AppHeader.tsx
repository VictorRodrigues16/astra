/** AppHeader — cabecalho padrao de tela (titulo, legenda e acao a direita). */
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext';
import { AppText } from './Text';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  overline?: string;
}

export function AppHeader({ title, subtitle, right, overline }: AppHeaderProps) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}
    >
      <View style={{ flex: 1 }}>
        {overline ? (
          <AppText variant="label" color="accent" style={{ marginBottom: 4 }}>
            {overline}
          </AppText>
        ) : null}
        <AppText variant="display" style={{ fontSize: theme.fontSize['3xl'] }}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySecondary" style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}
