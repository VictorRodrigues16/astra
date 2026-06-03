/**
 * Confirmacao multiplataforma: usa Alert nativo no iOS/Android e window.confirm
 * no Web (onde o Alert do react-native-web e limitado).
 */
import { Alert, Platform } from 'react-native';

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Confirmar',
): void {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : true;
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
