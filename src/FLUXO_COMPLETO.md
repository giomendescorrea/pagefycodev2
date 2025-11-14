# Fluxo Completo do Pagefy

## 📱 Visão Geral
Pagefy é um aplicativo mobile de resenhas de livros com sistema de autenticação, três níveis de acesso (user, publisher, admin), feed social, sistema de follow/unfollow, e funcionalidades completas de interação com livros.

---

## 🏗️ Arquitetura do Sistema

### Camadas da Aplicação
```
┌─────────────────────────────────────┐
│         App.tsx (Main)              │
│  - Gerenciamento de estado global   │
│  - Roteamento entre views           │
│  - Orquestração de serviços         │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│     Components (UI Layer)           │
│  - Screens (Home, Search, etc)      │
│  - Forms (Login, Signup)            │
│  - Panels (Admin, Publisher)        │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│     Hooks (Business Logic)          │
│  - useAuth: autenticação            │
│  - useBooks: gerenciamento livros   │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│     Services (Data Layer)           │
│  - auth, books, reviews, etc        │
│  - Comunicação com Supabase         │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│         Supabase Backend            │
│  - Database (PostgreSQL)            │
│  - Auth (JWT)                       │
│  - Storage                          │
└─────────────────────────────────────┘
```

---

## 🔐 Fluxo de Autenticação

### 1. Cadastro de Leitor
```
Usuario acessa app
    ↓
LoginForm exibido
    ↓
Clica em "Criar Conta"
    ↓
SignupForm exibido
    ↓
Seleciona "Leitor"
    ↓
Preenche dados:
  - Nome
  - Data de Nascimento
  - E-mail
  - Senha
    ↓
handleSignup() chamado
    ↓
useAuth.signUp() executado
    ↓
Conta criada no Supabase Auth
    ↓
Perfil criado na tabela profiles
  - role: 'user'
  - is_pending_approval: false
    ↓
Auto-login
    ↓
Redirecionado para HomeScreen
    ↓
Notificação de boas-vindas criada
```

### 2. Cadastro de Publicador
```
Usuario acessa app
    ↓
LoginForm exibido
    ↓
Clica em "Criar Conta"
    ↓
SignupForm exibido
    ↓
Seleciona "Publicador"
    ↓
Preenche dados:
  - Nome
  - Nome da Empresa
  - CNPJ
  - E-mail Corporativo
  - Senha
    ↓
handleSignup() chamado
    ↓
useAuth.signUp() executado
    ↓
Conta criada no Supabase Auth
    ↓
Perfil criado na tabela profiles
  - role: 'user'
  - is_pending_approval: true
    ↓
Solicitação criada em publisher_requests
  - status: 'pending'
  - company_name
  - cnpj
    ↓
Auto-login bloqueado
    ↓
PendingApprovalScreen exibido
    ↓
Administrador recebe notificação
    ↓
[AGUARDANDO APROVAÇÃO]
```

### 3. Login
```
Usuario acessa app
    ↓
LoginForm exibido
    ↓
Preenche e-mail e senha
    ↓
handleLogin() chamado
    ↓
useAuth.signIn() executado
    ↓
Supabase valida credenciais
    ↓
Se válido:
  ↓
  Verifica is_pending_approval
    ↓
    Se true:
      → PendingApprovalScreen
    ↓
    Se false:
      → HomeScreen
      → loadUserData() executado
        - Carrega notificações
        - Carrega followers/following
        - Carrega posts do feed
        - Carrega livros do usuário
        - Carrega resenhas/notas/citações
```

---

## 👥 Tipos de Usuário e Permissões

