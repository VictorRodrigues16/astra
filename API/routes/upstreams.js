/*
 * upstreams.js — proxy das APIs externas usadas pela Astra.
 *
 * O app mobile passa a chamar ESTE backend em vez de bater direto nas APIs
 * externas. Cada prefixo espelha o caminho do upstream correspondente, entao
 * o front so troca a base da URL.
 *
 * Observacao de seguranca: as chamadas feitas aqui (server-side) sao
 * confiaveis; o endpoint /nasa injeta a chave da NASA pelo lado do servidor.
 * As vulnerabilidades intencionais ficam em routes/vulnerable.js e config.js.
 */
const express = require('express');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

function makeForwarder(base, injectParams) {
  return async (req, res) => {
    const wildcard = req.params[0] || '';
    const url = `${base}/${wildcard}`;
    try {
      const upstream = await axios.get(url, {
        params: { ...req.query, ...(injectParams || {}) },
        timeout: 15000,
        headers: { 'User-Agent': 'astra-api/1.0', Accept: 'application/json' },
      });
      res.status(upstream.status).json(upstream.data);
    } catch (err) {
      const status = err.response ? err.response.status : 502;
      // Mensagem de erro verbosa (ver V6 em VULNERABILITIES.md).
      res.status(status).json({ error: 'upstream_error', upstream: url, detail: err.message });
    }
  };
}

// NASA (APOD + NeoWs) — a chave e injetada server-side.
router.get('/nasa/*', makeForwarder('https://api.nasa.gov', { api_key: config.nasaApiKey }));

// Clima (Open-Meteo, sem chave).
router.get('/openmeteo/*', makeForwarder('https://api.open-meteo.com'));

// Posicao da ISS (wheretheiss.at, sem chave).
router.get('/iss/*', makeForwarder('https://api.wheretheiss.at'));

// Geocodificacao reversa (BigDataCloud, sem chave).
router.get('/bigdatacloud/*', makeForwarder('https://api.bigdatacloud.net'));

// Traducao (Google gtx, sem chave).
router.get('/gtx/*', makeForwarder('https://translate.googleapis.com'));

module.exports = router;
