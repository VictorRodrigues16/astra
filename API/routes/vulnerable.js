/*
 * ============================================================================
 *  vulnerable.js — endpoints INTENCIONALMENTE VULNERAVEIS
 * ============================================================================
 *  Estes endpoints existem para o modulo de Ciberseguranca (DevSecOps).
 *  Cada um demonstra uma falha classica para que o colega de seguranca a
 *  identifique (SAST/DAST/scanners) e corrija. Ver VULNERABILITIES.md.
 *
 *  >>> NUNCA exponha este servico na internet publica. Rode local/Docker. <<<
 * ============================================================================
 */
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('../config');

const router = express.Router();

// V4 — SSRF: faz GET em QUALQUER URL enviada pelo cliente, sem allowlist.
//   Ex.: /api/proxy?url=http://169.254.169.254/latest/meta-data/
router.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: 'parametro "url" obrigatorio' });
  try {
    const upstream = await axios.get(target, { timeout: 15000 });
    res.status(upstream.status).send(upstream.data);
  } catch (err) {
    res.status(502).json({ error: 'proxy_error', target, detail: err.message });
  }
});

// V7 — Command Injection: concatena entrada do usuario direto no shell.
//   Ex.: /api/diagnostics/ping?host=8.8.8.8;id
router.get('/diagnostics/ping', (req, res) => {
  const host = req.query.host || 'localhost';
  const command = `ping -c 1 ${host}`;
  exec(command, (error, stdout, stderr) => {
    res.json({ command, stdout, stderr, error: error ? error.message : null });
  });
});

// V8 — Path Traversal: monta o caminho com entrada do usuario sem sanitizar.
//   Ex.: /api/files?name=../../../../etc/passwd
router.get('/files', (req, res) => {
  const name = req.query.name || 'leia-me.txt';
  const filePath = path.join(__dirname, '..', 'data', name);
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) return res.status(404).json({ error: 'not_found', path: filePath, detail: err.message });
    res.type('text/plain').send(content);
  });
});

// V1/V6 — Info Disclosure: expoe TODA a config (com segredos) sem autenticacao.
router.get('/debug/config', (req, res) => {
  res.json(config);
});

// V5 — Broken Auth: "autenticacao" por token estatico comparado em texto puro,
//   aceito via query string (vai parar em logs/historico).
router.get('/admin/secrets', (req, res) => {
  const token = req.query.token || req.headers['x-admin-token'];
  if (token !== config.adminToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  res.json({ nasaApiKey: config.nasaApiKey, jwtSecret: config.jwtSecret, db: config.db });
});

module.exports = router;
