/*
 * ============================================================================
 *  Astra API — servidor (versão corrigida / hardened)
 * ============================================================================
 *  Backend de proxy do app Astra. Esta versão aplica as correções de segurança
 *  do módulo de DevSecOps. Ver VULNERABILITIES.md e a pasta security/.
 *
 *  Correções aplicadas neste arquivo:
 *   - V5: helmet (security headers), CORS por allowlist, rate limiting.
 *   - V6: logging sem segredos, erros genéricos ao cliente (sem stack trace).
 *   - V4/V5/V7/V8: endpoints intencionalmente vulneráveis (routes/vulnerable.js)
 *     foram REMOVIDOS — a única superfície pública agora são os proxies legítimos.
 * ============================================================================
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const upstreams = require('./routes/upstreams');

const app = express();

// V5 (corrigido) — cabeçalhos de segurança.
app.use(helmet());

// V5 (corrigido) — CORS restrito a uma allowlist (Zero Trust), configurável via
// CORS_ORIGINS (separado por vírgula). Default = origens de desenvolvimento.
const allowedOrigins = (
  process.env.CORS_ORIGINS
  || 'http://localhost:8081,http://localhost:19006,http://localhost:3000'
).split(',').map((s) => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // permite ferramentas sem header Origin (curl, apps nativos) e a allowlist
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin não permitida pelo CORS'));
  },
}));

app.use(express.json({ limit: '1mb' }));

// V5 (corrigido) — rate limiting básico contra abuso.
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

// V6 (corrigido) — log de acesso SEM segredos (nada de imprimir a chave).
app.use(morgan('combined'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Proxies legítimos das APIs externas (única superfície pública).
app.use('/api', upstreams);

// 404 padrão.
app.use((req, res) => res.status(404).json({ error: 'not_found' }));

// V6 (corrigido) — handler de erro: loga server-side, responde genérico ao
// cliente (sem stack trace, sem detalhes internos).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[astra-api] erro:', err.message);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'internal_error' : err.message });
});

app.listen(config.port, () => {
  console.log(`[astra-api] ouvindo em http://localhost:${config.port}`);
});
