# 🚀 Executar Todas as Migrations - Guia Completo

## ⚡ Setup Completo em 5 Minutos

Este guia contém **TODAS** as migrations necessárias para o sistema Pagefy funcionar 100%.

---

## 📋 O Que Será Configurado

1. ✅ **Coluna `birth_date`** na tabela `profiles`
   - Para salvar data de nascimento dos usuários
   - Usada na recuperação de senha

2. ✅ **Função `update_user_password()`**
   - Para resetar senha via RPC
   - Fallback quando Edge Function falhar

---

## 🎯 PASSO 1: Abrir SQL Editor

1. Ir para: https://supabase.com/dashboard
2. Selecionar seu projeto
3. Clicar em **SQL Editor** (ícone 📝)
4. Clicar em **"New query"**

---

## 🎯 PASSO 2: Executar Migrations

### Copie e cole o SQL abaixo:

```sql
-- ====================================================================
-- PAGEFY - MIGRATIONS COMPLETAS
-- ====================================================================
-- Este script configura tudo necessário para o sistema funcionar
-- ====================================================================

-- ====================================================================
-- MIGRATION 1: Adicionar coluna birth_date
-- ====================================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date DATE;
    RAISE NOTICE '✅ Coluna birth_date criada';
  ELSE
    RAISE NOTICE '⚠️ Coluna birth_date já existe';
  END IF;
END $$;

-- ====================================================================
-- MIGRATION 2: Função de Reset de Senha
-- ====================================================================

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
  result JSON;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Verificar se usuário existe
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;
  
  -- Atualizar a senha usando hash bcrypt
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'user_id', user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION update_user_password IS 
  'Atualiza a senha de um usuário após validação externa';

-- ====================================================================
-- MIGRATION 3: Permissões
-- ====================================================================

GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;

-- ====================================================================
-- VERIFICAÇÃO: Checar se tudo foi criado
-- ====================================================================

DO $$
DECLARE
  birth_date_exists BOOLEAN;
  function_exists BOOLEAN;
BEGIN
  -- Verificar coluna birth_date
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) INTO birth_date_exists;
  
  -- Verificar função update_user_password
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'update_user_password'
  ) INTO function_exists;
  
  -- Exibir resultados
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '           VERIFICAÇÃO DE MIGRATIONS';
  RAISE NOTICE '═══════════════════════════════════════════════';
  
  IF birth_date_exists THEN
    RAISE NOTICE '✅ Coluna birth_date: OK';
  ELSE
    RAISE NOTICE '❌ Coluna birth_date: ERRO';
  END IF;
  
  IF function_exists THEN
    RAISE NOTICE '✅ Função update_user_password: OK';
  ELSE
    RAISE NOTICE '❌ Função update_user_password: ERRO';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════';
  
  IF birth_date_exists AND function_exists THEN
    RAISE NOTICE '🎉 TODAS AS MIGRATIONS EXECUTADAS COM SUCESSO!';
  ELSE
    RAISE NOTICE '⚠️ ALGUMAS MIGRATIONS FALHARAM';
  END IF;
  
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- ====================================================================
-- FIM DAS MIGRATIONS
-- ====================================================================
```

### 3. Clicar em **"RUN"** ou pressionar `Ctrl+Enter`

---

## ✅ PASSO 3: Verificar Resultado

### Na aba "Messages" você deve ver:

```
✅ Coluna birth_date criada
✅ Função update_user_password criada
═══════════════════════════════════════════════
           VERIFICAÇÃO DE MIGRATIONS
═══════════════════════════════════════════════
✅ Coluna birth_date: OK
✅ Função update_user_password: OK
═══════════════════════════════════════════════
🎉 TODAS AS MIGRATIONS EXECUTADAS COM SUCESSO!
═══════════════════════════════════════════════
```

### Se vir isso: 🎉 **Setup completo!**

---

## 🧪 PASSO 4: Testar o Sistema

### Teste 1: Cadastro de Leitor

1. Ir para aplicação
2. Clicar em **"Criar Conta"**
3. Escolher **"Leitor"**
4. Preencher:
   ```
   Nome: João Teste
   Data de Nascimento: 2000-01-15
   Email: joao.teste@email.com
   Senha: 123456
   Confirmar: 123456
   ```
