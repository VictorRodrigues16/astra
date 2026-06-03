/**
 * Wrapper tipado e a prova de erros sobre o AsyncStorage.
 *
 * Toda a persistencia local do app passa por aqui — assim serializamos/
 * desserializamos JSON em um unico lugar e nunca deixamos uma excecao de
 * I/O derrubar a UI.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] falha ao ler "${key}"`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] falha ao gravar "${key}"`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] falha ao remover "${key}"`, error);
  }
}

/** Remove todas as chaves de cache mantendo configuracoes e favoritos. */
export async function clearByPrefix(prefix: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const target = keys.filter((k) => k.startsWith(prefix));
    if (target.length) await AsyncStorage.multiRemove(target);
  } catch (error) {
    console.warn(`[storage] falha ao limpar prefixo "${prefix}"`, error);
  }
}
