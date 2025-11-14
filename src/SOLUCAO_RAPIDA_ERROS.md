# 🔧 Solução Rápida de Erros

## ❌ Erro: "Could not find the table 'public.unlock_requests'"

### Causa
A tabela `unlock_requests` não foi criada no banco de dados Supabase.

### Solução Imediata

1. **Acesse o Supabase**
   - Vá para: https://supabase.com/dashboard
   - Selecione o projeto **Pagefy**

2. **Execute a Migration**
   - Clique em **SQL Editor** no menu lateral
   - Clique em **+ New query**
   - Abra o arquivo `MIGRATION_UNLOCK_REQUESTS.sql` no seu editor
   - Copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **Run** (ou Ctrl/Cmd + Enter)
   - Aguarde a mensagem de sucesso

3. **Recarregue a Aplicação**
   - Pressione F5 ou Ctrl+R no navegador
   - O erro deve desaparecer

### Verificação
```sql
-- Execute no SQL Editor para verificar se a tabela existe
SELECT * FROM unlock_requests LIMIT 1;
```

Se retornar sem erro, a tabela foi criada com sucesso! ✅

---

## ❌ Erro: "Este email já está cadastrado"

### Causa
Você está tentando criar uma conta com um email que já existe no sistema.

### Soluções

#### Opção 1: Use Outro Email
- Tente com um email diferente

#### Opção 2: Faça Login
- Se você já tem uma conta, use o botão "Já tem uma conta? Entrar"

#### Opção 3: Recupere a Senha
1. Na tela de login, clique em "Esqueceu a senha?"
2. Digite seu email
3. Siga as instruções (atualmente em modo simulação - veja o console)

#### Opção 4: Remova a Conta Antiga (Desenvolvedores)
Se você é desenvolvedor e quer limpar os dados de teste:

1. Acesse Supabase Dashboard
2. Vá em **Authentication** > **Users**
3. Encontre o usuário com o email
4. Clique nos três pontos (...) > **Delete user**
5. Tente criar a conta novamente

---

## ❌ Erro: Colunas de bloqueio não existem

### Sintomas
- Erro ao tentar bloquear/desbloquear contas
- Erro: "column does not exist: is_locked"

### Solução

Execute a migration de bloqueio de contas:

1. Acesse Supabase Dashboard > SQL Editor
2. Abra `MIGRATION_ACCOUNT_LOCKING.sql`
3. Copie todo o conteúdo
4. Cole e execute no SQL Editor
5. Recarregue a aplicação

---

## ⚠️ Avisos no Console

### "Migrations pendentes detectadas"

**O que fazer:**
1. Leia o arquivo `IMPORTANTE_EXECUTAR_MIGRATIONS.md`
2. Execute as migrations necessárias
3. Recarregue a aplicação

### "Unnormalized emails found"

**O que fazer:**
Este é apenas um aviso. Os emails precisam estar em minúsculas. Para corrigir:

```javascript
// No console do navegador:
import { migrateEmailsToLowercase } from './utils/migrateEmails'
await migrateEmailsToLowercase()
```

---

## 🔍 Como Diagnosticar Problemas

### 1. Verifique o Console do Navegador
- Pressione F12
- Vá na aba **Console**
- Procure por mensagens de erro em vermelho

### 2. Verifique o Banco de Dados

Execute no SQL Editor:

```sql
-- Verificar se todas as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- books
-- comments
-- follows
-- notes
-- notifications
-- posts
-- profiles
-- publisher_requests
-- quotes
-- reviews
-- unlock_requests  ← Esta deve existir!
-- user_books
```

### 3. Verifique Colunas da Tabela Profiles

```sql
-- Verificar colunas de bloqueio
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('is_locked', 'failed_login_attempts', 'locked_at', 'is_suspended')
ORDER BY column_name;

-- Deve retornar 4 linhas:
-- failed_login_attempts | integer
-- is_locked            | boolean
-- is_suspended         | boolean
-- locked_at            | timestamp with time zone
```

---

## 🆘 Ainda com Problemas?

### Checklist Final

- [ ] Executou `MIGRATION_ACCOUNT_LOCKING.sql`?
- [ ] Executou `MIGRATION_UNLOCK_REQUESTS.sql`?
- [ ] Recarregou a aplicação após as migrations?
- [ ] Verificou se está usando o projeto correto no Supabase?
- [ ] Limpou o cache do navegador (Ctrl+Shift+Delete)?

### Reset Completo (Último Recurso)

Se nada funcionar, você pode resetar o banco:

⚠️ **ATENÇÃO: Isso apagará TODOS os dados!**

1. Vá em Supabase Dashboard > Database > Tables
2. Delete todas as tabelas (exceto as do sistema)
3. Execute todas as migrations na ordem:
   - Setup inicial de tabelas
   - `MIGRATION_ACCOUNT_LOCKING.sql`
   - `MIGRATION_UNLOCK_REQUESTS.sql`
4. Recarregue a aplicação
5. Os dados iniciais serão criados automaticamente

---

## 📚 Documentação Relacionada

- `IMPORTANTE_EXECUTAR_MIGRATIONS.md` - Guia de migrations
- `TROUBLESHOOTING.md` - Guia completo de problemas
- `README_ACCOUNT_LOCKING.md` - Sistema de bloqueio
- `README_UNLOCK_REQUESTS.md` - Sistema de desbloqueio
- `SUPABASE_SETUP.md` - Configuração do Supabase

---

**Última atualização:** 10/01/2025
