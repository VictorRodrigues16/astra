/*
 * ============================================================================
 *  Astra API — servidor
 * ============================================================================
 *  Backend de proxy do app Astra. Construido com vulnerabilidades INTENCIONAIS
 *  para o modulo de Ciberseguranca (DevSecOps). Ver VULNERABILITIES.md.
 *
 *  Rode local/Docker apenas. NUNCA exponha na internet publica.
 * ============================================================================
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const config = require('./config');
const upstreams = require('./routes/upstreams');
const vulnerable = require('./routes/vulnerable');

const app = express();

// V5 — CORS totalmente aberto (qualquer origem). Sem allowlist, sem Zero Trust.
app.use(cors()); // Access-Control-Allow-Origin: *
app.use(express.json());

// V6 — "monitoramento": apenas log de console, sem retencao/alertas...
app.use(morgan('dev'));
// ...e ainda imprime o segredo no startup (vazamento de segredo em log).
console.log('[astra-api] NASA_API_KEY em uso =', config.nasaApiKey);

// V5 — Nenhuma autenticacao, nenhum rate limiting, nenhum helmet/security headers.

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: Date.now() }));

// Proxies legitimos das APIs externas.
app.use('/api', upstreams);
// Endpoints intencionalmente vulneraveis (exercicio de seguranca).
app.use('/api', vulnerable);

// V6 — handler de erro que vaza a stack trace completa para o cliente.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.listen(config.port, () => {
  console.log(`[astra-api] ouvindo em http://localhost:${config.port}`);
  console.log('[astra-api] AVISO: build intencionalmente vulneravel (ver VULNERABILITIES.md).');
});
