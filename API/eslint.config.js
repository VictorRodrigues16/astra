/*
 * ============================================================================
 *  eslint.config.js — LINT DE SEGURANÇA (SAST) da Astra API
 * ============================================================================
 *  Implementação prática do módulo de Cibersegurança / DevSecOps:
 *  "Criar uma checagem automatizada no pipeline (ex.: lint de segurança)."
 *
 *  Usa o eslint-plugin-security para detectar padrões perigosos no código:
 *   - security/detect-child-process        -> Command Injection (V7)
 *   - security/detect-non-literal-fs-filename -> Path Traversal (V8)
 *   - security/detect-object-injection, detect-unsafe-regex, etc.
 *
 *  Rodar:  npm run lint:security         (modo GATE: falha se houver achados)
 *          npm run lint:security:report  (só reporta, não falha)
 *  No CI:  .github/workflows/security-lint.yml
 * ============================================================================
 */
const security = require('eslint-plugin-security');

module.exports = [
  // não lintar dependências, artefatos de scan nem dados de exemplo
  { ignores: ['node_modules/**', 'security/**', 'data/**'] },

  {
    files: ['**/*.js'],
    plugins: { security },
    // foca só em segurança: não reporta diretivas eslint-disable "não usadas"
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    rules: {
      // regras recomendadas do plugin de segurança (Command Injection,
      // Path Traversal, ReDoS, Object Injection, eval, etc.)
      ...security.configs.recommended.rules,
    },
  },
];
