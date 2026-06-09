# 🔎 Checagem Automatizada de Segurança no Pipeline — Astra API

> **Implementação prática** da Global Solution (item 3 do enunciado):
> **"Criar uma checagem automatizada no pipeline (ex.: lint de segurança)."**

Uma checagem de segurança roda **automaticamente no GitHub Actions** a cada
`push`/`pull_request` e **bloqueia o deploy** quando encontra problemas no código
ou nas dependências.

---

## 🧰 Os dois controles de segurança

| # | Controle | Ferramenta | Detecta |
|---|----------|-----------|---------|
| 1 | **Lint de Segurança (SAST)** | ESLint + `eslint-plugin-security` e **Semgrep** | Command Injection (V7), Path Traversal (V8), timing attack (V5), SSRF, OWASP Top 10 |
| 2 | **Análise de Dependências (SCA)** | `npm audit` | CVEs conhecidas nas bibliotecas (V2) |

Ambos rodam no mesmo pipeline (`.github/workflows/security-lint.yml`) como **gate**.

---

## 📁 Arquivos

| Arquivo | Papel |
|---|---|
| [`../eslint.config.js`](../eslint.config.js) | Configuração do lint de segurança |
| [`../package.json`](../package.json) | Scripts `lint:security` (gate) e `lint:security:report` |
| [`../../.github/workflows/security-lint.yml`](../../.github/workflows/security-lint.yml) | Workflow do CI (jobs `eslint-security` e `semgrep-sast` + `npm audit`) |
| [`lint-security.sh`](./lint-security.sh) | Execução local dos 3 analisadores + evidências |
| `reports/01-eslint-security.txt` | Evidência do ESLint (achados + exit do gate) |
| `reports/02-semgrep.txt` | Evidência do Semgrep |
| `reports/03-npm-audit.txt` | Evidência do `npm audit` |
| `pipeline-diagram.png` | Diagrama do pipeline |

---

## ▶️ Como rodar

```bash
# local
cd API
npm install
npm run lint:security          # GATE: falha (exit 1) se houver achado de segurança
npm run lint:security:report   # só lista os achados, não falha

# script que roda os 3 analisadores e salva evidências
./security/lint-security.sh
```

No **CI** roda sozinho a cada push/PR.

---

## 📊 Resultado real (código vulnerável)

**Lint de segurança (ESLint) — gate bloqueou:**

```
API/routes/vulnerable.js
  39:3  warning  Found child_process.exec() with non Literal first argument   security/detect-child-process
  49:3  warning  Found readFile from "fs" with non literal argument at index 0 security/detect-non-literal-fs-filename
  64:3  warning  Potential timing attack, left side: true                      security/detect-possible-timing-attacks

✖ 3 problems  →  GATE exit code: 1  (DEPLOY BLOQUEADO)
```

| Achado | Arquivo:linha | Risco |
|---|---|---|
| `detect-child-process` | `vulnerable.js:39` | Command Injection (RCE) |
| `detect-non-literal-fs-filename` | `vulnerable.js:49` | Path Traversal |
| `detect-possible-timing-attacks` | `vulnerable.js:64` | Comparação de token insegura (Broken Auth) |

- **Semgrep**: confirma 2 findings bloqueantes (command injection + path traversal).
- **npm audit**: 12 vulnerabilidades (1 critical, 6 high) → `exit 1`.

---

## 🚦 Simulação (detectar → bloquear → corrigir → aprovar)

1. **Problema:** `exec()`/`fs` com entrada do usuário e dependências com CVEs.
2. **Controle detecta:** o lint (ESLint + Semgrep) e o `npm audit` acham os problemas.
3. **Ação:** `exit code 1` → o job do CI falha → **deploy bloqueado**.
4. **Correção:** na branch `main` os endpoints inseguros foram removidos e as
   dependências atualizadas → os checks **passam** → deploy **aprovado**.
