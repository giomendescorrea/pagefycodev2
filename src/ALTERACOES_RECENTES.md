# Alterações Recentes - Pagefy

## Data: Novembro 2025

### 1. ✅ Sistema de Aprovação de Publicadores - Remoção de E-mails

**Alteração**: Removida a funcionalidade de envio de e-mail quando uma conta de publicador é aprovada.

**Motivo**: Simplificação do processo. O usuário receberá apenas notificação in-app.

**Arquivos Modificados**:
- `/App.tsx`: Removida a chamada para `sendPublisherApprovalEmail()` na função `handleApprovePublisherRequest()`
- `/components/PendingApprovalScreen.tsx`: 
  - Atualizada mensagem para mencionar prazo de 48 horas
  - Instruções para entrar em contato no e-mail de suporte caso não seja aprovado em 48h
  - E-mail de contato atualizado de `suporte@pagina42.com` para `suporte@pagefy.com`
  - Removida menção de "receber e-mail" e trocada por "notificação no app"

**Como Funciona Agora**:
1. Usuário solicita conta de publicador
2. Administrador aprova/rejeita no AdminPanel
3. Usuário recebe **notificação in-app** (não e-mail)
4. Se não for aprovado em 48h, deve entrar em contato: `suporte@pagefy.com`

---

### 2. ✅ Limpeza de Dados Mockados de Livros

**Alteração**: Sistema agora permite apenas livros adicionados por publicadores ou administradores.

**Arquivos Modificados**:
- `/utils/seedData.ts`: Função `seedInitialBooks()` desabilitada e retorna array vazio
- Criado `/MIGRATION_CLEAN_MOCK_BOOKS.sql`: Script SQL para identificar e remover livros mockados do banco

**Como Funciona Agora**:
- O sistema não insere mais livros mockados automaticamente
- Livros só podem ser adicionados por:
  - **Publicadores** (role: 'publisher')
  - **Administradores** (role: 'admin')
- Todos os livros criados têm um `publisher_id` associado

**Para Limpar Livros Mockados Existentes**:
1. Acesse o Supabase SQL Editor
2. Abra o arquivo `MIGRATION_CLEAN_MOCK_BOOKS.sql`
3. Execute primeiro o SELECT para verificar os livros sem `publisher_id`
4. Se desejar remover, descomente e execute o DELETE

---

### 3. ✅ Sistema de Citações/Comentários

**Status**: Já implementado corretamente e funcionando.

**Como Funciona**:

#### Citações (Quotes)
- **Tabela**: `quotes`
- **Associações**:
  - `book_id`: Associa a citação ao livro
  - `user_id`: Associa a citação ao perfil do leitor
  - `profile`: Join com tabela profiles para dados do usuário
- **Campos**:
  - `text`: Texto da citação
  - `page`: Página (opcional)
  - `percentage`: Porcentagem do livro (opcional)

#### Comentários (Comments)
- **Tabela**: `comments`
- **Associações**:
  - `review_id`: Associa o comentário à resenha
  - `user_id`: Associa o comentário ao perfil do leitor
  - `profile`: Join com tabela profiles para dados do usuário
- **Nota**: Comentários são associados a **resenhas**, não diretamente aos livros

#### Fluxo de Criação de Citação
```
Usuário preenche formulário de citação
  ↓
handleAddQuote() chamado no App.tsx
  ↓
quotesService.createQuote() executado
  ↓
Citação criada no banco:
  - book_id: ID do livro
  - user_id: ID do perfil do leitor
  - text: Texto da citação
  - page/percentage: Localização (opcional)
```

---

## Resumo das Mudanças

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| E-mail de aprovação de publicador | ❌ Removido | Apenas notificação in-app |
| Livros mockados | ❌ Desabilitado | Apenas publicadores/admins podem adicionar |
| Sistema de citações | ✅ Funcionando | Associa livro + perfil corretamente |
| Sistema de comentários | ✅ Funcionando | Associa resenha + perfil corretamente |

---

## Próximos Passos Sugeridos

1. **Executar Migration de Limpeza** (opcional):
   - Se houver livros mockados no banco, execute `MIGRATION_CLEAN_MOCK_BOOKS.sql`

2. **Testar Fluxo de Aprovação**:
   - Criar conta de publicador
   - Verificar que recebe notificação in-app (não e-mail)
   - Confirmar mensagem de 48h na tela de pendente

3. **Verificar Livros**:
   - Confirmar que apenas publicadores/admins podem adicionar livros
   - Verificar que todos os novos livros têm `publisher_id`

4. **Testar Citações**:
   - Adicionar citação em um livro
   - Verificar que aparece associada ao livro e ao perfil do usuário
   - Confirmar privacidade (citações privadas não aparecem para outros)

---

## Contato de Suporte

**E-mail**: suporte@pagefy.com

Para dúvidas sobre aprovações de publicador que levem mais de 48 horas, os usuários devem entrar em contato neste e-mail.
