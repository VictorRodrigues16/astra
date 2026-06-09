# 🛡️ Scan de Vulnerabilidades — Astra API (Módulo DevSecOps)

> **Implementação prática** da Global Solution (item 3 do enunciado):
> **"Configurar um scan de vulnerabilidades em dependências ou contêineres."**
> Aqui cobrimos **os dois** com uma única ferramenta: o **[Trivy](https://trivy.dev)**.

Este scan é executado contra o backend **intencionalmente vulnerável** descrito em
[`../VULNERABILITIES.md`](../VULNERABILITIES.md). O objetivo é o controle de
segurança **detectar** as falhas plantadas (V1, V2, V3).

---

## 📋 O que é escaneado

| # | Alvo | Comando Trivy | Detecta | Risco do PDF |
|---|------|---------------|---------|--------------|
| 1 | **Dependências** (`package-lock.json`) | `trivy fs --scanners vuln` | CVEs de libs npm (SCA) | **V2 – Dependências inseguras** |
| 2 | **Imagem Docker** (`node:14`) | `trivy image` | CVEs do SO + libs da imagem | **V3 – Imagem de contêiner vulnerável** |
| + | **Dockerfile** (IaC) | `trivy fs --scanners misconfig` | Erros de configuração (root, etc.) | **V3** (bônus) |
| + | **Segredos** | `trivy fs --scanners secret` | Chaves/tokens conhecidos | **V1** (bônus, ver ressalva) |

Tudo isso roda num **único script**: [`scan-trivy.sh`](./scan-trivy.sh).

---

## ▶️ Como rodar

**Pré-requisito:** Docker instalado e rodando. *Não precisa instalar o Trivy* — ele
roda pela imagem oficial `aquasec/trivy`.

```bash
cd API/security
./scan-trivy.sh
```

O script:
1. Garante que a imagem `astra-api:vuln` existe (builda se preciso).
2. Roda o scan de **dependências + segredos + misconfig** (filesystem).
3. Roda o scan da **imagem Docker**.
4. Salva os relatórios em [`reports/`](./reports).

**Parâmetros** (via variável de ambiente):

```bash
SEVERITY=MEDIUM,HIGH,CRITICAL ./scan-trivy.sh   # mostra também as MEDIUM
EXIT_CODE=1 ./scan-trivy.sh                      # modo GATE: falha o build (ver simulação)
IMAGE_NAME=outra-imagem:tag ./scan-trivy.sh      # escaneia outra imagem
```

---

## 📊 Resultados reais (limiar `HIGH,CRITICAL`)

### 1) Dependências + Dockerfile (`reports/01-deps-fs.txt`)

```
┌───────────────────┬────────────┬─────────────────┬─────────┬───────────────────┐
│      Target       │    Type    │ Vulnerabilities │ Secrets │ Misconfigurations │
├───────────────────┼────────────┼─────────────────┼─────────┼───────────────────┤
│ package-lock.json │    npm     │       22        │    -    │         -         │
│ Dockerfile        │ dockerfile │        -        │    -    │         1         │
└───────────────────┴────────────┴─────────────────┴─────────┴───────────────────┘
```

- **`package-lock.json`: 22 CVEs** (21 HIGH, 1 CRITICAL). Destaques:
  - `lodash@4.17.4` → **CVE-2019-10744 (CRITICAL)** — prototype pollution em `defaultsDeep`.
  - `axios@0.21.1` → 14 CVEs (SSRF `CVE-2025-27152`, ReDoS, prototype pollution → RCE).
  - `jsonwebtoken@8.5.1` → `CVE-2022-23539` (uso de chave insegura).
  - `express@4.17.1` → arrasta `body-parser`, `qs`, `path-to-regexp` vulneráveis.
- **`Dockerfile`: 1 misconfig HIGH** → `DS-0002`: *"Specify at least 1 USER command
  with non-root user"* — o contêiner roda como **root**.

### 2) Imagem Docker `node:14` (`reports/02-image.txt`)

```
│ astra-api:vuln (debian 10.13)  │ debian   │  562  │   (HIGH: 541, CRITICAL: 21)
│ camada de app (node-pkg)       │ node-pkg │   41  │   (HIGH: 39,  CRITICAL: 2)
```

- **562 CVEs de sistema operacional** (Debian 10 "buster", EOL) — glibc, openssl,
  curl, kernel headers, etc. Ex.: `CVE-2023-25775 (CRITICAL)`.
- Confirma na prática por que **não se usa imagem base EOL** (`node:14`).

> 💡 Rodando com `SEVERITY=MEDIUM,HIGH,CRITICAL`, os números sobem para **40** nas
> dependências e **1283** na imagem.

### ⚠️ Ressalva honesta sobre segredos (V1)

O scanner de **secret** do Trivy **não** flagrou os segredos hardcoded de
`config.js`/`.env` (chave da NASA, `JWT_SECRET`, `admin123`). Motivo: o Trivy usa
padrões de provedores conhecidos (AWS, GitHub, etc.) e essas strings são genéricas.
Para o risco **V1** a ferramenta correta é o **[gitleaks](https://github.com/gitleaks/gitleaks)**
ou o **GitHub Secret Scanning** (que usam entropia + regras próprias). Ou seja:
**cada risco tem o scanner certo** — este artefato cobre V2/V3; V1 fica para o secret scanning.

---

## 🚦 Simulação de pipeline — "scan bloqueando o deploy" (item 4 do PDF)

Por padrão o scan é **report-only** (`exit 0`): roda, reporta e **não** quebra o build.
Para simular o cenário *"política de segurança impedindo o deploy"*, rode em modo **gate**:

```bash
EXIT_CODE=1 ./scan-trivy.sh ; echo "exit=$?"
```

Resultado (ver [`reports/03-gate-demo.txt`](./reports/03-gate-demo.txt)):

```
>>> package-lock.json: Total: 22 (HIGH: 21, CRITICAL: 1)
>>> Exit code do processo de scan: 1   (!= 0  =>  build/deploy REJEITADO)
```

**Narrativa da simulação:**
1. **Problema:** dependências e imagem com CVEs HIGH/CRITICAL.
2. **Controle que detectou:** scan de vulnerabilidades (Trivy) no pipeline.
3. **Ação tomada:** Trivy retorna `exit code 1` → o passo de CI falha → **deploy bloqueado**
   até a correção (atualizar libs / trocar a imagem base).

---

## 🔧 Onde isso entra no pipeline CI/CD

```mermaid
flowchart LR
    A[Commit / Push] --> B[Build]
    B --> C{Scan de Vulnerabilidades<br/>Trivy: deps + imagem}
    C -->|HIGH/CRITICAL encontrado| D[/❌ Deploy BLOQUEADO/]
    C -->|limpo| E[Deploy]
    D --> F[Correção: atualizar libs<br/>trocar imagem base]
    F --> A
```

> Para um time real, o passo **C** vira um job de CI (ex.: GitHub Actions) com
> `EXIT_CODE=1`. Aqui ele é demonstrado localmente.

---

## 🩹 Correção esperada (resumo)

| Risco | Correção |
|-------|----------|
| **V2** (deps) | `npm audit fix`, fixar versões corrigidas (`lodash@^4.17.21`, `axios@^1.x`, `jsonwebtoken@^9`), habilitar **Dependabot**. |
| **V3** (imagem) | Trocar `node:14` → `node:20-alpine`; `USER node` (não-root); `npm ci --omit=dev`; `.dockerignore` excluindo `.env`; multi-stage build; `HEALTHCHECK`. |

Detalhes completos em [`../VULNERABILITIES.md`](../VULNERABILITIES.md).

---

## 📁 Arquivos desta pasta

| Arquivo | Descrição |
|---------|-----------|
| `scan-trivy.sh` | Script do scan (deps + imagem), via Docker. |
| `reports/01-deps-fs.txt` / `.json` | Relatório de dependências, segredos e misconfig. |
| `reports/02-image.txt` | Relatório da imagem Docker (CVEs de SO/libs). |
| `reports/03-gate-demo.txt` | Evidência da simulação de gate (exit code ≠ 0). |
| `.trivycache/` | Cache do banco de CVEs (não versionado). |
