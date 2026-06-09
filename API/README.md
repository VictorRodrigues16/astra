# 🛰️ Astra API (backend de proxy)

Backend em **Node.js + Express** que serve de **proxy** para todas as APIs
externas usadas pelo app Astra (NASA APOD/NeoWs, Open-Meteo, ISS, geocodificação
e tradução). O app mobile passa a chamar este backend em vez de bater direto nas
APIs de terceiros.

> ⚠️ **Artefato educacional.** Este serviço foi construído com vulnerabilidades
> **intencionais** para o módulo de **Cibersegurança / DevSecOps** da Global
> Solution. Veja **[VULNERABILITIES.md](./VULNERABILITIES.md)**.
> **Não publique na internet** — rode apenas local / Docker.

---

## ▶️ Como rodar

### Node
```bash
cd API
npm install
npm start          # http://localhost:3001
```

### Docker
```bash
cd API
docker compose up --build   # http://localhost:3001
```

---

## 🔌 Endpoints

### Proxies legítimos (espelham os upstreams)
| Rota | Upstream |
|---|---|
| `GET /api/nasa/planetary/apod` | NASA APOD (chave injetada server-side) |
| `GET /api/nasa/neo/rest/v1/feed` | NASA NeoWs |
| `GET /api/openmeteo/v1/forecast` | Open-Meteo |
| `GET /api/iss/v1/satellites/25544` | wheretheiss.at |
| `GET /api/bigdatacloud/data/reverse-geocode-client` | BigDataCloud |
| `GET /api/gtx/translate_a/single` | Google Translate |
| `GET /api/health` | Healthcheck |

### Endpoints intencionalmente vulneráveis (exercício)
| Rota | Vulnerabilidade |
|---|---|
| `GET /api/proxy?url=` | SSRF (V4) |
| `GET /api/diagnostics/ping?host=` | Command Injection (V7) |
| `GET /api/files?name=` | Path Traversal (V8) |
| `GET /api/debug/config` | Exposição de segredos (V1/V6) |
| `GET /api/admin/secrets?token=` | Broken Auth (V5) |

---

## 🔗 Como o app usa este backend

No app (raiz do projeto), defina a variável de ambiente apontando para o backend:

```bash
# .env do app (Expo)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Com isso, os serviços do app (`src/services/*`) passam a chamar este proxy.
Sem a variável, o app chama as APIs externas diretamente (modo usado na build
de produção da web, já que o backend vulnerável não vai para a internet).

---

## 🧪 Conexão com a entrega de DevSecOps

Este backend é o "alvo" do módulo de Cibersegurança:

1. **Mapeamento de riscos** → tabela em `VULNERABILITIES.md`.
2. **Controles** → SCA (`npm audit`), secret scan (gitleaks), scan de imagem
   (Trivy), SAST (Semgrep/CodeQL), DAST.
3. **Implementação prática** → ex.: rodar `npm audit` / Trivy / gitleaks no CI.
4. **Simulação de pipeline** → o scan detecta a falha → o deploy é bloqueado →
   correção aplicada.
