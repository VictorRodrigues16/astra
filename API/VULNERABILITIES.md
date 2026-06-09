# 🔓 Inventário de Vulnerabilidades — Astra API

> **Aviso:** este backend foi construído com falhas de segurança **intencionais**,
> como artefato educacional do módulo de **Cibersegurança / DevSecOps** (FIAP –
> Global Solution). O objetivo é que a equipe de segurança **identifique** estas
> falhas com as ferramentas do pipeline (SAST, DAST, scan de dependências, scan
> de segredos, scan de imagem) e as **corrija**.
>
> 🚫 **Nunca** publique este serviço na internet. Rode apenas local / Docker.

Cada item está mapeado para um **risco** da atividade, o **controle** que o
detecta e a **correção** esperada.

---

## V1 · Vazamento de Segredos
**Onde:** `config.js` (chave da NASA, `JWT_SECRET`, senha de banco hardcoded) e
`.env` **versionado** no Git. O servidor ainda **loga o segredo** no startup
(`server.js`) e o endpoint `GET /api/debug/config` devolve tudo.

| Campo | Valor |
|---|---|
| **Risco (PDF)** | Vazamento de segredos |
| **Tema** | Gestão de Segredos |
| **Detecção** | Secret scanning (GitHub Secret Scanning, **gitleaks**, trufflehog) |
| **Correção** | Mover segredos para variáveis de ambiente / cofre (Vault, AWS Secrets Manager, GitHub Secrets); adicionar `.env` ao `.gitignore`; **rotacionar** a chave exposta; remover o log do segredo e o endpoint de debug. |

---

## V2 · Dependências Inseguras
**Onde:** `package.json` fixa versões antigas com CVEs conhecidas:
`axios@0.21.1` (SSRF/ReDoS), `lodash@4.17.4` (prototype pollution),
`jsonwebtoken@8.5.1`, `express@4.17.1` (deps transitivas vulneráveis).

| | |
|---|---|
| **Risco (PDF)** | Dependências inseguras |
| **Tema** | Análise de Dependências (SCA) |
| **Detecção** | `npm audit`, **Dependabot**, **Snyk**, OWASP Dependency-Check |
| **Correção** | Atualizar para versões corrigidas (`npm audit fix`), fixar versões seguras e habilitar atualização automática. |

---

## V3 · Imagem de Contêiner Vulnerável
**Onde:** `Dockerfile` usa `node:14` (EOL, muitas CVEs de SO), roda como
**root**, copia o `.env` com segredos para dentro da imagem e usa `npm install`
(traz devDeps/vulneráveis).

| | |
|---|---|
| **Risco (PDF)** | Imagens de contêiner vulneráveis |
| **Tema** | Segurança em Contêineres |
| **Detecção** | **Trivy**, Grype, Docker Scout, scan de imagem no CI |
| **Correção** | Base atual e slim (`node:20-alpine`), `USER node` (não-root), `npm ci --omit=dev`, `.dockerignore` excluindo `.env`, multi-stage build, `HEALTHCHECK`. |

---

## V4 · SSRF (Server-Side Request Forgery)
**Onde:** `GET /api/proxy?url=` faz requisição para **qualquer** URL fornecida
pelo cliente, sem allowlist. Permite acessar serviços internos / metadados de
nuvem (ex.: `http://169.254.169.254/...`).

| | |
|---|---|
| **Risco (PDF)** | Permissões excessivas (acesso indevido) |
| **Tema** | Zero Trust / validação de entrada |
| **Detecção** | **DAST** (OWASP ZAP), revisão de código / SAST |
| **Correção** | Remover o proxy aberto; permitir apenas domínios de uma **allowlist**; bloquear IPs privados/loopback/metadata; validar o esquema (só https). |

---

## V5 · Excesso de Permissões / Ausência de Zero Trust
**Onde:** `server.js` — `cors()` liberando **qualquer origem**, **sem
autenticação**, **sem rate limiting**, **sem security headers** (helmet). O
endpoint `GET /api/admin/secrets` usa um **token estático** (`let-me-in`)
comparado em texto puro e aceito via query string.

| | |
|---|---|
| **Risco (PDF)** | Permissões excessivas em nuvem / acesso |
| **Tema** | Zero Trust (mínimo privilégio, autenticação forte) |
| **Detecção** | DAST, SAST, revisão de configuração |
| **Correção** | CORS restrito a origens conhecidas; autenticação real (JWT assinado com segredo forte do cofre); `express-rate-limit`; `helmet`; nunca aceitar token por query string. |

---

## V6 · Falta de Monitoramento / Exposição de Informação
**Onde:** `server.js` — só `morgan('dev')` no console, sem retenção/alertas;
**stack traces** completas retornadas ao cliente no handler de erro; segredo
impresso no log de startup; `GET /api/debug/config` expõe a config.

| | |
|---|---|
| **Risco (PDF)** | Falta de monitoramento |
| **Tema** | Monitoria e Auditoria Contínua |
| **Detecção** | Revisão de código / SAST; ausência de alertas no pipeline |
| **Correção** | Logging estruturado sem dados sensíveis, agregação + alertas (ex.: log de erro crítico), mensagens de erro genéricas para o cliente, remover endpoints de debug. |

---

## V7 · Command Injection
**Onde:** `GET /api/diagnostics/ping?host=` concatena a entrada do usuário em um
comando de shell (`exec("ping -c 1 " + host)`).

| | |
|---|---|
| **Risco (PDF)** | (bônus de código) Execução indevida |
| **Tema** | SAST / validação de entrada |
| **Detecção** | **SAST** (Semgrep, CodeQL), DAST |
| **Correção** | Não usar shell com entrada do usuário; validar `host`; usar APIs seguras (`execFile` com args, sem shell) ou bibliotecas dedicadas. |

---

## V8 · Path Traversal
**Onde:** `GET /api/files?name=` monta o caminho com a entrada do usuário sem
sanitizar (`path.join(dataDir, name)`), permitindo `../../etc/passwd`.

| | |
|---|---|
| **Risco (PDF)** | (bônus de código) Acesso indevido a arquivos |
| **Tema** | SAST / validação de entrada |
| **Detecção** | **SAST** (Semgrep, CodeQL), DAST |
| **Correção** | Normalizar e validar o caminho (`path.resolve` + verificação de prefixo), allowlist de arquivos, recusar `..`. |

---

## Resumo para a tabela "risco → impacto → controle" do PDF

| Vuln | Risco | Impacto | Controle sugerido |
|---|---|---|---|
| V1 | Vazamento de segredos | Acesso indevido a APIs/dados | Gestão de Segredos + secret scanning |
| V2 | Dependências inseguras | Exploração de CVEs | SCA (npm audit / Dependabot) |
| V3 | Imagem de contêiner vulnerável | Comprometimento do host/cluster | Scan de imagem (Trivy) |
| V4 | SSRF | Acesso a rede interna / metadados | Zero Trust + allowlist |
| V5 | Permissões excessivas | Acesso não autorizado | Zero Trust + autenticação + rate limit |
| V6 | Falta de monitoramento | Incidentes não detectados | Auditoria/monitoria contínua |
| V7 | Command injection | Execução remota de comandos | SAST + validação de entrada |
| V8 | Path traversal | Leitura de arquivos sensíveis | SAST + validação de entrada |