### 1. Leitor (role: 'user')
**Permissões:**
- ✅ Visualizar biblioteca de livros
- ✅ Adicionar livros à estante pessoal
- ✅ Definir status de leitura (para ler, lendo, lido)
- ✅ Criar resenhas (apenas para livros "lido")
- ✅ Adicionar comentários em livros
- ✅ Adicionar citações de livros
- ✅ Comentar em resenhas de outros
- ✅ Seguir/deixar de seguir usuários
- ✅ Configurar perfil como público/privado
- ✅ Solicitar upgrade para publicador
- ❌ Acessar painel do publicador
- ❌ Acessar painel administrativo

### 2. Publicador (role: 'publisher')
**Permissões:**
- ✅ Todas as permissões de Leitor
- ✅ Acessar Painel do Publicador
- ✅ Adicionar novos livros à biblioteca
- ✅ Editar informações de livros
- ❌ Acessar painel administrativo

### 3. Administrador (role: 'admin')
**Permissões:**
- ✅ Todas as permissões de Publicador
- ✅ Acessar Painel Administrativo
- ✅ Aprovar/rejeitar solicitações de publicador
- ✅ Gerenciar usuários
- ✅ Visualizar estatísticas do sistema

---

## 📚 Fluxo de Interação com Livros

### 1. Buscar Livro
```
HomeScreen ou SearchScreen
    ↓
Usuario digita termo de busca
    ↓
booksService.searchBooks() chamado
    ↓
Resultados exibidos
    ↓
Usuario clica em livro
    ↓
handleBookSelect() chamado
    ↓
BookDetail carregado:
  - Informações do livro
  - Resenhas existentes
  - Comentários em livros
  - Citações
```

### 2. Adicionar Livro à Estante
```
BookDetail exibido
    ↓
Usuario clica em "Adicionar à Estante"
    ↓
Seleciona status:
  - Para Ler
  - Lendo
  - Lido
    ↓
handleAddToShelf() chamado
    ↓
booksService.addUserBook() executado
    ↓
Registro criado em user_books:
  - user_id
  - book_id
  - status
  - start_date (se "lendo")
  - finish_date (se "lido")
    ↓
Estado local atualizado
    ↓
Toast de confirmação exibido
```

### 3. Mudar Status de Leitura
```
ShelfScreen ou BookDetail
    ↓
Usuario seleciona novo status
    ↓
VALIDAÇÕES:
  - "para ler" → "lendo" ✅
  - "para ler" → "lido" ❌
  - "lendo" → "lido" ✅
  - "lendo" → "para ler" ✅
  - "lido" → qualquer ❌ (não pode reverter)
    ↓
Se válido:
  ↓
  booksService.updateUserBookStatus()
    ↓
    Atualiza user_books:
      - status
      - start_date (se mudou para "lendo")
      - finish_date (se mudou para "lido")
    ↓
    Estado local atualizado
```

---

## ✍️ Fluxo de Resenhas

### 1. Criar Resenha
```
BookDetail exibido
    ↓
Usuario clica em "Escrever Resenha"
    ↓
VALIDAÇÃO:
  - Verifica se livro está como "lido"
    ↓
    Se não: Toast de erro exibido
    ↓
    Se sim: Modal de resenha aberto
      ↓
      Usuario preenche:
        - Avaliação (1-5 estrelas)
        - Texto da resenha
      ↓
      handleAddReview() chamado
      ↓
      reviewsService.createReview() executado
      ↓
      Registro criado em reviews:
        - book_id
        - user_id
        - rating
        - text
        - created_at
      ↓
      Se usuário não é privado:
        ↓
        postsService.createPost() executado
        ↓
        Post criado no feed:
          - type: 'review'
          - content: texto da resenha
          - rating: avaliação
      ↓
      Estado local atualizado
      ↓
      Toast de confirmação
```

### 2. Editar Resenha
```
ShelfScreen ou BookDetail
    ↓
Usuario clica em "Editar" (própria resenha)
    ↓
Modal com dados atuais carregados
    ↓
Usuario modifica:
  - Rating
  - Texto
    ↓
handleEditReview() chamado
    ↓
reviewsService.updateReview() executado
    ↓
Resenha atualizada no banco
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

### 3. Deletar Resenha
```
ShelfScreen ou BookDetail
    ↓
