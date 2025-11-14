# 🚀 Executar no Supabase - Checklist Rápido

## ⚡ 3 Passos para Sistema 100% Funcional

---

## 📋 PASSO 1: Executar SQL (2 minutos)

### 1. Abrir SQL Editor

```
1. https://supabase.com/dashboard
2. Selecionar seu projeto
3. Clicar em "SQL Editor" (📝 na lateral)
4. Clicar em "New query"
```

### 2. Copiar e Executar Este SQL

```sql
-- ═══════════════════════════════════════════════════════════════
-- PAGEFY - CONFIGURAÇÃO COMPLETA
-- ═══════════════════════════════════════════════════════════════

-- 1. Habilitar extensão de criptografia (necessária para reset de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar função de reset de senha
CREATE OR REPLACE FUNCTION update_user_password(
  user_email TEXT,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Buscar usuário pelo email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Verificar se usuário existe
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  -- Atualizar senha do usuário
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  -- Retornar sucesso
  RETURN json_build_object('success', true, 'user_id', user_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. Conceder permissões para a função
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;

-- 4. Verificação final
SELECT 
  '✅ CONFIGURAÇÃO COMPLETA!' as status,
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'update_user_password') as funcao_criada;
```

### 3. Clicar em "RUN" (ou Ctrl+Enter)

**Resultado esperado:**
```
✅ CONFIGURAÇÃO COMPLETA!
total_usuarios: X
funcao_criada: 1
```

✅ **SQL executado com sucesso!**

---

## 📧 PASSO 2: Verificar Confirmação de Email (1 minuto)

### 1. Acessar Configurações de Email

```
1. No Supabase Dashboard
2. Clicar em "Authentication" (🔐 na lateral)
3. Clicar em "Providers"
4. Encontrar "Email" e expandir
```

### 2. Verificar Configuração

```
✅ "Confirm email" deve estar MARCADO
```

**Se não estiver marcado:**
- Marcar a opção
- Clicar em "Save"

✅ **Confirmação de email ativa!**

---

## 🧪 PASSO 3: Testar Sistema (3 minutos)

### Teste 1: Criar Conta

```
1. Abrir seu app
2. Clicar em "Criar conta"
3. Escolher "Leitor"
4. Preencher com EMAIL REAL:
   - Nome: Seu Nome
   - Data: 1990-01-01
   - Email: seu.email@gmail.com (use seu email!)
   - Senha: 123456
   - Confirmar: 123456
5. Clicar em "Criar Conta"
```

**Resultado:**
```
✅ Mensagem: "Conta criada! Verifique seu email"
```

### Teste 2: Confirmar Email

```
1. Abrir seu email
2. Procurar email do Supabase
   - De: noreply@supabase.io
   - Assunto: "Confirm Your Email"
3. Clicar no botão "Confirm your email"
```

**Resultado:**
```
✅ Página: "Email confirmed successfully"
```

### Teste 3: Fazer Login

```
1. Voltar ao app
2. Fazer login com:
   - Email: seu.email@gmail.com
   - Senha: 123456
```

**Resultado:**
```
✅ Login bem-sucedido!
✅ Você está dentro do app
```

### Teste 4: Recuperar Senha

```
1. Fazer logout
2. Clicar em "Esqueci minha senha"
3. Preencher:
   - Email: seu.email@gmail.com
   - Nome: Seu Nome
   - Data: 1990-01-01
   - Nova senha: nova123
   - Confirmar: nova123
4. Clicar em "Redefinir Senha"
```

**Resultado:**
```
✅ "Senha redefinida com sucesso!"
```

### Teste 5: Login com Nova Senha

```
1. Fazer login com:
   - Email: seu.email@gmail.com
   - Senha: nova123
```

**Resultado:**
```
✅ Login funcionando!
```

---

## ✅ Checklist Completo

### SQL
- [ ] Aberto SQL Editor
- [ ] Copiado SQL completo
- [ ] Executado SQL
- [ ] Visto "✅ CONFIGURAÇÃO COMPLETA!"
- [ ] funcao_criada = 1

### Email
- [ ] Acessado Authentication → Providers → Email
- [ ] Verificado "Confirm email" MARCADO ✅
- [ ] Salvo configuração (se alterou)

### Testes
- [ ] Criada conta com email real
- [ ] Recebido email de confirmação
- [ ] Clicado no link de confirmação
- [ ] Login bem-sucedido
- [ ] Testada recuperação de senha
- [ ] Login com nova senha funcionando

### Resultado
- [ ] ✅ Sistema 100% funcional!

---

## 🔍 Comandos de Verificação

### Verificar se função existe

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'update_user_password';
```

**Resultado esperado:**
```
routine_name: update_user_password
routine_type: FUNCTION
```

### Testar função

```sql
SELECT update_user_password('seu@email.com', 'senha123');
```

**Resultado esperado:**
```json
{"success": true, "user_id": "uuid-aqui"}
```

### Ver usuários

```sql
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅'
    ELSE '⏳'
  END as confirmado
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

---

## ⚠️ Resolução de Problemas

### Erro: "permission denied for extension pgcrypto"

**Solução:** Ignorar - a extensão já vem habilitada por padrão no Supabase.

### Erro: "function already exists"

**Solução:** Tudo bem! Significa que a função já foi criada. Prossiga.

### Não recebi email de confirmação

**Soluções:**
1. Verificar pasta de spam
2. Aguardar até 10 minutos
3. Verificar se digitou email corretamente
4. Confirmar manualmente via SQL:
   ```sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW(), confirmed_at = NOW()
   WHERE email = 'seu@email.com';
   ```

### Erro ao fazer login: "Email not confirmed"

**Isso é normal!** Significa que:
1. O sistema está funcionando corretamente
2. Você precisa confirmar o email primeiro
3. Siga os passos do Teste 2 acima

---

## 📊 Status Final

Após executar todos os passos:

```
✅ Função de reset de senha criada
✅ Confirmação de email ativa
✅ Sistema testado e funcionando
✅ Recuperação de senha operacional
✅ Fluxo completo validado

🎉 SISTEMA 100% OPERACIONAL!
```

---

## 📁 Próximos Passos

Após configuração:

1. ✅ Sistema está pronto para uso
2. ✅ Leia `/CONFIRMACAO_EMAIL_OBRIGATORIA.md` para entender o fluxo
3. ✅ Compartilhe instruções com usuários
4. ✅ Configure SMTP personalizado (opcional)
5. ✅ Personalize templates de email (opcional)

---

## 🆘 Suporte

**Problemas?** Entre em contato:

**Email:** suporte.pagefy@gmail.com  
**Assunto:** [Configuração Supabase] Sua dúvida

**Inclua:**
- Capturas de tela do erro
- Qual passo está travado
- Mensagens de erro completas

---

## 🎯 TL;DR (Resumão)

```bash
# 1. SQL Editor → Copiar SQL → Executar → Ver "✅ CONFIGURAÇÃO COMPLETA!"
# 2. Authentication → Providers → Email → Verificar "Confirm email" MARCADO
# 3. Testar: Criar conta → Confirmar email → Login → Funciona!
```

**Tempo total:** 5-10 minutos  
**Dificuldade:** Fácil  
**Resultado:** Sistema completo 🚀

---

**Versão:** 1.0  
**Data:** 12/11/2024  
**Status:** Pronto para execução
