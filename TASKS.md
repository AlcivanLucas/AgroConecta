# TASKS.md - AgroConecta

Lista completa de tarefas para construção da plataforma AgroConecta.

---

## Fase 1: Setup & Configuração

- [x] Criar estrutura de pastas do projeto (src/app, src/components, src/lib, src/types, src/utils)
- [x] Instalar dependências (firebase-admin, bcryptjs, jsonwebtoken, swr)
- [x] Configurar variáveis de ambiente (.env.local)
- [x] Configurar tema com cores AgroConecta (Verde Floresta #2D5A27, Bege #F5F5DC)
- [x] Atualizar layout.tsx com metadados e fontes
- [x] Configurar globals.css com tokens de design

---

## Fase 2: Firebase Admin SDK & Autenticação

- [x] Criar src/lib/firebase-admin.ts com inicialização do SDK
- [x] Criar collections references (users, announcements, serviceRequests, savedAnnouncements)
- [x] Criar src/lib/auth.ts com funções JWT (generateToken, verifyToken)
- [x] Implementar hashPassword e comparePassword com bcryptjs
- [x] Criar helpers de autenticação client-side (saveAuth, getAuth, clearAuth)

---

## Fase 3: API Routes - Autenticação

- [x] POST /api/auth/register - Criar novo usuário
- [x] POST /api/auth/login - Login com email/senha
- [x] GET /api/auth/me - Obter usuário autenticado

---

## Fase 4: API Routes - Anúncios

- [x] GET /api/announcements - Listar anúncios com filtros
- [x] POST /api/announcements - Criar novo anúncio
- [x] GET /api/announcements/:id - Obter detalhes do anúncio
- [x] PUT /api/announcements/:id - Atualizar anúncio
- [x] DELETE /api/announcements/:id - Excluir anúncio (soft delete)
- [x] POST /api/announcements/:id/save - Salvar/remover dos favoritos
- [x] GET /api/announcements/saved - Listar anúncios salvos
- [x] GET /api/announcements/my - Listar meus anúncios

---

## Fase 5: API Routes - Solicitações

- [x] POST /api/requests - Criar solicitação de serviço
- [x] GET /api/requests/received - Listar solicitações recebidas
- [x] GET /api/requests/sent - Listar solicitações enviadas
- [x] PUT /api/requests/:id/status - Atualizar status da solicitação

---

## Fase 6: API Routes - Usuários

- [x] PUT /api/users/me - Atualizar perfil do usuário

---

## Fase 7: UI Base

- [x] Criar tipos TypeScript (User, Announcement, ServiceRequest, etc.)
- [x] Criar validações com Zod (login, register, announcement, request)
- [x] Criar src/lib/api.ts com funções de chamada à API
- [x] Criar componente Navbar responsivo
- [x] Criar componente Footer institucional
- [x] Criar componente AnnouncementCard
- [x] Criar componente AnnouncementCardSkeleton
- [x] Criar AuthProvider context

---

## Fase 8: Páginas Principais

- [x] Landing Page (/) - Hero, estatísticas, categorias, perfis, CTA
- [x] Login (/login) - Formulário com validação
- [x] Cadastro (/cadastro) - Formulário em 3 etapas

---

## Fase 9: Páginas Marketplace & Anúncios

- [x] Marketplace (/marketplace) - Busca, filtros, grid de anúncios
- [x] Detalhe do Anúncio (/anuncio/[id]) - Galeria, detalhes, solicitação
- [x] Criar Anúncio (/anuncio/criar) - Formulário em 4 etapas

---

## Fase 10: Página Perfil

- [x] Perfil (/perfil) - Tabs com:
  - [x] Meus anúncios
  - [x] Anúncios salvos
  - [x] Solicitações recebidas
  - [x] Solicitações enviadas
  - [x] Editar perfil

---

## Fase 11: Fluxos Críticos

- [x] Estados de loading em todas as operações
- [x] Botões desabilitados durante operações
- [x] Mensagens de feedback com toast
- [x] Validação de formulários
- [x] Proteção de rotas autenticadas
- [x] Tratamento de erros

---

## Fase 12: Documentação

- [x] Criar TASKS.md (este arquivo)
- [ ] Criar seed.ts para dados de teste
- [ ] Criar README.md com instruções de uso
- [ ] Criar MANUAL_USUARIO.md
- [ ] Criar PLANO_TESTES.md

---

## Configuração Firebase (Manual)

Para configurar o Firebase, você precisa:

1. Criar um projeto no Firebase Console (https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Gerar uma chave de service account em Project Settings > Service Accounts
4. Configurar as variáveis de ambiente no .env.local:

```env
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@seu-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=agroconecta-super-secret-jwt-2026
```

5. Criar os índices no Firestore:
   - announcements: category + isActive + createdAt
   - announcements: city + isActive + createdAt
   - announcements: state + isActive + createdAt
   - serviceRequests: providerId + createdAt
   - serviceRequests: requesterId + createdAt

---

## Stack Utilizada

- **Framework:** Next.js 16 com App Router
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4.x
- **Componentes:** shadcn/ui
- **Banco de Dados:** Firebase Firestore
- **Autenticação:** JWT próprio + bcryptjs
- **Validação:** Zod
- **Notificações:** Sonner