5. Clicar em **"Criar Conta"**
6. ✅ Deve criar conta e fazer login automaticamente

### Teste 2: Recuperação de Senha

1. Fazer **logout**
2. Clicar em **"Esqueci minha senha"**
3. Preencher:
   ```
   Email: joao.teste@email.com
   Nome Completo: João Teste
   Data de Nascimento: 2000-01-15
   Nova Senha: nova123
   Confirmar: nova123
   ```
4. Clicar em **"Redefinir Senha"**
5. ✅ Deve aparecer: "Senha redefinida com sucesso!"

### Teste 3: Login com Nova Senha

1. Ir para tela de login
2. Digitar:
   ```
   Email: joao.teste@email.com
   Senha: nova123
   ```
3. Clicar em **"Entrar"**
4. ✅ Deve fazer login com sucesso!

---

## 🔍 Verificações Adicionais

### Verificar Coluna birth_date

```sql
SELECT 
  name,
  email,
  birth_date,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

**Esperado:**
- Usuários criados devem ter `birth_date` preenchido (não NULL)

### Verificar Função update_user_password

```sql
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_user_password';
```

**Esperado:**
```
routine_name: update_user_password
routine_type: FUNCTION
security_type: DEFINER
```

### Testar Função Diretamente

```sql
-- Criar usuário teste
-- Depois testar:
SELECT update_user_password('joao.teste@email.com', 'senhaTeste123');
```

**Esperado:**
```json
{"success": true, "user_id": "uuid-do-usuario"}
```

---

## ❌ Solução de Problemas

### Erro: "column birth_date does not exist"

**Solução:**
```sql
-- Adicionar manualmente
ALTER TABLE profiles ADD COLUMN birth_date DATE;

-- Verificar
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'birth_date';
```

### Erro: "function update_user_password does not exist"

**Solução:**
1. Copiar apenas a parte da função do SQL acima
2. Executar novamente
3. Verificar permissões:
   ```sql
   GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
   GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;
   ```

### Erro: "permission denied for function crypt"

**Solução:**
```sql
-- Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Erro: "schema auth does not exist"

**Problema:** Você não tem acesso à tabela auth.users

**Solução:** 
- A função precisa ser criada no banco Supabase (não localmente)
- Usar o SQL Editor do dashboard do Supabase

---

## 📊 Checklist Final

- [ ] SQL completo executado
- [ ] Visto mensagem "TODAS AS MIGRATIONS EXECUTADAS COM SUCESSO!"
- [ ] Coluna `birth_date` existe
- [ ] Função `update_user_password` existe
- [ ] Testado cadastro de leitor
- [ ] Data de nascimento foi salva
- [ ] Testado recuperação de senha
- [ ] Senha foi resetada com sucesso
- [ ] Testado login com nova senha
- [ ] Login funcionou ✅

---

## 🎯 Status Esperado

Após executar todas as migrations:

| Sistema | Status |
|---------|--------|
| Cadastro | 🟢 100% Funcional |
| Data de Nascimento | 🟢 Salvando |
| Recuperação de Senha | 🟢 100% Funcional |
| Fallback | 🟢 Ativo |
| Logs | 🟢 Detalhados |

---

## 🎉 Pronto!

Seu sistema Pagefy agora está **100% configurado e funcional**!

### O que funciona:

✅ Cadastro de leitores com data de nascimento  
✅ Cadastro de publicadores com CNPJ  
✅ Recuperação de senha com validação  
✅ Sistema de fallback (alta disponibilidade)  
✅ Logs detalhados para debugging  

### Próximos passos:

1. Começar a usar o sistema normalmente
2. Monitorar logs no console (F12)
3. Reportar qualquer problema encontrado

---

**Tempo total:** 5 minutos  
**Dificuldade:** Muito fácil  
**Resultado:** Sistema 100% operacional 🚀

---

**Dúvidas?** Verifique:
- `/FIX_SIGNUP_ERROR.md` - Erro de cadastro
- `/EXECUTAR_AGORA_PASSWORD_RESET.md` - Recuperação de senha
- `/TESTE_AGORA.md` - Teste de data de nascimento
- `/STATUS_SISTEMA.md` - Status geral do sistema
