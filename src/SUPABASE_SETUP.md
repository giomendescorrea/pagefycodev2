# Pagefy - Setup do Supabase

Este documento explica como o aplicativo Pagefy está integrado com o Supabase e as funcionalidades disponíveis.

## Arquitetura

O Pagefy agora usa Supabase para:
- **Autenticação de usuários** (signup/login/logout)
- **Banco de dados PostgreSQL** para persistência de dados
- **Edge Functions** para operações do servidor

## Estrutura do Banco de Dados

O schema do banco de dados inclui as seguintes tabelas:

### profiles
Armazena informações dos usuários
- `id` (UUID, PK)
- `name` (Text)
- `email` (Text, Unique)
- `bio` (Text, Optional)
- `avatar_url` (Text, Optional)
- `role` ('user' | 'publisher' | 'admin')
- `is_private` (Boolean)
- `is_locked` (Boolean) - Conta bloqueada por tentativas de login falhas
- `failed_login_attempts` (Integer) - Contador de tentativas de login falhas
- `locked_at` (Timestamp, Optional) - Data/hora do bloqueio

### books
Catálogo de livros
- `id` (UUID, PK)
- `title` (Text)
- `author` (Text)
- `cover_url` (Text, Optional)
- `description` (Text, Optional)
- `genre` (Text, Optional)
- `publication_year` (Integer, Optional)
- `publisher_id` (UUID, FK -> profiles)
- `status` ('published' | 'draft')
- `views_count` (Integer)

### reviews
Resenhas dos usuários sobre livros
- `id` (UUID, PK)
- `book_id` (UUID, FK -> books)
- `user_id` (UUID, FK -> profiles)
- `rating` (Integer, 1-5)
- `text` (Text)
- `likes_count` (Integer)

### notes
Comentários privados dos usuários
- `id` (UUID, PK)
- `book_id` (UUID, FK -> books)
- `user_id` (UUID, FK -> profiles)
- `text` (Text)

### quotes
Citações marcadas pelos usuários
- `id` (UUID, PK)
- `book_id` (UUID, FK -> books)
- `user_id` (UUID, FK -> profiles)
- `text` (Text)
- `page` (Text, Optional)
- `percentage` (Text, Optional)

### comments
Comentários em resenhas
- `id` (UUID, PK)
- `review_id` (UUID, FK -> reviews)
- `user_id` (UUID, FK -> profiles)
- `text` (Text)

### follows
Relacionamentos de seguir entre usuários
- `id` (UUID, PK)
- `follower_id` (UUID, FK -> profiles)
- `following_id` (UUID, FK -> profiles)

### notifications
Notificações para usuários
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles)
- `type` ('like' | 'comment' | 'follow' | 'review' | 'system')
- `title` (Text)
- `description` (Text)
- `related_entity_id` (UUID, Optional)
- `is_read` (Boolean)

### publisher_requests
Solicitações para se tornar publicador
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles)
- `reason` (Text)
- `status` ('pending' | 'approved' | 'rejected')
- `reviewed_by` (UUID, FK -> profiles, Optional)
- `reviewed_at` (Timestamp, Optional)

### user_books
Relacionamento entre usuários e livros (estante)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles)
- `book_id` (UUID, FK -> books)
- `status` ('lido' | 'lendo' | 'quer-ler' | 'abandonado')

### posts
Feed de posts (reviews e quotes públicos)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles)
- `type` ('review' | 'quote')
- `book_id` (UUID, FK -> books)
- `content` (Text)
- `rating` (Integer, Optional, 1-5)
- `likes_count` (Integer)
- `comments_count` (Integer)

### likes
Curtidas em posts
- `id` (UUID, PK)
- `user_id` (UUID, FK -> profiles)
- `post_id` (UUID, FK -> posts)

## Funcionalidades Implementadas

### ✅ Autenticação
- Signup com criação automática de perfil
- Login com email e senha
- Logout
- Sessões persistentes
- Confirmação automática de email (para ambiente de desenvolvimento)
- **Bloqueio de conta após 5 tentativas de login sem sucesso**
- **Notificação por email quando conta é bloqueada**
- **Administrador pode desbloquear contas bloqueadas**

### ✅ Gerenciamento de Livros
- Listagem de livros publicados
- Busca por título ou autor
- Filtros por gênero e período
- Visualização de detalhes
- Contador de visualizações

### ✅ Resenhas
- Criar resenhas com rating (1-5 estrelas) e texto
- Editar suas próprias resenhas
- Excluir suas próprias resenhas
- Visualizar resenhas de outros usuários
- Contador de likes

### ✅ Comentários e Anotações
- Adicionar comentários privados em livros (notes)
- Adicionar citações com página/porcentagem (quotes)
- Editar e excluir suas próprias anotações
- Comentar em resenhas de outros usuários

### ✅ Sistema de Seguir
- Seguir/deixar de seguir outros usuários
- Ver lista de seguidores
- Ver lista de pessoas que você segue
- Contadores de seguidores/seguindo

### ✅ Notificações
- Notificações de novos seguidores
- Notificações de comentários em suas resenhas
- Notificações de curtidas
- Notificações do sistema
- Marcar como lida
- Marcar todas como lidas

### ✅ Sistema de Roles
- **User**: Usuário padrão, pode ler livros e criar resenhas
- **Publisher**: Pode adicionar novos livros ao catálogo
- **Admin**: Acesso ao painel administrativo

