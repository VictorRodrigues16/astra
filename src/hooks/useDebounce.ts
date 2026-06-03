/**
 * useDebounce — adia a atualizacao de um valor ate ele parar de mudar.
 * Usado na busca da tela Explorar para nao filtrar a cada tecla.
 */
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
