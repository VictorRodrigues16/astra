/*
 * ============================================================================
 *  CONFIG — Astra API (versão corrigida / hardened)
 * ============================================================================
 *  Correção da V1 (Vazamento de Segredos):
 *   - Sem segredos hardcoded no código.
 *   - Valores vêm SOMENTE de variáveis de ambiente (.env local fora do Git,
 *     cofre ou GitHub Secrets).
 *   - O .env foi removido do versionamento (git rm --cached) e a chave real
 *     que estava exposta deve ser ROTACIONADA em https://api.nasa.gov.
 * ============================================================================
 */
require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,

  // DEMO_KEY é a chave pública de demonstração da NASA (rate-limit baixo).
  // Para uso real, defina NASA_API_KEY via ambiente/cofre — sem fallback de
  // segredo no código-fonte.
  nasaApiKey: process.env.NASA_API_KEY || 'DEMO_KEY',
};

module.exports = config;
