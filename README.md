# FlowPay Frontend

> Interface web moderna e em tempo real para monitoramento de filas operacionais, distribuição de carga de atendentes e análise de métricas de atendimento ao cliente da FlowPay.

---

## 📑 Índice (Table of Contents)

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Estrutura](#-arquitetura-e-estrutura)
- [Como Executar (Instalação)](#-como-executar-instalação)
  - [Pré-requisitos](#pré-requisitos)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Instalação e Execução Local](#instalação-e-execução-local)
- [Como Usar (Exemplos)](#-como-usar-exemplos)
  - [Fluxos da Aplicação](#fluxos-da-aplicação)
  - [Exemplos de Integração com o BFF](#exemplos-de-integração-com-o-bff)
- [Testes](#-testes)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 💡 Sobre o Projeto

O **FlowPay Frontend** é uma aplicação web desenvolvida para centralizar a operação e a gestão do atendimento ao cliente.

## 🛠️ Tecnologias Utilizadas

- **Core & Framework**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização & UI**: [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Ícones**: [Phosphor Icons](https://phosphoricons.com/), [Lucide Icons](https://lucide.dev/)
- **Gerenciamento de Estado & Data Fetching**: [SWR](https://swr.vercel.app/)
- **Formulários & Validação**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Testes Automatizados**: [Vitest](https://vitest.dev/), [Testing Library](https://testing-library.com/) (`@testing-library/react`, `@testing-library/jest-dom`), [jsdom](https://github.com/jsdom/jsdom)
- **Linter & Qualidade**: [ESLint](https://eslint.org/)

---

## 🏗️ Arquitetura e Estrutura

```plaintext
flowpay-frontend/
├── app/
│   ├── [team]/                  # Visão detalhada de squads (cartoes, emprestimos, outros)
│   ├── analytics/               # Módulos de analytics geral e por time
│   │   └── [team]/              # Analytics segmentado por time
│   ├── api/                     # Rotas de API (BFF - Backend for Frontend)
│   │   ├── analytics/           # Endpoints de métricas mensais e por squad
│   │   └── queues/              # Endpoints de status das filas, criação e finalização
│   ├── dashboard/               # Dashboard operacional geral
│   ├── hooks/                   # Custom hooks (useQueues, useAnalytics)
│   ├── types/                   # Tipagens TypeScript e DTOs da aplicação
│   ├── globals.css              # Variáveis de tema e design tokens Tailwind
│   └── layout.tsx               # Layout raiz da aplicação
├── components/
│   ├── analytics/               # Componentes visuais de gráficos e KPI Cards
│   ├── ui/                      # Componentes base reutilizáveis (Card, Button, Dialog, etc.)
│   ├── app-shell.tsx            # Estrutura de navegação, sidebar e header
│   └── new-ticket-drawer.tsx    # Drawer lateral de abertura de chamado
├── lib/
│   └── utils.ts                 # Utilitários globais (clsx, tailwind-merge)
└── vitest.config.mts            # Configuração da suíte de testes Vitest
```

---

## 🚀 Como Executar (Instalação)

### Pré-requisitos

Certifique-se de ter instalado em seu ambiente:
- **Node.js**: `v18.17.0` ou superior (recomendado: `Node.js LTS`)
- **npm**, **pnpm** ou **yarn**
- **FlowPay Backend API** (executando localmente ou em ambiente de desenvolvimento)

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com base no arquivo `.env.example`:

```bash
cp .env.example .env.local
```

Configuração necessária:

```env
# URL base do serviço de backend da FlowPay
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Instalação e Execução Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/CaputiDev/flowpay-frontend.git
   cd flowpay-frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testes

O projeto conta com uma suíte abrangente de testes unitários e de integração utilizando **Vitest** e **React Testing Library**, cobrindo páginas, componentes, custom hooks e rotas de API.

Para executar os testes:

```bash
# Executa os testes em modo watch interativo
npm run test

# Executa todos os testes uma única vez (indicado para CI/CD)
npm run test:ci

# Executa os testes e gera relatório de cobertura de código
npm run test:coverage
```

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, você encontrará os seguintes scripts:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js na porta `3000` |
| `npm run build` | Gera o build otimizado de produção da aplicação |
| `npm run start` | Inicia a aplicação a partir do build de produção |
| `npm run test` | Executa os testes unitários e de integração via Vitest |
| `npm run test:ci` | Executa a suíte de testes em modo contínuo / CI sem watch |
| `npm run test:coverage` | Executa os testes e gera a análise de cobertura |
| `npm run lint` | Executa o linter ESLint para validação de padrões de código |