Usuario clica em "Deletar" (própria resenha)
    ↓
Confirmação solicitada
    ↓
handleDeleteReview() chamado
    ↓
reviewsService.deleteReview() executado
    ↓
Resenha removida do banco
    ↓
Comentários associados removidos (cascade)
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

---

## 💬 Fluxo de Comentários

### 1. Comentar em Livro (Note)
```
BookDetail exibido
    ↓
Usuario clica em "Adicionar Comentário"
    ↓
Modal aberto
    ↓
Usuario digita comentário
    ↓
handleAddNote() chamado
    ↓
notesService.createNote() executado
    ↓
Comentário criado em notes:
  - book_id
  - user_id
  - text
  - is_public (baseado em configuração)
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

### 2. Comentar em Resenha
```
BookDetail > Resenha exibida
    ↓
Usuario clica em "Comentar"
    ↓
Campo de texto exibido
    ↓
Usuario digita comentário
    ↓
handleAddComment() chamado
    ↓
commentsService.createComment() executado
    ↓
Comentário criado em comments:
  - review_id
  - user_id
  - text
    ↓
Se autor da resenha != autor do comentário:
  ↓
  notificationsService.createNotification()
    ↓
    Notificação criada:
      - type: 'comment'
      - title: 'Novo comentário'
      - description: '[Nome] comentou na sua resenha'
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

### 3. Bug Atual - Edição de Comentários
**PROBLEMA IDENTIFICADO:**
```
ShelfScreen exibido
    ↓
Qualquer usuário pode clicar em "Editar"
    ↓
Modal aberto permitindo edição
    ↓
[BUG] Não há validação de propriedade
```

**CORREÇÃO NECESSÁRIA:**
```
Adicionar validação:
  if (note.user_id !== currentUser.id) {
    return; // Não mostrar botão de editar
  }
```

---

## 📖 Fluxo de Citações

### 1. Adicionar Citação
```
BookDetail exibido
    ↓
Usuario clica em "Adicionar Citação"
    ↓
Modal aberto
    ↓
Usuario preenche:
  - Texto da citação
  - Página (opcional)
  - Porcentagem (opcional)
    ↓
handleAddQuote() chamado
    ↓
quotesService.createQuote() executado
    ↓
Citação criada em quotes:
  - book_id
  - user_id
  - text
  - page
  - percentage
  - is_public
    ↓
Se usuário não é privado:
  ↓
  postsService.createPost() executado
  ↓
  Post criado no feed:
    - type: 'quote'
    - content: texto formatado
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

---

## 🏠 Fluxo do Feed (HomeScreen)

### 1. Carregar Feed
```
Usuario faz login
    ↓
loadUserData() executado
    ↓
postsService.getFeedPosts() chamado
    ↓
Query no Supabase:
  - Posts de usuários seguidos
  - Posts públicos do próprio usuário
  - Ordenados por created_at DESC
    ↓
Posts carregados incluem:
  - Resenhas
  - Citações
  - Informações do autor
  - Informações do livro
    ↓
Feed renderizado no HomeScreen
```

### 2. Interagir com Post
```
Feed exibido
    ↓
Usuario clica em:
  ↓
  [Livro]: handleBookSelect() → BookDetail
  ↓
  [Usuário]: setSelectedUser() → UserProfileView
  ↓
  [Curtir]: handleLike() → Notificação enviada
```

---

## 👤 Fluxo de Perfil e Seguir

### 1. Seguir Usuário
```
SearchScreen ou UserProfileView
    ↓
Usuario clica em "Seguir"
    ↓
handleFollow() chamado
    ↓
followsService.followUser() executado
    ↓
Registro criado em follows:
  - follower_id (quem segue)
  - followed_id (quem é seguido)
  - created_at
    ↓
