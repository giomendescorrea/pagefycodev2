# ✅ Checklist de Setup - Pagefy

Use este checklist para garantir que tudo está configurado corretamente.

---

## 🗄️ Banco de Dados Supabase

### Migrations SQL

- [ ] **Migration 1: Account Locking**
  - Arquivo: `MIGRATION_ACCOUNT_LOCKING.sql`
  - O que faz: Adiciona colunas de bloqueio de conta na tabela `profiles`
  - Como executar:
    1. Supabase Dashboard → SQL Editor
    2. New query
    3. Copiar/colar conteúdo do arquivo
    4. Run
  - Como verificar:
    ```sql
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name IN ('is_locked', 'failed_login_attempts');
    -- Deve retornar 2 linhas
    ```

- [ ] **Migration 2: Unlock Requests**
  - Arquivo: `MIGRATION_UNLOCK_REQUESTS.sql`
  - O que faz: Cria tabela de solicitações de desbloqueio
  - Como executar:
    1. Supabase Dashboard → SQL Editor
    2. New query
    3. Copiar/colar conteúdo do arquivo
    4. Run
  - Como verificar:
    ```sql
    SELECT * FROM unlock_requests LIMIT 1;
    -- Não deve dar erro "table not found"
    ```

### Verificação de Tabelas

Execute no SQL Editor do Supabase:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Tabelas esperadas:**
- [ ] `books`
- [ ] `comments`
- [ ] `follows`
- [ ] `notes`
- [ ] `notifications`
- [ ] `posts`
- [ ] `profiles`
- [ ] `publisher_requests`
- [ ] `quotes`
- [ ] `reviews`
- [ ] `unlock_requests` ⭐ **Esta é crítica!**
- [ ] `user_books`

---

## 🔐 Autenticação

- [ ] **Email Provider Configurado**
  - Supabase → Authentication → Providers
  - Email provider habilitado
  - Confirm email: Pode deixar desabilitado para desenvolvimento

- [ ] **Testado Login**
  - Criou conta de teste
  - Conseguiu fazer login
  - Logout funciona

- [ ] **Testado Cadastro**
  - Cadastro de leitor (acesso imediato)
  - Cadastro de publicador (aguarda aprovação)

---

## 👨‍💼 Conta de Administrador

- [ ] **Criou Usuário Admin**
  - Método 1: Diretamente no Supabase
    1. Authentication → Users → Create user
    2. Criar email/senha
    3. Table Editor → profiles → Editar registro
    4. Mudar `role` para `'admin'`
  
  - Método 2: Via SQL
    ```sql
    -- Primeiro crie o usuário na interface
    -- Depois atualize o role:
    UPDATE profiles 
    SET role = 'admin' 
    WHERE email = 'seu-email@admin.com';
    ```

- [ ] **Testou Painel Admin**
  - Login com conta admin
  - Acesso ao Menu → Painel do Administrador
  - Vê estatísticas
  - Consegue gerenciar usuários

---

## 📧 Sistema de Email

### Modo Desenvolvimento (Mock)

- [ ] **Emails Aparecem no Console**
  - Abriu console do navegador (F12)
  - Aprovou uma solicitação de publicador
  - Viu log: `[Email Service] Email sent successfully`

### Modo Produção (Opcional Agora)

- [ ] **Escolheu Provedor de Email**
  - Opções: SendGrid, AWS SES, Resend, Mailgun
  
- [ ] **Configurou Credenciais**
  - API key do provedor
  - Configurou em `/services/email.ts`
  
- [ ] **Testou Envio Real**
  - Email de aprovação chega
  - Email de rejeição chega

---

## 🧪 Testes de Funcionalidades

### Sistema de Bloqueio

- [ ] **Teste de Bloqueio Automático**
  1. Criar conta de teste
  2. Fazer logout
  3. Tentar login com senha errada 5 vezes
  4. Verificar que conta foi bloqueada
  5. Verificar mensagem: "Conta bloqueada"

- [ ] **Teste de Solicitação de Desbloqueio**
  1. Com conta bloqueada, clicar "Solicitar desbloqueio"
  2. Preencher motivo
  3. Enviar solicitação
  4. Verificar no painel admin que solicitação aparece

- [ ] **Teste de Desbloqueio pelo Admin**
  1. Login como admin
  2. Ir em Painel do Administrador → Solicitações
  3. Filtrar por "Desbloqueio"
  4. Aprovar solicitação
  5. Verificar que usuário pode logar novamente

### Sistema de Publicador

- [ ] **Teste de Solicitação**
  1. Login como leitor
  2. Menu → Solicitar Perfil de Publicador
  3. Preencher dados (empresa, CNPJ)
  4. Enviar
  5. Verificar mensagem de sucesso

- [ ] **Teste de Aprovação**
  1. Login como admin
  2. Painel do Administrador → Solicitações
  3. Filtrar por "Publicador"
  4. Aprovar solicitação
  5. Verificar email no console (ou recebimento real)
  6. Logout e login com usuário aprovado
  7. Verificar acesso ao Painel do Publicador

