/*
 * ============================================================================
 *  CONFIG — Astra API
 * ============================================================================
 *  ATENCAO (modulo de Ciberseguranca / DevSecOps):
 *  Este arquivo contem segredos HARDCODED de PROPOSITO. Representa a
 *  vulnerabilidade "Vazamento de Segredos" do exercicio. Ver VULNERABILITIES.md.
 *
 *  >>> NAO use este padrao em producao real. <<<
 *  O correto seria carregar de variaveis de ambiente / cofre (Vault, AWS
 *  Secrets Manager, GitHub Secrets) e NUNCA versionar segredos.
 * ============================================================================
 */
require('dotenv').config();

// VULN (segredos hardcoded + fallback que expoe os valores no codigo-fonte):
const config = {
  port: process.env.PORT || 3001,

  // Chave real da NASA exposta no codigo (e tambem no .env versionado).
  nasaApiKey: process.env.NASA_API_KEY || 'lAqSdO6KizcNUTtWDjuVlhhS6YbcQhzdgMXA2HuR',

  // "Segredo" de assinatura de JWT fraco e hardcoded.
  jwtSecret: process.env.JWT_SECRET || 'astra-super-secret-2026',

  // Credenciais de banco ficticias, hardcoded (exemplo de vazamento).
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    name: process.env.DB_NAME || 'astra',
  },

  // Token de "admin" estatico usado por endpoints "internos" (sem auth real).
  adminToken: process.env.ADMIN_TOKEN || 'let-me-in',
};

module.exports = config;
