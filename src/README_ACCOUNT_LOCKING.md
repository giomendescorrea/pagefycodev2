# Sistema de Bloqueio de Conta - Instruções de Instalação

## Resumo
O sistema de bloqueio de conta impede que atacantes façam tentativas ilimitadas de senha. Após 5 tentativas incorretas, a conta é automaticamente bloqueada e só pode ser desbloqueada por um administrador.

## Passo 1: Executar a Migração SQL

Para ativar o sistema de bloqueio de conta, você precisa adicionar as colunas necessárias na tabela `profiles` do Supabase.

### Como executar:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**
5. Copie e cole o conteúdo do arquivo `MIGRATION_ACCOUNT_LOCKING.sql`
6. Clique em **Run** para executar a migração

### O que a migração faz:

```sql
-- Adiciona 3 novas colunas na tabela profiles:
- is_locked: boolean que indica se a conta está bloqueada
- failed_login_attempts: contador de tentativas falhadas
- locked_at: timestamp de quando a conta foi bloqueada

-- Cria índices para melhor performance:
- Índice em is_locked
- Índice composto em (email, is_locked)
```

## Passo 2: Verificar Funcionamento

Após executar a migração, teste o sistema:

### Teste 1: Bloqueio por tentativas

1. Faça logout do aplicativo
2. Tente fazer login com um email válido
3. Digite a senha errada 5 vezes consecutivas
4. Na 5ª tentativa, você verá: **"Conta bloqueada"**

### Teste 2: Desbloqueio pelo Admin

1. Faça login com uma conta de administrador
2. Acesse **Menu → Painel do Administrador**
3. Na aba **Usuários**, você verá:
   - Badge laranja **"Bloqueado"** para contas bloqueadas
   - Badge amarelo mostrando tentativas falhadas
4. Clique no botão de **cadeado aberto** (🔓) para desbloquear
5. O usuário receberá uma notificação de desbloqueio

## Como Funciona

### Fluxo de Login:

1. **Passo 1 - Email**: Usuário digita o email
   - Sistema verifica se email existe
   - Se não existir, não avança

2. **Passo 2 - Senha**: Usuário digita a senha
   - Sistema verifica se conta está bloqueada
   - Se bloqueada, mostra erro e não permite login
   - Se senha incorreta, incrementa contador de tentativas
   - Mostra quantas tentativas restam (ex: "Você tem mais 3 tentativas")
   - Após 5 tentativas, bloqueia automaticamente

3. **Login bem-sucedido**: Reseta o contador de tentativas

### Recursos do Painel Admin:

- **Visualizar contas bloqueadas**: Badge laranja "Bloqueado"
- **Ver tentativas falhadas**: Badge amarelo com número de tentativas
- **Desbloquear contas**: Botão de cadeado aberto
- **Notificação automática**: Usuário é notificado ao desbloquear

## Mensagens para o Usuário

### Senha incorreta (tentativas restantes):
```
Senha incorreta
Você tem mais 4 tentativa(s) antes da conta ser bloqueada.
```

### Conta bloqueada:
```
Conta bloqueada
Sua conta foi bloqueada devido a múltiplas tentativas de login. 
Entre em contato com o administrador para desbloquear.
```

### Conta desbloqueada (notificação):
```
Conta Desbloqueada
Sua conta foi desbloqueada pelo administrador. 
Você já pode fazer login normalmente.
```

## Segurança

O sistema protege contra:
- ✅ Ataques de força bruta
- ✅ Tentativas automatizadas de login
- ✅ Roubo de contas por tentativa e erro

## Suporte

Se tiver problemas ao executar a migração:
1. Verifique se você tem permissões de administrador no Supabase
2. Certifique-se de que a tabela `profiles` existe
3. Verifique o console SQL Editor por erros

---

**Desenvolvido para Pagefy** 📚