- [ ] **Teste de Rejeição**
  1. Criar nova solicitação de publicador
  2. Login como admin
  3. Rejeitar solicitação
  4. Verificar email de rejeição no console

### Sistema de Resenhas

- [ ] **Teste de Fluxo Completo**
  1. Adicionar livro à estante como "Para ler"
  2. Mudar para "Lendo"
  3. Mudar para "Lido"
  4. Escrever resenha com 5 estrelas
  5. Adicionar comentário na resenha
  6. Verificar que aparece no feed

- [ ] **Teste de Validações**
  1. Tentar escrever resenha de livro "Para ler"
  2. Verificar que não permite
  3. Tentar pular de "Para ler" para "Lido"
  4. Verificar que não permite

### Sistema Social

- [ ] **Teste de Follow/Unfollow**
  1. Criar duas contas de teste
  2. Seguir uma com a outra
  3. Verificar contador de seguidores
  4. Parar de seguir
  5. Verificar contador atualizado

- [ ] **Teste de Feed**
  1. Usuário A segue Usuário B
  2. Usuário B escreve resenha
  3. Usuário A vê no feed
  4. Usuário B torna perfil privado
  5. Usuário A não vê mais no feed

### Sistema de Privacidade

- [ ] **Teste Perfil Privado**
  1. Ir em Perfil → Configurações
  2. Ativar "Perfil Privado"
  3. Escrever resenha
  4. Verificar que não aparece no feed de outros
  5. Desativar privacidade
  6. Verificar que volta a aparecer

---

## 🔍 Diagnósticos Automáticos

- [ ] **Executou runDiagnostic()**
  1. Abrir console (F12)
  2. Digitar: `runDiagnostic()`
  3. Verificar que tudo está ✅
  4. Se houver ❌, seguir instruções mostradas

- [ ] **Verificou Emails Normalizados**
  1. No console: `import { checkForUnnormalizedEmails } from './utils/migrateEmails'`
  2. `await checkForUnnormalizedEmails()`
  3. Se houver emails não normalizados: `await migrateEmailsToLowercase()`

---

## 📱 Testes de Interface

### Desktop
- [ ] Layout responsivo funciona
- [ ] Todos os botões clicáveis
- [ ] Navegação fluida

### Mobile
- [ ] Navegação inferior funciona
- [ ] 5 botões visíveis
- [ ] Interface touch-friendly
- [ ] Formulários funcionam no mobile

---

## 🚀 Preparação para Produção

### Segurança

- [ ] **Variáveis de Ambiente**
  - Supabase URL não está hardcoded
  - Supabase Anon Key não está hardcoded
  - Credenciais de email seguras

- [ ] **Políticas RLS Revisadas**
  - Todas as tabelas têm RLS habilitado
  - Políticas testadas
  - Sem brechas de segurança

- [ ] **Rate Limiting**
  - Considerar implementar
  - Especialmente para login/signup

### Performance

- [ ] **Imagens Otimizadas**
  - Capas de livros em tamanho adequado
  - Lazy loading implementado

- [ ] **Queries Otimizadas**
  - Índices criados
  - Queries não fazem full table scan

### Monitoramento

- [ ] **Error Tracking**
  - Considerar Sentry ou similar
  - Logs de erro configurados

- [ ] **Analytics**
  - Considerar Google Analytics
  - Tracking de eventos importantes

---

## 📋 Checklist Geral

### Essencial (Faça AGORA)
- [ ] Execute `MIGRATION_ACCOUNT_LOCKING.sql`
- [ ] Execute `MIGRATION_UNLOCK_REQUESTS.sql`
- [ ] Recarregue a aplicação
- [ ] Execute `runDiagnostic()` no console
- [ ] Crie uma conta de administrador
- [ ] Teste login/logout básico

### Importante (Antes de Produção)
- [ ] Configure emails reais
- [ ] Teste todos os fluxos principais
- [ ] Revise segurança
- [ ] Teste em mobile real
- [ ] Configure variáveis de ambiente

### Desejável (Melhorias)
- [ ] Configure analytics
- [ ] Configure error tracking
- [ ] Implemente rate limiting
- [ ] Otimize imagens
- [ ] Configure domínio customizado

---

## ✅ Verificação Final

Tudo está pronto quando:

- ✅ `runDiagnostic()` retorna tudo verde
- ✅ Consegue criar conta, logar e deslogar
- ✅ Painel de admin funciona
- ✅ Sistema de publicador funciona
- ✅ Pode escrever e ler resenhas
- ✅ Emails aparecem no console (ou chegam de verdade)
- ✅ Sistema de bloqueio funciona
- ✅ Solicitações de desbloqueio funcionam

---

**Última atualização:** 10/01/2025

💡 **Dica:** Imprima este checklist ou use-o como guia passo a passo!
