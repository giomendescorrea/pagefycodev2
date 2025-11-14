# 🔓 Instruções: Migration de Unlock Requests

## ⚠️ LEIA ISTO PRIMEIRO

Você está vendo erros como estes:
```
Error: Could not find a relationship between 'unlock_requests' and 'profiles'
Error: new row violates row-level security policy for table "unlock_requests"
```

Isso acontece porque a tabela `unlock_requests` ainda **não foi criada no Supabase**, ou foi criada com políticas incorretas.

---

## 📋 Checklist Rápido

Execute estes passos NA ORDEM:

### ✅ Passo 1: Acesse o Supabase
1. Abra [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login
3. Selecione o projeto **Pagefy**

### ✅ Passo 2: Abra o SQL Editor
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique no botão **+ New query**

### ✅ Passo 3: Execute a Migration
1. Abra o arquivo **`MIGRATION_UNLOCK_REQUESTS.sql`** (na raiz do projeto)
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique no botão **Run** (ou pressione Ctrl+Enter)
5. Aguarde a mensagem de sucesso ✅

### ✅ Passo 4: Verifique se Funcionou
1. No Supabase, clique em **Table Editor** no menu lateral
2. Procure a tabela **unlock_requests** na lista
3. Verifique se ela aparece ✅

### ✅ Passo 5: Recarregue a Aplicação
1. Volte para o navegador onde o Pagefy está rodando
2. Pressione **F5** ou **Ctrl+R** para recarregar
3. Os erros devem desaparecer! 🎉

---

## 🔍 O Que Esta Migration Faz?

A migration `MIGRATION_UNLOCK_REQUESTS.sql` cria:

### 1. **Tabela unlock_requests**
Armazena solicitações de desbloqueio de contas bloqueadas:
- `id` - UUID único
- `user_id` - Referência ao usuário bloqueado
- `reason` - Motivo do bloqueio
- `status` - `pending`, `approved`, ou `rejected`
- `created_at` e `updated_at` - Timestamps

### 2. **Foreign Key**
Relaciona `unlock_requests.user_id` com `profiles.id`:
- Nome: `unlock_requests_user_id_fkey`
- Permite JOIN nas queries
- Cascata ao deletar perfil

### 3. **Índices**
Para performance:
- `idx_unlock_requests_user_id` - Busca por usuário
- `idx_unlock_requests_status` - Filtro por status

### 4. **Políticas RLS (Row Level Security)**
Controla quem pode fazer o quê:

| Ação | Quem Pode | Condição |
|------|-----------|----------|
| **INSERT** | Usuários | Criar para si mesmo |
| **INSERT** | Admins | Criar para qualquer usuário |
| **SELECT** | Usuários | Ver suas próprias solicitações |
| **SELECT** | Admins | Ver todas as solicitações |
| **UPDATE** | Admins | Aprovar/rejeitar solicitações |
| **DELETE** | Admins | Deletar solicitações |

### 5. **Função Helper**
`create_unlock_request_as_admin(user_id, reason)`:
- Permite admins criarem solicitações em nome de usuários bloqueados
- Usa `SECURITY DEFINER` para bypass de RLS
- Verifica se quem chama é admin

---

## 🐛 Solução de Problemas

### Problema: "Table already exists"
**Solução:**
```sql
-- Execute isto primeiro para limpar
DROP TABLE IF EXISTS unlock_requests CASCADE;
```
Depois execute a migration completa novamente.

---

### Problema: "Permission denied"
**Causa:** Você não tem permissões de admin no Supabase.

**Solução:**
1. Certifique-se de estar logado como owner do projeto
2. Ou peça ao owner para executar a migration

---

### Problema: "Profiles table not found"
**Causa:** A tabela `profiles` não existe ainda.

**Solução:**
1. Execute PRIMEIRO as migrations de setup inicial
2. Certifique-se de que a tabela `profiles` existe
3. Depois execute `MIGRATION_UNLOCK_REQUESTS.sql`

---

### Problema: Erros continuam após executar
**Solução:**
1. Verifique se a migration foi executada COM SUCESSO
2. Verifique se NÃO teve nenhuma mensagem de erro vermelha
3. Recarregue a aplicação (F5)
4. Limpe o cache do navegador (Ctrl+Shift+Delete)
5. Tente novamente

---

## 🎯 Como Testar se Funcionou

### Teste 1: Bloqueio Automático
1. Faça logout
2. Tente fazer login com senha ERRADA 5 vezes
3. Na 5ª tentativa, a conta deve ser bloqueada
4. Você deve ver mensagem: "Conta bloqueada. Aguardando aprovação do administrador."

### Teste 2: Admin Panel
1. Faça login como **admin**:
   - Email: `admin@pagefy.com`
   - Senha: `Admin123!`
2. Clique no menu hambúrguer (☰)
3. Clique em **Painel Admin**
4. Vá na aba **Solicitações de Desbloqueio**
5. Você deve ver a solicitação do usuário bloqueado! ✅

### Teste 3: Aprovar Desbloqueio
1. No Painel Admin, clique em **Aprovar** na solicitação
2. O usuário deve ser desbloqueado
3. Tente fazer login com o usuário desbloqueado
4. Deve funcionar! 🎉

---

## 📝 Comandos SQL Úteis

### Ver todas as solicitações:
```sql
SELECT * FROM unlock_requests;
```

### Ver solicitações com dados do usuário:
```sql
SELECT 
  ur.*,
  p.name,
  p.email,
  p.is_locked
FROM unlock_requests ur
JOIN profiles p ON ur.user_id = p.id
ORDER BY ur.created_at DESC;
```

### Ver apenas pendentes:
```sql
SELECT * FROM unlock_requests 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### Deletar todas as solicitações (para testar):
```sql
DELETE FROM unlock_requests;
```

### Ver políticas RLS:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'unlock_requests';
```

---

## 🔗 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `/MIGRATION_UNLOCK_REQUESTS.sql` | **Migration SQL** - Execute no Supabase |
| `/services/unlock-requests.ts` | Serviço TypeScript para unlock requests |
| `/components/AdminPanel.tsx` | Interface do painel admin |
| `/services/auth.ts` | Sistema de bloqueio automático |

---

## 📚 Mais Informações

- [IMPORTANTE_EXECUTAR_MIGRATIONS.md](./IMPORTANTE_EXECUTAR_MIGRATIONS.md) - Guia completo de migrations
- [README_UNLOCK_REQUESTS.md](./README_UNLOCK_REQUESTS.md) - Documentação do sistema de unlock
- [CORRECAO_SOLICITACOES_DESBLOQUEIO.md](./CORRECAO_SOLICITACOES_DESBLOQUEIO.md) - Correções aplicadas

---

## ❓ Ainda com Dúvidas?

Se ainda estiver com problemas:

1. ✅ Verifique se executou a migration COMPLETA
2. ✅ Verifique se recarregou a aplicação
3. ✅ Abra o console do navegador (F12) e procure por erros
4. ✅ Verifique se está usando o projeto Supabase correto
5. ✅ Tente limpar o cache e recarregar

---

**Data de Criação:** 10/11/2025  
**Versão da Migration:** 2.0 (com RLS corrigido)  
**Status:** ✅ Atualizado e Testado
