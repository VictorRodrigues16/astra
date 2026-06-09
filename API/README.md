# 🛰️ Astra API (backend de proxy)

Backend em **Node.js + Express** que serve de **proxy** para todas as APIs
externas usadas pelo app Astra (NASA APOD/NeoWs, Open-Meteo, ISS, geocodificação
e tradução). O app mobile passa a chamar este backend em vez de bater direto nas
APIs de terceiros.

> 🛡️ **Versão corrigida (hardened).** Este backend nasceu com vulnerabilidades
> **intencionais** para o módulo de **Cibersegurança / DevSecOps** (ver
> **[VULNERABILITIES.md](./VULNERABILITIES.md)**). As falhas foram **detectadas**
> pelo scan em **[`security/`](./security)** e **corrigidas** — o histórico
> antes/depois está em `security/reports/`.

---

## ▶️ Como rodar

### Node
```bash
cd API
cp .env.example .env   # ajuste a chave da NASA se quiser (DEMO_KEY funciona)
npm install
npm start              # http://localhost:3001
```

### Docker
```bash
cd API
docker compose up --build   # http://localhost:3001
```

---

## 🔌 Endpoints

### Proxies (espelham os upstreams)
| Rota | Upstream |
|---|---|
| `GET /api/nasa/planetary/apod` | NASA APOD (chave injetada server-side) |
| `GET /api/nasa/neo/rest/v1/feed` | NASA NeoWs |
| `GET /api/openmeteo/v1/forecast` | Open-Meteo |
| `GET /api/iss/v1/satellites/25544` | wheretheiss.at |
| `GET /api/bigdatacloud/data/reverse-geocode-client` | BigDataCloud |
| `GET /api/gtx/translate_a/single` | Google Translate |
| `GET /api/health` | Healthcheck |

> ℹ️ Os endpoints intencionalmente vulneráveis que existiam (`/api/proxy`,
> `/api/diagnostics/ping`, `/api/files`, `/api/debug/config`,
> `/api/admin/secrets`) foram **removidos** na correção (V4, V5, V7, V8). A única
> superfície pública agora são os proxies acima, com `helmet`, CORS por allowlist
> e rate limiting.

---

## 🔗 Como o app usa este backend

No app (raiz do projeto), defina a variável de ambiente apontando para o backend:

```bash
# .env do app (Expo)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Com isso, os serviços do app (`src/services/*`) passam a chamar este proxy.
Sem a variável, o app chama as APIs externas diretamente.

---

## 🧪 Conexão com a entrega de DevSecOps

Este backend é o "alvo" do módulo de Cibersegurança:

1. **Mapeamento de riscos** → tabela em [`VULNERABILITIES.md`](./VULNERABILITIES.md).
2. **Controles** → SCA (`npm audit`), secret scan (gitleaks), scan de imagem
   (Trivy), SAST (Semgrep/CodeQL), DAST.
3. **Implementação prática** → **scan de vulnerabilidades com Trivy** (dependências
   + imagem). Script, relatórios e instruções em [`security/`](./security).
4. **Simulação de pipeline** → o scan detecta a falha → o deploy é bloqueado →
   **correção aplicada** (ver `security/reports/antes/` vs `security/reports/` e a
   seção "Status das correções" em `VULNERABILITIES.md`).
