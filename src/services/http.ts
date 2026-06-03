/**
 * Infraestrutura HTTP compartilhada por todos os servicos.
 *
 * Centraliza a criacao de instancias Axios com:
 *  - timeout padrao;
 *  - interceptors de request/response (log em desenvolvimento);
 *  - normalizacao de erros em uma classe `ApiError` com mensagens em pt-BR,
 *    distinguindo falha de rede, timeout e limite de requisicoes (429).
 */
import axios, { AxiosError, AxiosInstance } from 'axios';

export class ApiError extends Error {
  readonly status?: number;
  readonly isNetwork: boolean;
  readonly isRateLimit: boolean;

  constructor(
    message: string,
    options: { status?: number; isNetwork?: boolean; isRateLimit?: boolean } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.isNetwork = options.isNetwork ?? false;
    this.isRateLimit = options.isRateLimit ?? false;
  }
}

const REQUEST_TIMEOUT = 12_000;

function normalizeError(error: AxiosError): ApiError {
  // Sem resposta do servidor: rede indisponivel ou timeout.
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('Tempo de conexão esgotado. Tente novamente.', { isNetwork: true });
    }
    return new ApiError('Sem conexão com a internet. Verifique sua rede.', { isNetwork: true });
  }

  const status = error.response.status;
  if (status === 429) {
    return new ApiError('Limite de requisições atingido. Mostrando dados salvos.', {
      status,
      isRateLimit: true,
    });
  }
  if (status >= 500) {
    return new ApiError('O servidor está instável no momento.', { status });
  }
  if (status === 404) {
    return new ApiError('Recurso não encontrado.', { status });
  }
  return new ApiError('Não foi possível carregar os dados.', { status });
}

export function createClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT,
    headers: { Accept: 'application/json' },
  });

  client.interceptors.request.use((config) => {
    if (__DEV__) {
      const method = (config.method ?? 'get').toUpperCase();
      console.log(`[api] → ${method} ${config.baseURL ?? ''}${config.url ?? ''}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      if (__DEV__) {
        console.log(`[api] ← ${response.status} ${response.config.url ?? ''}`);
      }
      return response;
    },
    (error: AxiosError) => Promise.reject(normalizeError(error)),
  );

  return client;
}
