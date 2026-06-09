# ============================================================================
#  Dockerfile — Astra API (versão corrigida / hardened)
# ============================================================================
#  Correções da V3 (Imagem de contêiner vulnerável):
#   - Base atual e slim: node:20-alpine (em vez de node:14 EOL).
#   - Build multi-stage: instala SOMENTE dependências de produção (npm ci --omit=dev).
#   - Roda como usuário NÃO-root (USER node).
#   - NÃO copia o .env (ver .dockerignore) nem o contexto inteiro — só o necessário.
#   - HEALTHCHECK para orquestração.
# ============================================================================

# ---- estágio de dependências ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- estágio de runtime ----
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Remove o npm CLI embutido na imagem base: ele NÃO é usado em runtime (as
# dependências já foram instaladas no estágio "deps") e arrasta CVEs de
# ferramentas (tar, glob, minimatch, cross-spawn). Reduz a superfície a zero.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# copia apenas o necessário, já com dono não-root (usuário "node" existe na imagem)
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node server.js config.js ./
COPY --chown=node:node routes ./routes

USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
