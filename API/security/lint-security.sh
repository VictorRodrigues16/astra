#!/usr/bin/env bash
# ============================================================================
#  lint-security.sh — Checagem automatizada de segurança (DevSecOps / FIAP GS)
# ----------------------------------------------------------------------------
#  Implementação prática: "Criar uma checagem automatizada no pipeline
#  (ex.: lint de segurança)."
#
#  Roda os analisadores de segurança sobre a API e salva evidências em reports/:
#    1) ESLint + eslint-plugin-security (SAST) -> Command Injection (V7),
#       Path Traversal (V8), timing attack (V5), object injection, ReDoS...
#    2) Semgrep (rulesets de segurança)         -> SSRF e OWASP Top 10
#    3) npm audit (análise de dependências/SCA)  -> CVEs das libs
#
#  A MESMA checagem roda no CI em .github/workflows/security-lint.yml.
# ============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORTS_DIR="$SCRIPT_DIR/reports"
mkdir -p "$REPORTS_DIR"

echo "============================================================"
echo " Astra API — Checagem automatizada de segurança"
echo "============================================================"

echo ""
echo ">>> [1/3] ESLint + eslint-plugin-security (lint de segurança)"
( cd "$API_DIR" && npx eslint . ) | tee "$REPORTS_DIR/01-eslint-security.txt"
( cd "$API_DIR" && npx eslint . --max-warnings 0 >/dev/null 2>&1 ); GATE=$?
{
  echo ""
  echo ">>> GATE (npm run lint:security) exit code: $GATE  ($([ "$GATE" -ne 0 ] && echo 'DEPLOY BLOQUEADO' || echo 'DEPLOY APROVADO'))"
} | tee -a "$REPORTS_DIR/01-eslint-security.txt"

echo ""
echo ">>> [2/3] Semgrep (SAST via Docker)"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker run --rm -v "$API_DIR":/src semgrep/semgrep \
    semgrep scan --config p/javascript --config p/security-audit --config p/owasp-top-ten \
    /src/routes /src/server.js /src/config.js 2>&1 | tee "$REPORTS_DIR/02-semgrep.txt"
else
  echo "Docker indisponível — o Semgrep roda no CI (.github/workflows/security-lint.yml)." \
    | tee "$REPORTS_DIR/02-semgrep.txt"
fi

echo ""
echo ">>> [3/3] npm audit (análise de dependências)"
( cd "$API_DIR" && npm audit ) | tee "$REPORTS_DIR/03-npm-audit.txt"

echo ""
echo "============================================================"
echo " OK — evidências em: API/security/reports/ (01, 02, 03)"
echo "============================================================"
