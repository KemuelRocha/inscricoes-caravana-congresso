# Inscrições — Caravana Congresso de Jovens em Recife

Sistema de inscrições para a caravana de jovens ao Congresso de Jovens em Recife (3, 4 e 5 de julho), realizado pela Supervisão das Campanhas.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Firebase Firestore** (banco de dados em tempo real)
- **Firebase Authentication** (anônima, para regras de segurança)
- **Tailwind CSS** (estilização mobile-first)
- **Deploy**: Vercel

---

## Setup

### 1. Clone o projeto e instale as dependências

```bash
cd inscricoes-caravana-congresso
npm install
```

### 2. Crie um projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative o **Firestore Database** (modo produção)
4. Ative o **Authentication** → Provedores de login → **Anônimo**
5. Nas configurações do projeto, clique em **Adicionar app** (Web) e copie as credenciais

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Preencha os valores em `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

ADMIN_PASSWORD=senha_segura_aqui

# Service Account (para API Routes server-side)
# Firebase Console → Configurações → Contas de serviço → Gerar nova chave privada
# Cole o JSON completo em uma única linha:
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### 4. Configure as regras do Firestore

No console Firebase, acesse **Firestore → Regras** e cole o conteúdo de `firestore.rules`.

### 5. Inicialize o documento de controle de vagas

No console Firebase, acesse **Firestore → Dados** e crie manualmente:

- Coleção: `config`
- Documento: `vagas`
- Campos:
  ```json
  {
    "masculinoConfirmados": 0,
    "femininoConfirmados": 0,
    "masculinoEspera": 0,
    "femininoEspera": 0
  }
  ```

### 6. Rode localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Deploy no Vercel

1. Faça push do projeto para um repositório GitHub
2. Importe o repositório no [vercel.com](https://vercel.com)
3. Configure todas as variáveis de ambiente no painel da Vercel
4. Faça o deploy — automático após cada push na `main`

> ⚠️ **Atenção**: A variável `FIREBASE_SERVICE_ACCOUNT_JSON` deve ter o JSON do service account em **uma única linha** (sem quebras de linha).

---

## Estrutura do projeto

```
/app
  /page.tsx              → Landing com contador e CTA
  /inscricao/page.tsx    → Formulário de inscrição
  /confirmacao/page.tsx  → Tela de confirmação/espera
  /admin/page.tsx        → Painel administrativo
  /api/inscricao/route.ts → API: processar inscrição (transação Firestore)
  /api/admin/route.ts    → API: listar, cancelar, exportar CSV

/lib
  /firebase.ts           → Firebase client (Firestore + Auth)
  /firebase-admin.ts     → Firebase Admin SDK (server-side)
  /validacoes.ts         → Cálculo de idade, máscara WhatsApp, validações
  /inscricoes.ts         → onSnapshot para contador em tempo real

/components
  /ContadorVagas.tsx     → Contador de vagas em tempo real (client component)
  /FormularioInscricao.tsx → Formulário com validações e máscara
  /StatusBadge.tsx       → Badge de status (confirmado/espera)
```

---

## Regras de negócio

- **50 vagas totais**: 25 masculinas + 25 femininas
- Inscrições acima do limite → lista de espera com posição numerada
- **Idade mínima**: 18 anos completos até 03/07 do ano atual
- Validação de idade no cliente (UX) e no servidor (segurança)
- Transações Firestore para evitar race condition nas contagens
- Painel admin protegido por senha (variável `ADMIN_PASSWORD`)
- Cancelamento de inscrição promove automaticamente o próximo da fila

---

## Painel Administrativo

Acesse `/admin` com a senha configurada em `ADMIN_PASSWORD`.

Funcionalidades:
- Visualizar inscrições por gênero (confirmadas e em espera)
- Exportar todas as inscrições em CSV
- Cancelar inscrição (promove automaticamente o próximo da lista de espera)
