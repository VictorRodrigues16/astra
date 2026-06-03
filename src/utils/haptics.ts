/**
 * Wrapper seguro para feedback tatil. No Web o expo-haptics nao se aplica,
 * entao viram no-ops silenciosos.
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export function tapFeedback(): void {
  if (!supported) return;
  Haptics.selectionAsync().catch(() => {});
}

export function successFeedback(): void {
  if (!supported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function impactFeedback(): void {
  if (!supported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
