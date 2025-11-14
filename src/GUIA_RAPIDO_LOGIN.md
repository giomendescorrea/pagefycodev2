# Guia Rápido - Problemas de Login

## Problema: "Email não reconhecido" ou "Não consigo fazer login"

### Passo 1: Verificar se o email está cadastrado

1. Abra o **Supabase Dashboard**: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Procure pelo seu email na lista
4. **Se NÃO estiver na lista**: Você precisa criar uma conta primeiro!
5. **Se estiver na lista**: Continue para o Passo 2

### Passo 2: Verificar se o email está normalizado

1. Ainda no Supabase Dashboard, vá em **Table Editor** → **profiles**
2. Procure pelo seu email
3. Verifique se o campo `email` está em **lowercase** (letras minúsculas)
4. Exemplo:
   - ✅ Correto: `usuario@email.com`
   - ❌ Errado: `Usuario@Email.com`

**Se o email estiver com maiúsculas:**

Opção A - Usar a ferramenta de diagnóstico (mais fácil):
1. Faça login com uma conta de administrador
2. Vá em **Menu** (ícone de menu no canto inferior direito)
3. Clique em **"Diagnóstico de Emails (Dev)"**
4. Clique em **"Verificar Emails"**
5. Se houver emails não normalizados, clique em **"Migrar Emails para Lowercase"**

Opção B - Corrigir manualmente:
1. No Table Editor → profiles, encontre o registro
2. Clique para editar
3. Altere o campo `email` para lowercase
4. Salve

### Passo 3: Verificar se a conta está bloqueada

1. No Table Editor → profiles, procure seu email
2. Verifique o campo `is_locked`
3. **Se for `true` ou `1`**: Sua conta está bloqueada

**Para desbloquear:**
1. Peça para um administrador desbloquear sua conta no AdminPanel
2. Ou atualize manualmente o campo `is_locked` para `false` e `failed_login_attempts` para `0`

### Passo 4: Verificar a senha

1. Se você esqueceu a senha, **não há recuperação de senha** (ainda)
2. Você precisará:
   - Opção A: Pedir para um admin resetar sua senha no Supabase
   - Opção B: Criar uma nova conta com outro email

### Passo 5: Verificar os logs do console

1. Abra o console do navegador (F12)
2. Vá na aba **Console**
3. Tente fazer login novamente
4. Procure por mensagens que começam com `[Auth]`, `[LoginForm]` ou `[App]`
5. Anote qualquer erro que aparecer

**Exemplos de logs normais:**
```
[LoginForm] Submitting login for: usuario@email.com
[Auth] Sign in attempt for normalized email: usuario@email.com
[Auth] Profile lookup result: { found: true, error: undefined }
[Auth] Login successful, fetching profile
```

**Exemplos de logs com erro:**
```
[Auth] Profile lookup result: { found: false, error: "No rows found" }
→ Email não cadastrado

[Auth] Account is locked
→ Conta bloqueada

[Auth] Wrong password, remaining attempts: 3
→ Senha incorreta
```

## Dicas Importantes

### ✅ Faça isso:
- Digite o email sempre em **lowercase** (minúsculas)
- Remova **espaços** antes e depois do email
- Use um email **válido** (com @ e domínio)
- Lembre-se da senha que você usou no cadastro

### ❌ Não faça isso:
- Não digite o email com maiúsculas (embora o sistema normalize automaticamente)
- Não adicione espaços no email
- Não tente fazer login se você ainda não criou uma conta

## Comandos Úteis (Console do Navegador)

### Verificar emails não normalizados:
```javascript
// Copie e cole no console do navegador
import { checkForUnnormalizedEmails } from './utils/migrateEmails';
checkForUnnormalizedEmails().then(result => {
  console.log('Emails não normalizados:', result);
});
```

### Migrar todos os emails para lowercase:
```javascript
// CUIDADO: Isso vai alterar o banco de dados!
import { migrateEmailsToLowercase } from './utils/migrateEmails';
migrateEmailsToLowercase().then(success => {
  if (success) {
    console.log('Migração concluída com sucesso!');
  }
});
```

## Perguntas Frequentes

### P: Por que meu login parou de funcionar de repente?

**R:** Provavelmente você tinha um email com maiúsculas no banco e após a atualização do sistema ele não está sendo encontrado. Use a ferramenta de diagnóstico para corrigir.

### P: Criei uma conta mas não consigo fazer login

**R:** Verifique se:
1. Você realmente completou o cadastro (não apenas preencheu o formulário)
2. O email está cadastrado no Supabase (Authentication → Users)
3. A senha está correta

### P: O sistema diz "Email não encontrado" mas eu tenho certeza que criei a conta

**R:** Possíveis causas:
1. O email pode estar com maiúsculas no banco → Use a ferramenta de diagnóstico
2. Você pode ter criado com outro email → Verifique no Supabase
3. A criação da conta pode ter falhado → Verifique os logs do cadastro

### P: Posso usar email com maiúsculas?

**R:** Sim! O sistema agora normaliza automaticamente todos os emails para lowercase. Você pode digitar "Usuario@Email.com" que será convertido para "usuario@email.com".

## Contato de Suporte

Se nada disso resolver, você pode:
1. Verificar os logs detalhados no console
2. Abrir uma issue no repositório do projeto
3. Contatar o administrador do sistema
