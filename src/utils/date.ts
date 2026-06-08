/**
 * Helpers de data — usados para a janela de consulta de asteroides (NeoWs)
 * e para exibir datas em pt-BR.
 */

/** Converte uma Date para o formato YYYY-MM-DD exigido pela NeoWs. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Converte uma string ISO em Date interpretando datas "YYYY-MM-DD" como
 * LOCAIS (e nao UTC). Isso evita o classico bug de "voltar um dia" ao exibir
 * datas que vem sem horario (APOD, aproximacao de asteroides, previsao).
 */
export function parseISODate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(iso);
}

/** Data por extenso curta em pt-BR, ex.: "03 jun 2026". */
export function formatDate(iso: string): string {
  const date = parseISODate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Hora local curta, ex.: "14:32". */
export function formatTime(input: string | number): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Tempo relativo simples, ex.: "agora", "ha 2 min", "ha 1 h". */
export function formatRelative(timestamp: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return 'agora';
  if (sec < 60) return `ha ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `ha ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `ha ${hours} h`;
  const days = Math.floor(hours / 24);
  return `ha ${days} d`;
}