notificationsService.createNotification()
  ↓
  Notificação enviada:
    - type: 'follow'
    - title: 'Novo seguidor'
    - description: '[Nome] começou a seguir você'
    ↓
Estado local atualizado:
  - followingList
  - followingCount
    ↓
Toast de confirmação
```

### 2. Deixar de Seguir
```
ProfileScreen ou UserProfileView
    ↓
Usuario clica em "Seguindo" (botão toggle)
    ↓
handleFollow() chamado
    ↓
followsService.unfollowUser() executado
    ↓
Registro removido de follows
    ↓
Estado local atualizado:
  - followingList
  - followingCount
    ↓
Toast de confirmação
```

### 3. Configurar Privacidade
```
ProfileScreen exibido
    ↓
Usuario clica em toggle "Perfil Privado"
    ↓
handleTogglePrivacy() chamado
    ↓
updateAuthProfile() executado
    ↓
Campo is_private atualizado em profiles
    ↓
Efeito:
  - Se privado: posts não aparecem no feed público
  - Se privado: resenhas/notas/citações não aparecem
    ↓
Toast de confirmação
```

---

## 🔔 Fluxo de Notificações

### 1. Receber Notificação
```
Evento ocorre:
  - Novo seguidor
  - Comentário em resenha
  - Curtida em post
    ↓
notificationsService.createNotification()
    ↓
Registro criado em notifications:
  - user_id (destinatário)
  - type
  - title
  - description
  - related_entity_id
  - is_read: false
    ↓
Se usuário está logado:
  ↓
  Polling a cada 30s (se admin)
  ↓
  Badge atualizado no sino
```

### 2. Visualizar Notificações
```
Usuario clica no sino (Bell icon)
    ↓
setShowNotifications(true)
    ↓
NotificationPanel exibido
    ↓
Lista de notificações renderizada:
  - Não lidas no topo
  - Lidas abaixo (opacidade reduzida)
    ↓
Usuario clica em notificação:
  ↓
  markNotificationAsRead() chamado
  ↓
  is_read atualizado para true
  ↓
  Badge atualizado
```

---

## 🛡️ Fluxo Administrativo

### 1. Aprovar Publicador
```
Admin faz login
    ↓
publisherRequests carregados
    ↓
Badge exibido no MenuScreen
    ↓
Admin clica em "Painel Administrativo"
    ↓
AdminPanel exibido
    ↓
Lista de solicitações pendentes
    ↓
Admin clica em "Aprovar"
    ↓
handleApprovePublisherRequest() chamado
    ↓
publisherRequestsService.approvePublisherRequest()
  ↓
  Atualiza publisher_requests:
    - status: 'approved'
    - reviewed_by: admin_id
    - reviewed_at: timestamp
  ↓
  Atualiza profiles:
    - role: 'publisher'
    - is_pending_approval: false
  ↓
  notificationsService.createNotification()
    ↓
    Notifica usuário aprovado
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

### 2. Rejeitar Publicador
```
AdminPanel exibido
    ↓
Admin clica em "Rejeitar"
    ↓
handleRejectPublisherRequest() chamado
    ↓
publisherRequestsService.rejectPublisherRequest()
  ↓
  Atualiza publisher_requests:
    - status: 'rejected'
    - reviewed_by: admin_id
    - reviewed_at: timestamp
  ↓
  Mantém profiles:
    - role: 'user'
    - is_pending_approval: false (permite novo login)
  ↓
  notificationsService.createNotification()
    ↓
    Notifica usuário rejeitado
    ↓
Estado local atualizado
    ↓
Toast de confirmação
```

---

## 📊 Fluxo do Painel do Publicador

### 1. Adicionar Novo Livro
```
Publicador clica em "Painel do Publicador"
    ↓
PublisherPanel exibido
    ↓
Clica em "Adicionar Livro"
    ↓
Modal de cadastro aberto
    ↓
Preenche dados:
  - Título
  - Autor
  - Descrição
  - Gênero
  - Ano de publicação
  - Capa (URL ou upload)
    ↓
booksService.createBook() chamado
    ↓
Livro adicionado à tabela books
    ↓
Disponível para todos os usuários
    ↓
Toast de confirmação
```

