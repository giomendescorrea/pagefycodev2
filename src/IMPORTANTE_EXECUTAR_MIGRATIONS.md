# ⚠️ MIGRATIONS PENDENTES

## ✅ Não é um Erro Crítico!

**A aplicação está funcionando normalmente.** Este é apenas um aviso de que algumas funcionalidades avançadas precisam de configuração adicional no banco de dados.

## Aviso Técnico
```
Error: Could not find the table 'public.unlock_requests' in the schema cache
```

Este aviso ocorre porque as tabelas opcionais ainda não foram criadas no seu banco de dados Supabase.

**O que funciona SEM as migrations:**
- ✅ Login e cadastro de usuários
- ✅ Sistema de livros e resenhas
- ✅ Comentários e citações
- ✅ Feed de atividades
- ✅ Perfis e configurações
- ✅ Sistema de follow/unfollow
- ✅ Painel do publicador
- ✅ Painel administrativo básico

**O que precisa das migrations:**
- ⚠️ Sistema de bloqueio automático de contas
- ⚠️ Solicitações de desbloqueio
- ⚠️ Painel admin de gerenciamento de desbloqueio

## 📋 Checklist de Migrations

### ✅ Migration 1: Account Locking (Bloqueio de Contas)
**Arquivo:** `MIGRATION_ACCOUNT_LOCKING.sql`

Esta migration adiciona os campos necessários para o sistema de bloqueio de contas:
- `is_locked` - Indica se a conta está bloqueada
- `failed_login_attempts` - Contador de tentativas falhas
- `locked_at` - Data/hora do bloqueio
- `is_suspended` - Indica se a conta foi suspensa por admin

### ✅ Migration 2: Unlock Requests (Solicitações de Desbloqueio)
**Arquivo:** `MIGRATION_UNLOCK_REQUESTS.sql`

Esta migration cria a tabela de solicitações de desbloqueio:
- Permite usuários solicitarem desbloqueio de suas contas
- Admins podem aprovar ou rejeitar solicitações
- Políticas RLS (Row Level Security) configuradas

## 🚀 Como Executar as Migrations

### Passo 1: Acesse o Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **Pagefy**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Execute a Migration de Account Locking
1. Clique em **New query** ou **+ New**
2. Copie TODO o conteúdo do arquivo `MIGRATION_ACCOUNT_LOCKING.sql`
3. Cole no editor SQL
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
5. ✅ Confirme que apareceu "Success. No rows returned"

### Passo 3: Execute a Migration de Unlock Requests
1. Clique em **New query** novamente
2. Copie TODO o conteúdo do arquivo `MIGRATION_UNLOCK_REQUESTS.sql`
3. Cole no editor SQL
4. Clique em **Run**
5. ✅ Confirme que apareceu "Success. No rows returned"

## ✅ Verificação

Após executar as migrations, verifique se as tabelas foram criadas:

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver a tabela **unlock_requests**
3. Clique na tabela **profiles** e verifique se existem as colunas:
   - `is_locked`
   - `failed_login_attempts`
   - `locked_at`
   - `is_suspended`

## 🔄 Após Executar as Migrations

1. **Recarregue a aplicação** (F5 ou Ctrl+R)
2. Os erros de tabela não encontrada devem desaparecer
3. O sistema de bloqueio e solicitações de desbloqueio estará funcionando

## ⚠️ Importante

- Execute as migrations **na ordem indicada** (Account Locking primeiro, depois Unlock Requests)
- Se alguma migration der erro, verifique se você está usando o projeto correto no Supabase
- As migrations são **idempotentes** (podem ser executadas múltiplas vezes sem problemas)

## 🆘 Troubleshooting

### Erro: "relation already exists"
✅ Isso é normal! Significa que parte da migration já foi executada. Continue normalmente.

### Erro: "permission denied"
❌ Verifique se você está logado como **owner** do projeto no Supabase.

### Erro: "column already exists"
✅ Isso é normal! A migration usa `IF NOT EXISTS` e `ADD COLUMN IF NOT EXISTS`.

### Tabela não aparece no Table Editor
1. Aguarde 5-10 segundos
2. Recarregue a página do Supabase Dashboard
3. Verifique em **Database** > **Tables**

---

## 📞 Próximos Passos

Após executar as migrations:

1. ✅ O AdminPanel mostrará solicitações de desbloqueio
2. ✅ Usuários com contas bloqueadas poderão solicitar desbloqueio
3. ✅ Sistema de bloqueio automático funcionará após 5 tentativas falhas
4. ✅ Emails de notificação serão enviados (atualmente em modo mock/simulação)

---

**Data de criação:** 10/01/2025
**Status:** ⚠️ PENDENTE - Execute as migrations AGORA
