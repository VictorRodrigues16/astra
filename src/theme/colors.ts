/**
 * Paletas de cor da Astra.
 *
 * O app trabalha com dois esquemas (claro/escuro) e uma cor de destaque
 * (accent) escolhida pelo usuario nas Configuracoes — por isso as cores de
 * destaque vivem separadas das paletas base e sao combinadas em runtime.
 */
import type { ColorMode } from './index';

export interface SchemePalette {
  /** Fundo principal da aplicacao. */
  background: string;
  /** Fundo levemente elevado (ex.: cabecalhos, barras). */
  backgroundElevated: string;
  /** Superficie de cards padrao. */
  surface: string;
  /** Superficie alternativa / secundaria. */
  surfaceAlt: string;
  /** Estado de toque/realce de superficie. */
  surfaceHover: string;
  /** Cor de borda sutil. */
  border: string;
  /** Borda com mais contraste. */
  borderStrong: string;
  /** Texto primario. */
  text: string;
  /** Texto secundario. */
  textSecondary: string;
  /** Texto de baixo contraste / legendas. */
  textMuted: string;
  /** Inverso do texto (sobre superficies com accent). */
  textInverse: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  /** Cor de overlay para modais e bottom sheets. */
  overlay: string;
  /** Base de brilho usada em skeletons. */
  skeleton: string;
  skeletonHighlight: string;
}

export const darkPalette: SchemePalette = {
  background: '#070B14',
  backgroundElevated: '#0B1120',
  surface: '#111A2E',
  surfaceAlt: '#162136',
  surfaceHover: '#1D2B45',
  border: '#1F2C44',
  borderStrong: '#2C3D5C',
  text: '#F1F5F9',
  textSecondary: '#9FB0C9',
  textMuted: '#647088',
  textInverse: '#060A12',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FB7185',
  info: '#38BDF8',
  overlay: 'rgba(3, 6, 13, 0.72)',
  skeleton: '#162136',
  skeletonHighlight: '#22314D',
};

export const lightPalette: SchemePalette = {
  background: '#EEF2FA',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5FC',
  surfaceHover: '#E5ECF7',
  border: '#DCE4F0',
  borderStrong: '#C3CFE2',
  text: '#0E1726',
  textSecondary: '#4A5872',
  textMuted: '#8593AC',
  textInverse: '#FFFFFF',
  success: '#059669',
  warning: '#D97706',
  danger: '#E11D48',
  info: '#0284C7',
  overlay: 'rgba(15, 23, 42, 0.45)',
  skeleton: '#E3E9F3',
  skeletonHighlight: '#F2F6FC',
};

export interface AccentPreset {
  key: string;
  label: string;
  /** Cor principal do destaque. */
  color: string;
  /** Versao mais clara (para texto sobre fundos escuros, etc.). */
  colorBright: string;
  /** Tonalidade translucida para fundos suaves no tema escuro. */
  soft: string;
  /** Tonalidade translucida para fundos suaves no tema claro. */
  softLight: string;
  /** Gradiente caracteristico (usado em heros, botoes e graficos). */
  gradient: [string, string];
}

export const accentPresets: AccentPreset[] = [
  {
    key: 'aurora',
    label: 'Aurora',
    color: '#22D3EE',
    colorBright: '#67E8F9',
    soft: 'rgba(34, 211, 238, 0.14)',
    softLight: 'rgba(8, 145, 178, 0.12)',
    gradient: ['#22D3EE', '#3B82F6'],
  },
  {
    key: 'nebula',
    label: 'Nebulosa',
    color: '#8B5CF6',
    colorBright: '#A78BFA',
    soft: 'rgba(139, 92, 246, 0.16)',
    softLight: 'rgba(124, 58, 237, 0.12)',
    gradient: ['#8B5CF6', '#EC4899'],
  },
  {
    key: 'solar',
    label: 'Solar',
    color: '#F59E0B',
    colorBright: '#FBBF24',
    soft: 'rgba(245, 158, 11, 0.16)',
    softLight: 'rgba(217, 119, 6, 0.12)',
    gradient: ['#F59E0B', '#EF4444'],
  },
  {
    key: 'plasma',
    label: 'Plasma',
    color: '#F472B6',
    colorBright: '#F9A8D4',
    soft: 'rgba(244, 114, 182, 0.16)',
    softLight: 'rgba(219, 39, 119, 0.12)',
    gradient: ['#F472B6', '#8B5CF6'],
  },
  {
    key: 'quantum',
    label: 'Quantum',
    color: '#34D399',
    colorBright: '#6EE7B7',
    soft: 'rgba(52, 211, 153, 0.16)',
    softLight: 'rgba(5, 150, 105, 0.12)',
    gradient: ['#34D399', '#22D3EE'],
  },
];

export const defaultAccentKey = 'aurora';

export function getPalette(mode: ColorMode): SchemePalette {
  return mode === 'dark' ? darkPalette : lightPalette;
}

export function getAccent(key: string): AccentPreset {
  return accentPresets.find((a) => a.key === key) ?? accentPresets[0];
}