---

## 📱 Navegação da Aplicação

### Bottom Navigation (5 tabs)
```
┌─────────────────────────────────────┐
│                                     │
│         CONTEÚDO DA TELA            │
│                                     │
└─────────────────────────────────────┘
┌──────┬──────┬──────┬──────┬──────┐
│ Home │Busca │Perfil│Estan.│ Menu │
└──────┴──────┴──────┴──────┴──────┘
```

### Views Principais
1. **HomeScreen**
   - Feed de posts
   - Notificações (sino)
   - Logo do app

2. **SearchScreen**
   - Busca de livros
   - Busca de usuários
   - Tabs: Livros / Pessoas

3. **ShelfScreen**
   - Resenhas do usuário
   - Comentários do usuário
   - Citações do usuário
   - Tabs: Resenhas / Comentários / Citações

4. **ProfileScreen**
   - Informações do usuário
   - Estatísticas (seguidores/seguindo)
   - Configurações de privacidade
   - Editar perfil

5. **MenuScreen**
   - Painel Administrativo (se admin)
   - Painel do Publicador (se publisher/admin)
   - Solicitar ser Publicador (se user)
   - Ajuda e Suporte
   - Logout

### Views Secundárias
- **BookDetail**: Detalhes do livro + resenhas + comentários
- **UserProfileView**: Perfil de outro usuário
- **AdminPanel**: Gerenciamento de solicitações
- **PublisherPanel**: Gerenciamento de livros
- **PendingApprovalScreen**: Tela de aguardando aprovação

---

## 🗄️ Estrutura de Dados (Tabelas Supabase)

### profiles
```sql
- id (uuid, PK)
- name (text)
- email (text)
- bio (text, nullable)
- avatar_url (text, nullable)
- role (text: 'user' | 'publisher' | 'admin')
- is_private (boolean, default: false)
- is_pending_approval (boolean, default: false)
- created_at (timestamp)
```

### books
```sql
- id (uuid, PK)
- title (text)
- author (text)
- description (text, nullable)
- cover_url (text, nullable)
- genre (text, nullable)
- publication_year (int, nullable)
- created_at (timestamp)
- created_by (uuid, FK → profiles.id, nullable)
```

