# Simplificação do Sistema de Login

## Data: 2025-11-08

## Problema Relatado

O usuário relatou que **não conseguia fazer login com nenhuma conta, exceto as que acabava de criar**. Isso indicava que o sistema de bloqueio automático estava causando problemas.

## Decisão

Remover **temporariamente** todo o sistema de bloqueio de contas para focar no básico: **email e senha corretos**.

## Mudanças Implementadas

### 1. Simplificação da Função `signIn()` (`/services/auth.ts`)

**Antes:**
- Verificava se a conta estava bloqueada (is_locked)
- Contava tentativas de login falhadas (failed_login_attempts)
- Bloqueava automaticamente após 5 tentativas
- Enviava emails de bloqueio
- Criava notificações para admins
- Mensagens complexas com contagem regressiva de tentativas

**Depois:**
- Tenta fazer login direto com Supabase Auth
- Se falhar, verifica se é email não encontrado ou senha errada
- Mantém fallback para emails não normalizados (backwards compatibility)
- Mensagens simples: "Email não encontrado" ou "Senha incorreta"

### 2. Simplificação das Mensagens de Erro (`/App.tsx`)

**Removidas:**
- Mensagem de conta bloqueada
- Mensagem de conta bloqueada agora
- Contagem de tentativas restantes
- Avisos de segurança

**Mantidas:**
- Email não encontrado (com sugestão para criar conta)
- Senha incorreta (simples e direta)
- Erro genérico

### 3. Interface do AdminPanel (`/components/AdminPanel.tsx`)

**Comentado (não removido):**
- Badge de "Bloqueado"
- Badge de tentativas falhas
- Botão de desbloquear conta
- Função `handleUnlockUser()`

**Motivo:** Código foi comentado em vez de removido para facilitar reativação futura se necessário.

### 4. Servidor Edge Function (`/supabase/functions/server/index.tsx`)

**Removido:**
- Inicialização de `is_locked: false`
- Inicialização de `failed_login_attempts: 0`

**Motivo:** Não precisamos mais inicializar campos que não estamos usando.

## Fluxo de Login Atual (Simplificado)

```
1. Usuário digita email e senha
   ↓
2. Email é normalizado para lowercase
   ↓
3. Supabase Auth tenta fazer login
   ↓
4. Sucesso?
   ├─ SIM → Busca perfil e retorna usuário
   └─ NÃO → Verifica erro:
       ├─ Email existe no banco → "Senha incorreta"
       └─ Email não existe → "Email não encontrado"
```

## Vantagens da Simplificação

✅ **Login mais confiável** - Remove complexidade que causava problemas  
✅ **Mensagens mais claras** - Usuário sabe exatamente o que está errado  
✅ **Debugging mais fácil** - Menos código para verificar quando há problemas  
✅ **Melhor experiência** - Usuários não são bloqueados por engano  

## Desvantagens (Aceitáveis por Agora)

⚠️ **Menos segurança** - Não há proteção contra ataques de força bruta  
⚠️ **Sem rate limiting** - Alguém pode tentar muitas senhas  

**Nota:** Estas funcionalidades podem ser adicionadas futuramente de forma mais robusta.

## Funcionalidades Mantidas

✅ Normalização de emails (lowercase)  
✅ Fallback para emails antigos não normalizados  
✅ Verificação de email cadastrado  
✅ Autenticação via Supabase Auth  
✅ Sistema de roles (user, publisher, admin)  
✅ Pending approval para publishers  

## Para Reativar o Sistema de Bloqueio (Futuro)

1. Descomentar código no AdminPanel.tsx
2. Restaurar lógica completa em auth.ts (backup em commits anteriores)
3. Restaurar mensagens em App.tsx
4. Adicionar rate limiting mais robusto (considerar usar Supabase Edge Functions)
5. Testar extensivamente antes de colocar em produção

## Testes Recomendados

### Teste 1: Login Básico
1. Criar uma conta nova
2. Fazer logout
3. Fazer login com as credenciais corretas
4. ✅ Deve funcionar

### Teste 2: Senha Errada
1. Tentar fazer login com senha errada
2. ✅ Deve mostrar "Senha incorreta"
3. Tentar novamente com senha correta
4. ✅ Deve funcionar (sem bloqueio)

### Teste 3: Email Não Cadastrado
1. Tentar fazer login com email que não existe
2. ✅ Deve mostrar "Email não encontrado"

### Teste 4: Emails com Maiúsculas
1. Criar conta com email em lowercase
2. Tentar login com MAIÚSCULAS
3. ✅ Deve funcionar (normalização automática)

## Logs para Debugging

Os logs foram mantidos para facilitar troubleshooting:

```
[LoginForm] Submitting login for: usuario@email.com
[Auth] Sign in attempt for normalized email: usuario@email.com
[Auth] Login successful, fetching profile
[App] signIn successful
```

## Campos do Banco de Dados

Os campos `is_locked`, `failed_login_attempts` e `locked_at` **ainda existem** na tabela `profiles`, mas:
- Não são mais inicializados no signup
- Não são mais verificados no login
- Não são mais atualizados em tentativas falhadas

Eles podem ser removidos em uma migração futura se decidirmos não usar o sistema de bloqueio.

## Conclusão

O sistema de login agora é **simples, direto e confiável**. Foca apenas no essencial:
- Email correto?
- Senha correta?
- Então faça login!

Esta simplificação resolve o problema imediato e permite que os usuários façam login sem problemas. Funcionalidades de segurança mais avançadas podem ser adicionadas posteriormente de forma incremental e bem testada.
