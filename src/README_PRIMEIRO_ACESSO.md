# 🚀 Bem-vindo ao Pagefy!

## ⚡ Configuração Rápida (2 minutos)

Antes de usar o sistema, você precisa executar **1 comando SQL** no Supabase.

---

## 📋 Passo a Passo

### 1. Abrir Supabase
- Ir para: https://supabase.com/dashboard
- Clicar no seu projeto
- Clicar em **SQL Editor** (📝)

### 2. Executar Este SQL

Copie e cole:

```sql
-- Criar função de reset de senha
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
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não encontrado');
  END IF;
  
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  RETURN json_build_object('success', true, 'user_id', user_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;
```

### 3. Clicar em RUN

Deve aparecer: **"Success. No rows returned"**

---

## ✅ Pronto!

Agora tudo funciona:
- ✅ Cadastro de usuários
- ✅ Login
- ✅ Recuperação de senha

---

## 🆘 Se der erro

Execute antes:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

**Tempo:** 2 minutos  
**Dificuldade:** Muito fácil  
**Resultado:** Sistema 100% funcional