### user_books
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- book_id (uuid, FK → books.id)
- status (text: 'para ler' | 'lendo' | 'lido')
- start_date (timestamp, nullable)
- finish_date (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### reviews
```sql
- id (uuid, PK)
- book_id (uuid, FK → books.id)
- user_id (uuid, FK → profiles.id)
- rating (int, 1-5)
- text (text)
- is_public (boolean, computed from profile)
- created_at (timestamp)
```

### comments (comentários em resenhas)
```sql
- id (uuid, PK)
- review_id (uuid, FK → reviews.id)
- user_id (uuid, FK → profiles.id)
- text (text)
- created_at (timestamp)
```

### notes (comentários em livros)
```sql
- id (uuid, PK)
- book_id (uuid, FK → books.id)
- user_id (uuid, FK → profiles.id)
- text (text)
- is_public (boolean, computed from profile)
- created_at (timestamp)
```

### quotes
```sql
- id (uuid, PK)
- book_id (uuid, FK → books.id)
- user_id (uuid, FK → profiles.id)
- text (text)
- page (text, nullable)
- percentage (text, nullable)
- is_public (boolean, computed from profile)
- created_at (timestamp)
```

### follows
```sql
- id (uuid, PK)
- follower_id (uuid, FK → profiles.id)
- followed_id (uuid, FK → profiles.id)
- created_at (timestamp)
- UNIQUE(follower_id, followed_id)
```

### notifications
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- type (text: 'follow' | 'comment' | 'like' | 'review' | 'system')
- title (text)
- description (text)
- related_entity_id (uuid, nullable)
- is_read (boolean, default: false)
- created_at (timestamp)
```

### posts
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- type (text: 'review' | 'quote')
- book_id (uuid, FK → books.id)
- content (text)
- rating (int, nullable, para reviews)
- created_at (timestamp)
```

### publisher_requests
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- company_name (text)
- cnpj (text)
- reason (text, nullable)
- status (text: 'pending' | 'approved' | 'rejected')
- reviewed_by (uuid, FK → profiles.id, nullable)
- reviewed_at (timestamp, nullable)
- created_at (timestamp)
```

---

## 🔄 Fluxo de Estados Globais

### App.tsx - Estados Principais
```typescript
// Auth
- authUser (from useAuth)
- authLoading

// Navigation
- currentView: View
- navView: NavView
- selectedBook: Book | null
- selectedUser: string | null

// Data
- reviews: Review[]
- comments: Comment[]
- notes: Note[]
- quotes: Quote[]
- notifications: Notification[]
- posts: Post[]
- userBooks: { book_id, status }[]
- publisherRequests: PublisherRequest[]

// Social
- followersCount: number
- followingCount: number
- followersList: any[]
- followingList: any[]

// UI
- showNotifications: boolean
- requestsLoading: boolean
- isInitialized: boolean
```

---

## 🐛 Bugs Conhecidos e Melhorias Necessárias

### 1. Bug de Edição de Comentários
**Problema:** Qualquer usuário pode editar qualquer comentário na estante
**Localização:** ShelfScreen.tsx
**Correção:** Adicionar validação `note.user_id === currentUser.id`

### 2. Área de Organização (Parcialmente Implementada)
**Status:** Iniciado mas não finalizado
**Funcionalidades faltantes:**
- Filtros por status funcionais
- Busca por título/autor
- Ordenação customizada

### 3. Validação de Datas
**Status:** Implementado mas pode precisar de ajustes
**Verificar:**
- Transições de status
- Datas de início/término
- Validações de criação de resenha

---

## 🚀 Próximos Passos Sugeridos

1. **Corrigir bug de edição de comentários**
2. **Finalizar área de organização no ProfileScreen**
3. **Implementar sistema de likes/curtidas completo**
4. **Adicionar upload de imagens de perfil**
5. **Implementar busca avançada de livros**
6. **Adicionar filtros e ordenação na estante**
7. **Implementar estatísticas de leitura**
8. **Adicionar metas de leitura**
9. **Implementar sistema de notificações em tempo real**
10. **Adicionar testes automatizados**

---

## 📝 Convenções do Código

### Nomenclatura
- **Componentes:** PascalCase (ex: `BookDetail`)
- **Funções:** camelCase (ex: `handleAddReview`)
- **Serviços:** camelCase (ex: `createReview`)
- **Tipos:** PascalCase (ex: `User`, `Review`)

### Estrutura de Arquivos
```
/components - Componentes React
/hooks - Custom hooks
/services - Camada de dados
/utils - Utilitários e helpers
/styles - CSS global
```

### Padrões de Código
- Usar async/await para operações assíncronas
- Sempre fazer try/catch em operações de dados
- Exibir toast para feedback do usuário
- Validar dados antes de enviar ao backend
- Atualizar estado local após operações bem-sucedidas

---

## 🎯 Fluxo de Desenvolvimento

### Para adicionar nova funcionalidade:
1. **Criar serviço** em `/services` se necessário
2. **Criar componente** em `/components`
3. **Adicionar handler** no `App.tsx`
4. **Atualizar estado global** se necessário
5. **Adicionar validações**
6. **Adicionar feedback visual** (toast)
7. **Testar fluxo completo**

---

**Documento criado em:** 16 de Outubro de 2025
**Versão do App:** 1.0 (Beta)
**Última atualização:** 16/10/2025
