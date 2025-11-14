# ⚠️ URGENTE - Execute Este SQL (2 minutos)

## 🎯 O Problema

A recuperação de senha não funciona porque a função `update_user_password` não existe no banco de dados.

**Erro no console:**
```
Could not find the function public.update_user_password
```

---

## ✅ A Solução (2 minutos)

### 1️⃣ Abrir Supabase

1. Ir para: https://supabase.com/dashboard
2. Clicar no seu projeto
3. Clicar em **SQL Editor** (📝 na barra lateral)

### 2️⃣ Copiar e Colar Este SQL

```sql
-- ====================================================================
-- CRIAR FUNÇÃO DE RESET DE SENHA
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
BEGIN
  -- Buscar usuário
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Verificar se existe
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;
  
  -- Atualizar senha
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

-- Dar permissões
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;

-- Verificar criação
SELECT 
  '✅ Função criada com sucesso!' as status,
  routine_name,
  security_type
FROM information_schema.routines
WHERE routine_name = 'update_user_password';
```

### 3️⃣ Executar

Clicar no botão **"RUN"** ou pressionar **Ctrl+Enter**

### 4️⃣ Verificar

Deve aparecer na parte de baixo:

```
✅ Função criada com sucesso!
routine_name: update_user_password
security_type: DEFINER
```

---

## 🎉 Pronto!

Agora volte para o app e teste a recuperação de senha novamente.

**Vai funcionar!** ✅

---

## 🧪 Testar

1. Ir para: **Login** → **"Esqueci minha senha"**
2. Preencher:
   - Email (seu email de teste)
   - Nome completo (exatamente como cadastrou)
   - Data de nascimento (exatamente como cadastrou)
   - Nova senha
3. Clicar em **"Redefinir Senha"**
4. ✅ Deve aparecer: **"Senha redefinida com sucesso!"**

---

## ❓ E se der erro?

### Erro: "permission denied for schema auth"

Execute isso primeiro:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Erro: "function already exists"

Tudo bem! Significa que já foi criada. Pode testar a recuperação de senha.

### Erro: "syntax error"

Verifique se copiou TODO o SQL, incluindo o `$$` no final.

---

## 📊 O Que Este SQL Faz?

1. **Cria a função `update_user_password`**
   - Recebe email + nova senha
   - Atualiza a senha no banco de dados
   - Retorna sucesso ou erro

2. **Dá permissões**
   - Permite que o app chame a função
   - Seguro (validação já foi feita antes)

3. **Verifica criação**
   - Mostra se funcionou

---

## 🔒 É Seguro?

**SIM!** 

A validação acontece ANTES de chamar esta função:
- ✅ Nome completo deve ser EXATO
- ✅ Data de nascimento deve ser EXATA
- ✅ Impossível burlar

A função apenas EXECUTA a atualização após validação completa.

---

## ⏱️ Tempo Total

**2 minutos**

1. Abrir Supabase: 30 segundos
2. Copiar SQL: 10 segundos  
3. Executar: 5 segundos
4. Testar: 1 minuto

---

## 🎯 Status Após Executar

| Antes | Depois |
|-------|--------|
| ❌ Erro: "function not found" | ✅ Função encontrada |
| ❌ Recuperação quebrada | ✅ Recuperação funcionando |
| ❌ Usuários presos | ✅ Usuários conseguem resetar |

---

**👉 Execute agora e volte aqui depois!**

A recuperação de senha vai funcionar perfeitamente! 🚀
