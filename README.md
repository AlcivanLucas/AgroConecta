# 🌱 AgroConecta

**Marketplace de serviços agrícolas** que conecta produtores rurais a prestadores de serviços do agronegócio em todo o Brasil.

---

## Sobre o Projeto

O AgroConecta resolve um problema real do campo: a dificuldade que produtores rurais têm para encontrar prestadores de serviço confiáveis — e a dificuldade que prestadores têm para divulgar seu trabalho. A plataforma funciona como um marketplace especializado, onde qualquer usuário pode anunciar serviços ou contratar, com sistema de negociação integrado via chat.

### Quem usa

| Perfil | O que faz |
|--------|-----------|
| **Produtor Rural** | Busca serviços, envia solicitações, negocia via chat |
| **Prestador de Serviço** | Cria anúncios, recebe solicitações, gerencia contratos |

Os dois perfis podem se comunicar livremente e trocar de papel conforme necessário.

---

## Funcionalidades

### Marketplace
- Listagem de anúncios com filtros por **categoria**, **estado** e **busca textual**
- 6 categorias: Mecanização Agrícola, Consultoria, Veterinária, Agronomia, Transporte e Manutenção
- Cobertura nacional — todos os 27 estados brasileiros
- Galeria de imagens por anúncio

### Anúncios
- Criação com título, descrição, preço, tipo de cobrança (hora / dia / serviço / hectare), localização e imagens
- Edição e exclusão pelo próprio dono
- Página detalhada com informações do anunciante

### Solicitações de Serviço
- Envio de proposta com mensagem personalizada diretamente no anúncio
- Fluxo de status: `Pendente → Aceita / Recusada → Concluída`
- Prestador pode aceitar, recusar ou concluir; produtor pode cancelar
- Histórico de enviadas e recebidas no perfil

### Sistema de Mensagens
- Chat em tempo real (polling a cada 4s) entre qualquer par de usuários
- Iniciado a partir de um anúncio ("Enviar Mensagem") ou de uma solicitação de serviço ("Chat")
- Agrupamento de mensagens por data
- Lista de conversas com prévia da última mensagem

### Perfil do Usuário
- Gerenciamento dos próprios anúncios
- Anúncios salvos / favoritos
- Solicitações recebidas e enviadas com ações rápidas
- Edição de dados pessoais

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5.7 |
| Estilização | Tailwind CSS v4 |
| Componentes UI | shadcn/ui + Radix UI |
| Banco de Dados | Firebase Firestore |
| Autenticação | JWT + bcryptjs |
| Validação | Zod |
| Formulários | React Hook Form |
| Ícones | Lucide React |

---

## Estrutura do Projeto

```
AgroConecta/
├── app/                          # Páginas e rotas da API (Next.js App Router)
│   ├── page.tsx                  # Home
│   ├── marketplace/page.tsx      # Listagem de anúncios
│   ├── anuncio/
│   │   ├── criar/page.tsx        # Criar anúncio
│   │   └── [id]/page.tsx         # Detalhe do anúncio
│   ├── mensagens/
│   │   ├── page.tsx              # Lista de conversas
│   │   └── [id]/page.tsx         # Chat
│   ├── perfil/page.tsx           # Perfil do usuário
│   ├── login/page.tsx
│   ├── cadastro/page.tsx
│   └── api/
│       ├── auth/                 # login, register, me
│       ├── announcements/        # CRUD + save + my + saved
│       ├── requests/             # CRUD + received + sent + status
│       ├── conversations/        # CRUD conversas
│       │   └── [id]/messages/    # CRUD mensagens
│       └── users/me/             # Atualizar perfil
│
├── src/
│   ├── components/
│   │   ├── layout/               # Navbar, Footer
│   │   ├── marketplace/          # AnnouncementCard
│   │   └── providers/            # AuthProvider
│   ├── lib/
│   │   ├── api.ts                # Cliente HTTP (todos os endpoints)
│   │   ├── auth.ts               # JWT + localStorage helpers
│   │   └── firebase-admin.ts     # Inicialização do Firebase Admin SDK
│   ├── types/index.ts            # Todos os tipos TypeScript
│   └── utils/validations.ts      # Schemas Zod + listas (estados, categorias)
│
└── components/ui/                # Componentes shadcn/ui
```

---

