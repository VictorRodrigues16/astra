/**
 * Servico de traducao EN -> PT-BR.
 *
 * O conteudo do APOD (titulo e explicacao) vem da NASA apenas em ingles. Para
 * manter o app em portugues, traduzimos esse texto usando o endpoint publico
 * do Google Translate (gtx), que responde com CORS liberado. Em qualquer
 * falha, devolvemos o texto original (fallback), entao o app nunca quebra.
 *
 * A traducao acontece dentro da busca do APOD (camada de servico), que e
 * cacheada — ou seja, traduzimos no maximo uma vez por janela de cache.
 */
import { resolveBase } from '../config';
import { createClient } from './http';

const client = createClient(resolveBase('gtx', 'https://translate.googleapis.com'));

/** Quebra o texto em pedacos curtos, respeitando limites de frase/palavra. */
function splitForTranslation(text: string, maxLen = 450): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  let rest = clean;
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf('. ', maxLen);
    if (cut < maxLen * 0.5) cut = rest.lastIndexOf(' ', maxLen);
    if (cut <= 0) cut = maxLen;
    else cut += 1;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

/** Extrai o texto traduzido da resposta (array aninhado) do gtx. */
function parseGtx(data: unknown): string | null {
  let payload = data;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      return null;
    }
  }
  const segments = (payload as unknown[] | undefined)?.[0];
  if (!Array.isArray(segments)) return null;
  return segments
    .map((s) => (Array.isArray(s) ? String(s[0] ?? '') : ''))
    .join('');
}

async function translateChunk(text: string): Promise<string> {
  const { data } = await client.get('/translate_a/single', {
    params: { client: 'gtx', sl: 'en', tl: 'pt-BR', dt: 't', q: text },
  });
  return parseGtx(data) ?? text;
}

export async function translateToPtBr(text: string | undefined | null): Promise<string> {
  const original = (text ?? '').trim();
  if (!original) return original;
  try {
    const parts = splitForTranslation(original);
    const translated: string[] = [];
    for (const part of parts) {
      translated.push(await translateChunk(part));
    }
    const result = translated.join(' ').trim();
    return result || original;
  } catch {
    return original;
  }
}
