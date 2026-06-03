// Configuracao padrao do Metro para projetos Expo.
// Mantida explicita para facilitar futuras customizacoes do bundler.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
