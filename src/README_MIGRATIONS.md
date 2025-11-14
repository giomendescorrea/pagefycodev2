# 🔧 Guia de Migrations - Pagefy

## O que são Migrations?

Migrations são scripts SQL que atualizam a estrutura do banco de dados. Elas adicionam novas tabelas, colunas ou funcionalidades ao sistema.

## ⚠️ Aviso de Migrations Pendentes

Se você vir um banner laranja no topo da aplicação dizendo **"Migrations Pendentes"**, isso significa que:

1. ✅ **A aplicação está funcionando normalmente**
2. ⚠️ **Algumas funcionalidades avançadas podem estar desabilitadas**
3. 📝 **Você precisa executar scripts SQL no Supabase para ativar essas funcionalidades**

### O que acontece se eu NÃO executar as migrations?

A aplicação continuará funcionando normalmente com as funcionalidades principais:
- ✅ Login e cadastro
- ✅ Visualizar e adicionar livros
- ✅ Fazer resenhas e comentários
- ✅ Sistema de citações
- ✅ Feed de atividades
- ✅ Perfis de usuário

**Funcionalidades que ficarão desabilitadas:**
- ❌ Sistema de bloqueio automático de contas (após 5 tentativas de login falhas)
- ❌ Solicitações de desbloqueio de contas
- ❌ Painel administrativo de desbloqueio

## 📋 Migrations Disponíveis

### 1. MIGRATION_ACCOUNT_LOCKING.sql
**Funcionalidade:** Sistema de bloqueio de contas

**Adiciona:**
- Contador de tentativas de login falhas
- Bloqueio automático após 5 tentativas
- Campo para suspensão manual por administrador
- Data/hora do bloqueio

**Necessária para:**
- Segurança de contas
- Proteção contra ataques de força bruta

---

### 2. MIGRATION_UNLOCK_REQUESTS.sql
**Funcionalidade:** Sistema de solicitações de desbloqueio

**Adiciona:**
- Tabela para armazenar solicitações de desbloqueio
- Usuários podem solicitar desbloqueio via interface
- Admins podem aprovar/rejeitar solicitações
- Políticas de segurança (RLS)

**Necessária para:**
- Permitir que usuários bloqueados solicitem desbloqueio
- Painel administrativo de gerenciamento de solicitações

---

### 3. MIGRATION_CLEAN_MOCK_BOOKS.sql (OPCIONAL)
**Funcionalidade:** Limpeza de dados de teste

**Remove:**
- Livros mockados (dados de exemplo)
- Mantém apenas livros adicionados por publicadores reais

**Execute se:**
- Você está preparando o app para produção
- Quer remover dados de teste

**NÃO execute se:**
- Você está em desenvolvimento e quer manter os livros de exemplo

## 🚀 Como Executar as Migrations

### Passo 1: Acesse o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto **Pagefy**

### Passo 2: Abra o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **+ New query** (botão azul no topo)

### Passo 3: Execute Cada Migration

Para cada arquivo de migration que você quer executar:

1. Abra o arquivo (ex: `MIGRATION_ACCOUNT_LOCKING.sql`)
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
5. ✅ Confirme que apareceu **"Success. No rows returned"**

**Ordem recomendada:**
1. `MIGRATION_ACCOUNT_LOCKING.sql` (primeiro)
2. `MIGRATION_UNLOCK_REQUESTS.sql` (segundo)
3. `MIGRATION_CLEAN_MOCK_BOOKS.sql` (opcional, por último)

### Passo 4: Recarregue a Aplicação

1. Volte para a aplicação
2. Pressione **F5** ou **Ctrl+R** para recarregar
3. ✅ O banner laranja deve desaparecer (ou pode ser dispensado)

## ✅ Verificação

Para confirmar que as migrations foram executadas com sucesso:

### Via Supabase Dashboard:

1. Vá para **Table Editor** no menu lateral
2. Verifique se a tabela **unlock_requests** existe
3. Clique na tabela **profiles**
4. Verifique se existem as colunas:
   - `is_locked`
   - `failed_login_attempts`
   - `locked_at`
   - `is_suspended`

### Via Aplicação:

1. Faça login como **administrador**
2. Vá para **Menu** > **Painel Administrativo**
3. Você deve ver a aba **"Desbloqueios"**
4. Se não houver o banner laranja de aviso, tudo está OK!

## 🔄 Migrations são Idempotentes

Você pode executar a mesma migration várias vezes sem problemas. Os scripts usam:
- `IF NOT EXISTS` para criar tabelas
- `ADD COLUMN IF NOT EXISTS` para adicionar colunas

Se você tentar executar novamente, o Supabase vai simplesmente ignorar o que já existe.

## 🆘 Problemas Comuns

### "relation already exists"
✅ **Normal!** Significa que a tabela já foi criada. Continue normalmente.

### "column already exists"
✅ **Normal!** Significa que a coluna já foi adicionada. Continue normalmente.

### "permission denied"
❌ **Problema!** Você não tem permissão para modificar o banco.
- Verifique se você está logado no projeto correto
- Certifique-se de ser o **owner** do projeto Supabase

### Banner laranja não desaparece
1. Tente recarregar a página (F5)
2. Clique no X para dispensar manualmente
3. Verifique o console do navegador (F12) para ver se há erros

## 💡 Dicas

### Quando executar as migrations?

**Execute AGORA se:**
- ✅ Você quer todas as funcionalidades
- ✅ Você é administrador do projeto
- ✅ Você está preparando para produção

**Pode adiar se:**
- ⏸️ Você está apenas testando o básico
- ⏸️ Você não precisa do sistema de bloqueio ainda
- ⏸️ Você está esperando aprovação de outros desenvolvedores

### Posso desfazer uma migration?

Sim! Cada arquivo de migration tem uma seção de **ROLLBACK** no final com os comandos para reverter as alterações.

**Exemplo para desfazer MIGRATION_ACCOUNT_LOCKING.sql:**
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS is_locked;
ALTER TABLE profiles DROP COLUMN IF EXISTS failed_login_attempts;
ALTER TABLE profiles DROP COLUMN IF EXISTS locked_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS is_suspended;
```

## 📞 Suporte

Se você encontrar problemas ao executar as migrations:

1. 📖 Leia: `IMPORTANTE_EXECUTAR_MIGRATIONS.md`
2. 🔍 Verifique: `TROUBLESHOOTING.md`
3. 📧 Entre em contato com o suporte técnico

---

**Última atualização:** 10/11/2025
**Status:** ✅ Documentação Completa
