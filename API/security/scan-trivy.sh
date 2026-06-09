#!/usr/bin/env bash
# ============================================================================
#  scan-trivy.sh — Scan de vulnerabilidades (DevSecOps / FIAP Global Solution)
# ----------------------------------------------------------------------------
#  Implementacao pratica do modulo de Ciberseguranca:
#  "Configurar um scan de vulnerabilidades em dependencias OU conteineres."
#  Aqui cobrimos OS DOIS, com uma unica ferramenta (Trivy).
#
#  Alvos:
#    1) DEPENDENCIAS (SCA)   -> trivy fs  (le o package-lock.json)      -> V2
#    2) IMAGEM DOCKER        -> trivy image (SO + libs)                 -> V3
#  Bonus (mesma ferramenta, custo zero):
#    - secret scan           -> segredos hardcoded conhecidos           -> V1
#    - misconfig (IaC)       -> Dockerfile inseguro (root, etc.)        -> V3
#
#  MODO: REPORT-ONLY. Nunca quebra o build (exit 0) por padrao.
#  Para virar um "gate" que bloqueia o deploy, rode com:  EXIT_CODE=1 ./scan-trivy.sh
#
#  NAO precisa instalar o Trivy: ele roda via imagem Docker oficial.
#  Pre-requisito: Docker instalado e rodando.
# ============================================================================
set -euo pipefail

# --- caminhos ---------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"          # .../astra/API
REPORTS_DIR="$SCRIPT_DIR/reports"
CACHE_DIR="$SCRIPT_DIR/.trivycache"              # cache do banco de CVEs (gitignored)

# --- parametros (sobrescreviveis via variavel de ambiente) ------------------
IMAGE_NAME="${IMAGE_NAME:-astra-api:latest}"     # imagem a escanear
SEVERITY="${SEVERITY:-HIGH,CRITICAL}"            # severidades (limiar padrao de gate)
EXIT_CODE="${EXIT_CODE:-0}"                      # 0 = report-only | 1 = gate (bloqueia)
TRIVY_IMAGE="aquasec/trivy:latest"

mkdir -p "$REPORTS_DIR" "$CACHE_DIR"

# helper: roda o Trivy via Docker (sem precisar instalar nada)
trivy() {
  docker run --rm \
    -v "$CACHE_DIR":/root/.cache/trivy \
    -v "$API_DIR":/scan \
    -v /var/run/docker.sock:/var/run/docker.sock \
    "$TRIVY_IMAGE" "$@"
}

echo "============================================================"
echo " Astra API — Scan de Vulnerabilidades (Trivy)"
echo " Imagem: $IMAGE_NAME | Severidade: $SEVERITY | Gate(exit): $EXIT_CODE"
echo "============================================================"

# --- garante que a imagem existe -------------------------------------------
if ! docker image inspect "$IMAGE_NAME" >/dev/null 2>&1; then
  echo "[*] Imagem $IMAGE_NAME nao encontrada — buildando a partir de $API_DIR ..."
  docker build -t "$IMAGE_NAME" "$API_DIR"
fi

# ===========================================================================
# 1) DEPENDENCIAS + SEGREDOS + MISCONFIG (filesystem scan)  -> V1, V2, V3
# ===========================================================================
echo ""
echo ">>> [1/2] Scan de DEPENDENCIAS / SEGREDOS / MISCONFIG (filesystem)"
trivy fs \
  --scanners vuln,secret,misconfig \
  --severity "$SEVERITY" \
  --skip-dirs node_modules \
  --skip-dirs security \
  --exit-code "$EXIT_CODE" \
  /scan | tee "$REPORTS_DIR/01-deps-fs.txt"

# versao JSON (dados completos p/ anexar como evidencia)
trivy fs \
  --scanners vuln,secret,misconfig \
  --severity "$SEVERITY" \
  --skip-dirs node_modules \
  --skip-dirs security \
  --format json \
  --output /scan/security/reports/01-deps-fs.json \
  --exit-code 0 \
  /scan >/dev/null

# ===========================================================================
# 2) IMAGEM DOCKER (SO + libs)  -> V3
# ===========================================================================
echo ""
echo ">>> [2/2] Scan da IMAGEM Docker ($IMAGE_NAME)"
trivy image \
  --scanners vuln \
  --severity "$SEVERITY" \
  --exit-code "$EXIT_CODE" \
  "$IMAGE_NAME" | tee "$REPORTS_DIR/02-image.txt"

# OBS: o JSON completo da imagem nao e gerado por padrao (pode passar de 5 MB).
# Para gera-lo: troque '--format table' por '--format json --output ...'.

echo ""
echo "============================================================"
echo " OK — relatorios salvos em: API/security/reports/"
echo "   - 01-deps-fs.txt / .json   (dependencias, segredos, misconfig)"
echo "   - 02-image.txt             (imagem Docker — tabela)"
echo "============================================================"
