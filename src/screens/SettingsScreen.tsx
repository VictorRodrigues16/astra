/**
 * SettingsScreen — personalizacao visual (tema claro/escuro/sistema, cor de
 * destaque), unidade de temperatura, reducao de animacoes, chave pessoal da
 * NASA e informacoes do projeto (ODS, fontes de dados e integrantes).
 */
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppHeader, AppText, Badge, Button, Card, Chip, Divider, Screen } from '../components';
import { useTheme } from '../contexts/ThemeContext';
import { useSettings } from '../contexts/SettingsContext';
import { accentPresets } from '../theme';
import { withAlpha } from '../utils/color';
import { confirmAction } from '../utils/confirm';
import { successFeedback, tapFeedback } from '../utils/haptics';
import { APP, DATA_SOURCES, NASA_KEY_URL, ODS, TEAM } from '../constants';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="label">{title}</AppText>
      <Card>{children}</Card>
    </View>
  );
}

function Row({
  icon,
  label,
  description,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  right?: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xs }}>
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <AppText variant="body" style={{ fontWeight: '600' }}>
          {label}
        </AppText>
        {description ? <AppText variant="caption">{description}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

export function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, setThemeMode, setAccentKey, setTempUnit, setReduceMotion, setNasaKey, resetSettings } =
    useSettings();
  const [keyDraft, setKeyDraft] = useState(settings.nasaApiKey);

  const themeOptions = [
    { key: 'light', label: 'Claro' },
    { key: 'dark', label: 'Escuro' },
    { key: 'system', label: 'Sistema' },
  ] as const;

  return (
    <Screen padded>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: theme.spacing.lg, paddingBottom: theme.spacing['5xl'], gap: theme.spacing.xl }}
      >
        <AppHeader overline="Preferências" title="Configurações" subtitle="Deixe a Astra com a sua cara" />

        {/* Aparencia */}
        <SettingsSection title="Aparência">
          <Row icon="contrast" label="Tema" description="Modo de cor da interface" />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
            {themeOptions.map((opt) => (
              <Chip key={opt.key} label={opt.label} active={settings.themeMode === opt.key} onPress={() => setThemeMode(opt.key)} />
            ))}
          </View>

          <View style={{ marginVertical: theme.spacing.lg }}>
            <Divider />
          </View>

          <Row icon="color-palette" label="Cor de destaque" description="Personalize a identidade visual" />
          <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.md }}>
            {accentPresets.map((preset) => {
              const selected = settings.accentKey === preset.key;
              return (
                <Pressable
                  key={preset.key}
                  onPress={() => {
                    tapFeedback();
                    setAccentKey(preset.key);
                  }}
                  accessibilityLabel={`Cor ${preset.label}`}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: selected ? preset.color : 'transparent',
                  }}
                >
                  <LinearGradient
                    colors={preset.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {selected ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : null}
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </SettingsSection>

        {/* Unidades e acessibilidade */}
        <SettingsSection title="Dados e acessibilidade">
          <Row
            icon="thermometer"
            label="Unidade de temperatura"
            right={
              <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                <Chip label="°C" active={settings.tempUnit === 'celsius'} onPress={() => setTempUnit('celsius')} />
                <Chip label="°F" active={settings.tempUnit === 'fahrenheit'} onPress={() => setTempUnit('fahrenheit')} />
              </View>
            }
          />
          <View style={{ marginVertical: theme.spacing.md }}>
            <Divider />
          </View>
          <Row
            icon="pulse"
            label="Reduzir animações"
            description="Desativa transições e efeitos de movimento"
            right={
              <Switch
                value={settings.reduceMotion}
                onValueChange={setReduceMotion}
                trackColor={{ true: theme.accent.color, false: theme.colors.border }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingsSection>

        {/* Chave da NASA */}
        <SettingsSection title="Chave da API NASA">
          <Row
            icon="key"
            label="Chave pessoal (opcional)"
            description={settings.nasaApiKey ? 'Usando sua chave pessoal' : 'Usando a chave de demonstração (DEMO_KEY)'}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              height: 46,
              paddingHorizontal: theme.spacing.md,
              marginTop: theme.spacing.sm,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <TextInput
              value={keyDraft}
              onChangeText={setKeyDraft}
              placeholder="Cole sua chave da NASA"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ flex: 1, color: theme.colors.text, fontSize: theme.fontSize.sm }}
            />
            <Pressable
              onPress={() => {
                setNasaKey(keyDraft.trim());
                successFeedback();
              }}
              hitSlop={8}
            >
              <AppText variant="caption" color="accent" style={{ fontWeight: '700' }}>
                Salvar
              </AppText>
            </Pressable>
          </View>
          <Pressable
            onPress={() => Linking.openURL(NASA_KEY_URL).catch(() => {})}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: theme.spacing.md }}
          >
            <Ionicons name="open-outline" size={14} color={theme.accent.color} />
            <AppText variant="caption" color="accent" style={{ fontWeight: '600' }}>
              Obter uma chave gratuita em api.nasa.gov
            </AppText>
          </Pressable>
        </SettingsSection>

        {/* Sobre o projeto */}
        <SettingsSection title="Sobre o projeto">
          <AppText variant="body" style={{ lineHeight: 21 }}>
            {APP.description}
          </AppText>

          <View style={{ marginVertical: theme.spacing.lg }}>
            <Divider />
          </View>

          <AppText variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Objetivos de Desenvolvimento Sustentável
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {ODS.map((o) => (
              <Badge key={o.code} label={`${o.code} · ${o.label}`} tone="success" icon="leaf" />
            ))}
          </View>

          <View style={{ marginVertical: theme.spacing.lg }}>
            <Divider />
          </View>

          <AppText variant="label" style={{ marginBottom: theme.spacing.sm }}>
            Fontes de dados
          </AppText>
          <View style={{ gap: theme.spacing.sm }}>
            {DATA_SOURCES.map((src) => (
              <Pressable
                key={src.label}
                onPress={() => Linking.openURL(src.url).catch(() => {})}
                style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
              >
                <Ionicons name="planet-outline" size={16} color={theme.accent.color} />
                <AppText variant="body" style={{ fontWeight: '600' }}>
                  {src.label}
                </AppText>
                <AppText variant="caption" style={{ flex: 1 }}>
                  {src.description}
                </AppText>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </SettingsSection>

        {/* Equipe */}
        <SettingsSection title="Equipe">
          {TEAM.map((member, i) => (
            <View key={`${member.rm}-${i}`}>
              {i > 0 ? (
                <View style={{ marginVertical: theme.spacing.sm }}>
                  <Divider />
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: withAlpha(theme.accent.color, 0.16),
                  }}
                >
                  <Ionicons name="person" size={18} color={theme.accent.color} />
                </View>
                <AppText variant="body" style={{ flex: 1, fontWeight: '600' }}>
                  {member.name}
                </AppText>
                <AppText mono variant="caption" style={{ color: theme.colors.textSecondary }}>
                  {member.rm}
                </AppText>
              </View>
            </View>
          ))}
        </SettingsSection>

        <Button
          label="Restaurar padrões"
          icon="refresh"
          variant="ghost"
          fullWidth
          onPress={() =>
            confirmAction('Restaurar padrões', 'Voltar todas as preferências ao estado inicial?', () => {
              resetSettings();
              setKeyDraft('');
            }, 'Restaurar')
          }
        />

        <AppText variant="caption" center style={{ marginTop: theme.spacing.sm }}>
          {APP.name} v{APP.version} · Desenvolvido para a Global Solution
        </AppText>
      </ScrollView>
    </Screen>
  );
}