### ✅ Solicitações de Publicador
- Usuários podem solicitar se tornar publishers
- Admins podem aprovar/rejeitar solicitações
- Notificações automáticas para aprovação/rejeição
- **Email de aprovação enviado ao usuário quando perfil de publicador é aprovado**
- **Email de rejeição enviado quando solicitação é rejeitada**

### ✅ Privacidade
- Configuração de perfil privado/público
- Controle de visibilidade de comentários e resenhas

### ✅ Estante Pessoal
- Ver suas resenhas
- Ver suas anotações (notes)
- Ver suas citações (quotes)
- Editar/excluir qualquer conteúdo da estante

## Como Usar

### Primeiro Acesso

1. **Criar uma Conta**
   - Clique em "Criar Conta"
   - Preencha nome, email e senha
   - Sua conta será criada automaticamente como 'user'

2. **Explorar Livros**
   - Na tela inicial (Home), veja posts de outros usuários
   - Use a aba "Busca" para procurar livros específicos
   - Clique em um livro para ver detalhes e resenhas

3. **Adicionar Resenhas**
   - Na página de detalhes do livro
   - Clique em "Adicionar Resenha"
   - Dê uma nota de 1-5 estrelas e escreva sua opinião

4. **Fazer Anotações**
   - Na página do livro, vá na aba "Anotações"
   - Adicione comentários privados ou citações com localização (página/porcentagem)

5. **Seguir Usuários**
   - Na aba "Busca", procure por pessoas
   - Clique em "Seguir" para começar a acompanhar
   - Veja seus seguidores no seu perfil

### Contas de Teste

Para testar diferentes roles, você pode criar contas com emails específicos:
- `admin@pagina42.com` - Será criado como admin (se implementado no backend)
- `publisher@pagina42.com` - Será criado como publisher
- Qualquer outro email - Será criado como user

**Nota**: Por padrão, todos são criados como 'user'. Para se tornar publisher, envie uma solicitação pelo Menu.

## Dados Iniciais

O aplicativo inclui um seed automático com 8 livros clássicos:
- 1984 (George Orwell)
- O Pequeno Príncipe (Antoine de Saint-Exupéry)
- Dom Casmurro (Machado de Assis)
- Harry Potter e a Pedra Filosofal (J.K. Rowling)
- O Senhor dos Anéis (J.R.R. Tolkien)
- Cem Anos de Solidão (Gabriel García Márquez)
- O Hobbit (J.R.R. Tolkien)
- A Revolução dos Bichos (George Orwell)

Estes livros são inseridos automaticamente na primeira vez que o app é carregado.

## Próximos Passos

### Melhorias Futuras
- [ ] Feed de atividades de usuários seguidos
- [ ] Sistema de likes em posts
- [ ] Comentários em posts do feed
- [ ] Busca de usuários no backend
- [ ] Upload de avatar
- [ ] Upload de capas de livros personalizadas
- [ ] Estatísticas de leitura
- [ ] Metas de leitura
- [ ] Listas de livros customizadas
- [ ] Recomendações baseadas em gostos

### Segurança (Row Level Security)
Atualmente o app usa Supabase com políticas básicas. Para produção, você deve:
- Implementar RLS (Row Level Security) para todas as tabelas
- Configurar políticas de acesso apropriadas
- Habilitar autenticação de email real
- Configurar limites de rate limiting
- Adicionar validação de dados no backend

## Estrutura de Arquivos

```
/services/
  auth.ts              - Autenticação e gerenciamento de perfil
  books.ts             - CRUD de livros
  reviews.ts           - CRUD de resenhas
  notes.ts             - CRUD de comentários privados
  quotes.ts            - CRUD de citações
  comments.ts          - CRUD de comentários em resenhas
  follows.ts           - Sistema de seguir
  notifications.ts     - Gerenciamento de notificações
  publisher-requests.ts - Solicitações de publisher
  email.ts             - Serviço de envio de emails (mock)
  users.ts             - Gerenciamento de usuários (admin)

/hooks/
  useAuth.ts           - Hook para autenticação
  useBooks.ts          - Hook para livros

/utils/
  supabase/
    client.ts          - Cliente Supabase
    info.tsx           - Informações do projeto
  seedData.ts          - Dados iniciais

/supabase/functions/server/
  index.tsx            - Edge function principal
  kv_store.tsx         - Store chave-valor (não usado atualmente)
```

## Sistema de Segurança

### Bloqueio de Conta
O aplicativo possui um sistema de segurança que bloqueia automaticamente contas após 5 tentativas de login sem sucesso:

1. **Rastreamento de tentativas**: Cada tentativa de login falha incrementa um contador
2. **Bloqueio automático**: Após 5 tentativas, a conta é bloqueada automaticamente
3. **Notificação por email**: O usuário recebe um email informando sobre o bloqueio
4. **Desbloqueio administrativo**: Apenas administradores podem desbloquear contas pelo AdminPanel
5. **Email de contato**: Os usuários são instruídos a entrar em contato via suporte@pagefy.com

### Sistema de Emails
O aplicativo utiliza um serviço de email (mock) para enviar notificações importantes:

1. **Email de bloqueio de conta**: Enviado automaticamente quando uma conta é bloqueada
2. **Email de aprovação de publicador**: Enviado quando um administrador aprova uma solicitação de publicador
3. **Email de rejeição de publicador**: Enviado quando uma solicitação é rejeitada

**Nota**: Em produção, você deve integrar com um serviço real de email como SendGrid, AWS SES, ou Resend.

## Suporte

Para questões ou problemas, consulte a documentação do Supabase:
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/database

Email de suporte do aplicativo: **suporte@pagefy.com**