## Modelo de Dados (Firestore)

### `users`
```ts
{
  id, name, email, passwordHash,
  role: 'produtor' | 'prestador',
  farmName?, city, state, cnpj?, crea?,
  isVerified, avgRating, totalRatings, totalDeals,
  createdAt, updatedAt
}
```

### `announcements`
```ts
{
  id, title, description, price,
  chargeType: 'hora' | 'dia' | 'servico' | 'hectare',
  category: 'mecanizacao' | 'consultoria' | 'veterinaria' | 'agronomia' | 'transporte' | 'manutencao',
  city, state, imageUrls[], isActive,
  userId, userSnapshot,
  createdAt, updatedAt
}
```

### `serviceRequests`
```ts
{
  id, message,
  status: 'pendente' | 'aceita' | 'recusada' | 'cancelada' | 'concluida',
  requesterId, providerId, announcementId,
  requesterSnapshot, providerSnapshot, announcementSnapshot,
  createdAt, updatedAt
}
```

### `conversations`
```ts
{
  id,
  participantIds: [userId1, userId2],
  participants: { [userId]: { name, role, farmName? } },
  lastMessage, lastMessageAt,
  relatedAnnouncementId?, relatedAnnouncementTitle?,
  createdAt
}
```

### `messages`
```ts
{
  id, conversationId,
  senderId, senderName,
  text, createdAt
}
```

### `savedAnnouncements`
```ts
{ id, userId, announcementId, createdAt }
```

---

## API Reference

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Fazer login |
| GET | `/api/auth/me` | Dados do usuário autenticado |

### Anúncios
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/announcements` | — | Listar anúncios (filtros: category, state, city, search) |
| POST | `/api/announcements` | ✓ | Criar anúncio |
| GET | `/api/announcements/my` | ✓ | Meus anúncios |
| GET | `/api/announcements/saved` | ✓ | Anúncios salvos |
| GET | `/api/announcements/:id` | — | Detalhe do anúncio |
| PUT | `/api/announcements/:id` | ✓ | Editar anúncio |
| DELETE | `/api/announcements/:id` | ✓ | Excluir anúncio |
| POST | `/api/announcements/:id/save` | ✓ | Salvar / dessalvar anúncio |

### Solicitações
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/api/requests` | ✓ | Criar solicitação |
| GET | `/api/requests/received` | ✓ | Solicitações recebidas |
| GET | `/api/requests/sent` | ✓ | Solicitações enviadas |
| PUT | `/api/requests/:id/status` | ✓ | Atualizar status |

### Mensagens
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/conversations` | ✓ | Listar conversas |
| POST | `/api/conversations` | ✓ | Criar ou recuperar conversa |
| GET | `/api/conversations/:id/messages` | ✓ | Buscar mensagens |
| POST | `/api/conversations/:id/messages` | ✓ | Enviar mensagem |

### Usuário
| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| PUT | `/api/users/me` | ✓ | Atualizar perfil |

---

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta no [Firebase](https://firebase.google.com/) com projeto criado
- Firestore habilitado no projeto Firebase

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd AgroConecta
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=uma-chave-secreta-forte-aqui
```

> **Como obter as credenciais do Firebase:**
> 1. Acesse o [Console Firebase](https://console.firebase.google.com/)
> 2. Vá em **Configurações do projeto → Contas de serviço**
> 3. Clique em **Gerar nova chave privada**
> 4. Copie `project_id`, `client_email` e `private_key` do JSON gerado

### 3. Iniciar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 4. Build para produção

```bash
npm run build
npm start
```

---

## Deploy

O projeto está pronto para deploy na **Vercel**:

1. Importe o repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no painel da Vercel
3. Deploy automático a cada push na branch `main`

> **Atenção com `FIREBASE_PRIVATE_KEY`:** na Vercel, cole o valor com as quebras de linha literais `\n` — não use aspas extras.

---

## Observação sobre Índices do Firestore

O arquivo `firestore.indexes.json` contém os índices compostos necessários para as queries de produção. Para implantá-los quando o volume de dados crescer:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:indexes
```

As queries atuais funcionam sem os índices implantados (filtragem em memória), mas para melhor performance em produção com grande volume de dados, recomenda-se fazer o deploy dos índices.

---

## Licença

Distribuído sob a licença MIT.
