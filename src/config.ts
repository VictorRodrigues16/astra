/**
 * Configuracao de runtime do app.
 *
 * API_BASE_URL: quando definido (via variavel de ambiente EXPO_PUBLIC_API_URL),
 * o app roteia TODAS as chamadas externas pelo nosso backend de proxy (pasta
 * /API). Quando vazio, o app chama as APIs externas diretamente — modo usado na
 * build web de producao (o backend, por ser intencionalmente vulneravel, nao
 * vai para a internet publica).
 *
 * Para usar o backend localmente, crie um arquivo .env na raiz do projeto:
 *   EXPO_PUBLIC_API_URL=http://localhost:3001
 */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** true quando as requisicoes passam pelo backend proprio. */
export const USING_BACKEND = API_BASE_URL.length > 0;

/**
 * Resolve a base de uma API: o backend (com prefixo) quando configurado, ou a
 * URL externa direta caso contrario. Os caminhos das requisicoes sao os mesmos
 * em ambos os modos (o backend espelha os upstreams).
 */
export function resolveBase(prefix: string, externalUrl: string): string {
  return API_BASE_URL ? `${API_BASE_URL}/api/${prefix}` : externalUrl;
}
