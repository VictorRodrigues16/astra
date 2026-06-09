<div align="center">

<img src="./assets/readme/banner.png" alt="Astra" width="100%" />

# 🛰️ Astra

### Centro de Monitoramento Orbital da Terra

**Tecnologia espacial a serviço da Terra.** Um app mobile que combina dados de satélites e telescópios da NASA com sensoriamento climático para monitorar, em tempo real, a Terra e o espaço próximo.

![React Native](https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react&logoColor=white)
![Expo SDK 55](https://img.shields.io/badge/Expo_SDK-55-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Plataformas](https://img.shields.io/badge/Plataformas-Android_·_iOS_·_Web-22D3EE)

</div>

---

## 🌎 Sobre o projeto

A **Astra** é um aplicativo mobile desenvolvido em **React Native + Expo + TypeScript** para a disciplina de Mobile (Global Solution). A proposta demonstra como tecnologias da **indústria espacial** podem gerar impacto positivo na Terra.

O app funciona como um **centro de comando**: reúne, em uma experiência fluida e moderna, indicadores em tempo real do clima local, a posição orbital da Estação Espacial Internacional (ISS), o catálogo de asteroides que se aproximam do nosso planeta e a imagem astronômica do dia da NASA.

### 🛰️ Relação com a indústria espacial

A Astra toca diretamente vários temas da economia espacial:

| Tema | Como aparece no app |
|---|---|
| **Satélites e monitoramento orbital** | Rastreamento ao vivo da ISS (latitude, longitude, altitude, velocidade) |
| **Sensoriamento remoto / análise climática** | Clima local por geolocalização e previsão de 7 dias |
| **Infraestrutura espacial** | Catálogo de objetos próximos à Terra (NASA NeoWs) com classificação de risco |
| **Comunicação global** | Consumo de múltiplas APIs públicas espaciais e climáticas |
| **Sustentabilidade** | Dados que apoiam a conscientização sobre o clima e o monitoramento planetário |

### 🌱 ODS da ONU contempladas

- **ODS 9** · Indústria, inovação e infraestrutura
- **ODS 11** · Cidades e comunidades sustentáveis
- **ODS 13** · Ação contra a mudança global do clima

---

## 📱 Funcionalidades

### 🏠 Início (Centro de Comando)
- Dashboard com **indicadores em tempo real**: temperatura local, velocidade da ISS, total de asteroides e quantos oferecem risco potencial.
- **Imagem astronômica do dia** (NASA APOD) com descrição expansível e botão de favoritar.
- **Telemetria ao vivo da ISS** com indicador pulsante de "AO VIVO".
- **Clima local** com gráfico das máximas dos próximos 7 dias.
- **Próximas aproximações** de asteroides com atalho para a listagem completa.
- **Pull to refresh** para atualizar todos os dados.

### 🔭 Explorar (Listagem)
- **Listagem** dos asteroides próximos à Terra (NASA NeoWs) com `FlatList`.
- **Busca** por nome (com debounce e sem sensibilidade a acentos).
- **Filtros**: todos, risco potencial, seguros.
- **Ordenação**: por data, proximidade, tamanho ou velocidade.
- Tela de **detalhe** com dados orbitais completos, classificação de risco, comparação visual de tamanho e link para a página oficial no NASA JPL.

### ⭐ Favoritos
- **Salvar localmente** asteroides e imagens do dia (persistência com AsyncStorage).
- **Histórico recente** dos asteroides visualizados.
- **Gerenciamento**: remover itens individualmente ou limpar tudo.

### ⚙️ Configurações
- **Dark mode** (claro, escuro ou automático pelo sistema).
- **Personalização visual**: 5 cores de destaque (accent) que mudam o app inteiro.
- Unidade de temperatura (°C / °F) e opção de **reduzir animações** (acessibilidade).
- Reduzir animações (acessibilidade).
- Informações do projeto, ODS, fontes de dados e integrantes.

---

## 🧠 Tecnologias e conceitos aplicados

| Área | Implementação |
|---|---|
| **Mobile** | React Native, Expo SDK 55, TypeScript (modo `strict`) |
| **Navegação** | React Navigation 7 (Native Stack + Bottom Tabs), rotas **tipadas** |
| **Estado global** | Context API (`Settings`, `Theme`, `Favorites`) + **custom hooks** |
| **Persistência** | AsyncStorage (preferências, favoritos, histórico e cache de API) |
| **Consumo de API** | Axios com **camada de serviço** dedicada, **interceptors** e tratamento de erros |
| **UI/UX** | Design system próprio, dark/light mode, responsividade, **animações** e microinterações |
| **TypeScript** | Interfaces, types, **generics** (`useAsync<T>`, `ServiceResult<T>`) e união discriminada |

---

## 🧱 Arquitetura

Organização por responsabilidade, com barris (`index.ts`) em cada camada para imports limpos:

```txt
Astra/
├── App.tsx                  # Providers + container de navegação
├── index.ts                 # Registro do root component
├── app.json                 # Configuração Expo (ícone, splash, plugins)
└── src/
    ├── components/           # UI reutilizável
    │   ├── ui/               #   design system (Text, Card, Button, Badge...)
    │   ├── charts/           #   BarChart animado (sem libs externas)
    │   ├── home/             #   ApodHero, IssCard, WeatherCard
    │   └── asteroids/        #   AsteroidCard, SearchSortBar
    ├── screens/              # Telas (Home, Explore, Detail, Favorites, Settings)
    ├── navigation/           # Stack + Tabs + tipos + tema de navegação
    ├── services/             # Camada de API (Axios, interceptors, cache)
    ├── hooks/                # Custom hooks (useAsync, useApod, useIss...)
    ├── contexts/             # Context API (Settings, Theme, Favorites)
    ├── storage/              # Wrapper tipado do AsyncStorage + cache TTL
    ├── types/                # Modelos de domínio e tipos das APIs
    ├── theme/                # Tokens de cor, espaçamento e tipografia
    └── utils/                # Funções puras (formatação, datas, filtros)
```

### Camada de serviço e cache offline

Cada serviço normaliza a resposta "crua" da API em um **modelo de domínio** limpo. Um cache com **TTL** (estratégia *stale-while-error*) guarda as respostas no AsyncStorage:

1. Se há cache **fresco**, evita a requisição (poupa o limite da NASA).
2. Se a rede **falha**, devolve o cache (mesmo vencido), mantendo o app útil **offline** ou sob *rate limit*.

---

## 🌍 APIs consumidas

| API | Uso | Chave |
|---|---|---|
| [NASA APOD](https://api.nasa.gov/) | Imagem astronômica do dia | `constants.ts` |
| [NASA NeoWs](https://api.nasa.gov/) | Asteroides próximos à Terra | `constants.ts` |
| [Open-Meteo](https://open-meteo.com/) | Clima atual e previsão | Não precisa |
| [wheretheiss.at](https://wheretheiss.at/) | Posição da ISS em tempo real | Não precisa |
| [BigDataCloud](https://www.bigdatacloud.com/) | Geocodificação reversa (cidade) | Não precisa |

> 💡 A chave da NASA fica em `src/constants.ts` (`NASA_API_KEY`). Por padrão vem `DEMO_KEY` (limitada a ~30 req/h); para uso intenso, gere uma chave gratuita em [api.nasa.gov](https://api.nasa.gov/) e substitua o valor da constante.

---

## 🚀 Como executar

### Pré-requisitos
- **Node.js 18+**
- **npm** (ou yarn)
- App **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) para testar no dispositivo

### Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd Astra

# 2. Instale as dependências
npm install

# 3. Inicie o projeto
npx expo start
```

### Rodando em cada plataforma

Com o Metro aberto, pressione a tecla correspondente (ou use os scripts):

```bash
npm run android   # Android (emulador ou dispositivo)
npm run ios       # iOS (simulador ou dispositivo)
npm run web       # Navegador
```

- **Android / iOS**: escaneie o QR Code com o app **Expo Go**.
- **Web**: abre automaticamente em `http://localhost:8081`.

### Verificação de qualidade

```bash
npm run typecheck   # checagem de tipos (tsc --noEmit) — sem erros
npx expo-doctor     # diagnóstico do projeto — 19/19 checks
```

---

## 📸 Capturas de tela

> As capturas devem ser adicionadas em `assets/readme/` (ex.: `home.png`, `explore.png`, `detail.png`, `favorites.png`, `settings.png`) e referenciadas abaixo. Rode o app com `npx expo start --web` ou no Expo Go e capture as telas.

| Início | Explorar | Detalhe |
|:---:|:---:|:---:|
| _home.png_ | _explore.png_ | _detail.png_ |

| Favoritos | Configurações | Tema claro |
|:---:|:---:|:---:|
| _favorites.png_ | _settings.png_ | _light.png_ |

---

## ✨ Diferenciais técnicos

- **Gráficos animados** construídos do zero com a API `Animated` (sem dependências de chart), 100% compatíveis com Web/iOS/Android.
- **Monitoramento em tempo real** da ISS com *polling* inteligente (pausa em segundo plano para poupar bateria).
- **Cache offline** com TTL: o app continua funcionando sem internet e contorna o *rate limit* da NASA.
- **Design system completo** com tema claro/escuro e **cor de destaque personalizável**.
- **Geolocalização** com fallback automático (o app nunca quebra se a permissão for negada).
- **Skeleton loading**, *fade-in*, microanimações, **feedback tátil** (haptics) e *pull to refresh*.
- **Navegação 100% tipada** e camada de serviço com **interceptors** e erros tratados em pt-BR.

---

## 👥 Equipe

> Integrantes do grupo (também exibidos na tela de Configurações do app).

| Nome | RM |
|---|---|
| Erick Molina | RM 553852 |
| Felipe Castro Salazar | RM 553464 |
| Marcelo Vieira de Melo | RM 552953 |
| Rayara Amaro Figueiredo | RM 552635 |
| Victor Rodrigues | RM 554158 |

---

## 📚 Referências

- [NASA Open APIs](https://api.nasa.gov/)
- [NASA](https://www.nasa.gov/) · [ESA](https://www.esa.int/)
- [Open-Meteo](https://open-meteo.com/)
- [Documentação Expo](https://docs.expo.dev/) · [React Navigation](https://reactnavigation.org/)

<div align="center">

Feito com 🛰️ para a Global Solution · **Astra** v1.0.0

</div>
