# 🚨 EXECUTAR AGORA - Correção de Erros do Pagefy

## ❌ Erro Atual:
```
Could not find the 'cnpj' column of 'profiles' in the schema cache
```

**Causa:** As colunas `cnpj` e `birth_date` não existem na tabela `profiles` do banco de dados.

---

## ✅ SOLUÇÃO - Execute este SQL AGORA:

### Passo 1: Acesse o Supabase Dashboard
1. Abra https://supabase.com/dashboard
2. Selecione o projeto **Pagefy**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **+ New query**

### Passo 2: Copie e Cole o SQL
Copie TODO o conteúdo do arquivo `/MIGRATION_ADD_CNPJ_BIRTHDATE.sql` e cole no editor SQL.

**Ou copie diretamente daqui:**

```sql
-- Migration: Add CNPJ and Birth Date columns to profiles table
-- Data: 2024
-- Descrição: Adiciona campos cnpj e birth_date para recuperação de senha

-- Adiciona coluna birth_date se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='birth_date') THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
        RAISE NOTICE 'Coluna birth_date adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna birth_date já existe';
    END IF;
END $$;

-- Adiciona coluna cnpj se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='cnpj') THEN
        ALTER TABLE profiles ADD COLUMN cnpj VARCHAR(18);
        RAISE NOTICE 'Coluna cnpj adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna cnpj já existe';
    END IF;
END $$;

-- Adiciona índice para busca rápida por CNPJ
CREATE INDEX IF NOT EXISTS idx_profiles_cnpj ON profiles(cnpj);

-- Adiciona comentários nas colunas
COMMENT ON COLUMN profiles.birth_date IS 'Data de nascimento do usuário (usado para recuperação de senha de leitores)';
COMMENT ON COLUMN profiles.cnpj IS 'CNPJ da empresa (usado para recuperação de senha de publicadores)';

-- Exibe informações sobre as colunas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('birth_date', 'cnpj')
ORDER BY column_name;
```

### Passo 3: Execute
1. Clique em **Run** (botão no canto inferior direito)
2. Aguarde a confirmação de sucesso
3. Você deve ver uma mensagem como:
   ```
   ✅ Coluna birth_date adicionada com sucesso
   ✅ Coluna cnpj adicionada com sucesso
   ```

### Passo 4: Verifique
Você deve ver o resultado da query mostrando as duas colunas:

| column_name | data_type        | is_nullable | column_default |
|-------------|------------------|-------------|----------------|
| birth_date  | date             | YES         | NULL           |
| cnpj        | character varying| YES         | NULL           |

---

## 🔧 Configuração Adicional (OPCIONAL mas RECOMENDADO)

### Desabilitar Confirmação de Email:

1. No Supabase Dashboard, vá em **Authentication**
2. Clique em **Providers**
3. Clique em **Email**
4. **Desabilite** a opção **"Confirm email"**
5. Clique em **Save**

Isso vai resolver o erro:
```
Login error: AuthApiError: Email not confirmed
```

---

## 🧪 Teste Depois de Executar o SQL

### Teste 1: Criar Conta de Leitor
```
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a aplicação (F5)
3. Clique em "Criar Conta"
4. Selecione "Leitor"
5. Preencha todos os campos incluindo Data de Nascimento
6. Clique em "Criar Conta"
7. ✅ Deve mostrar: "Conta criada com sucesso!"
8. ✅ Faça login
```

### Teste 2: Criar Conta de Publicador
```
1. Clique em "Criar Conta"
2. Selecione "Publicador"
3. Preencha Nome da Empresa
4. Preencha CNPJ: 12.345.678/0001-90
5. Preencha Email e Senha
6. Clique em "Solicitar Conta Corporativa"
7. ✅ Deve mostrar: "Solicitação enviada!"
8. ✅ Faça login (terá acesso de leitor até aprovação)
```

---

## 📊 Logs Esperados (Console do Navegador - F12)

### ✅ Logs Corretos (Depois da Migration):
```
[App] handleSignup called with: { name, email, accountType, cnpj, birthDate }
[Auth Service] signUp called with: { name, email, accountType, cnpj, birthDate }
[Auth] Server signup failed, using fallback method: Failed to fetch (NORMAL)
[Auth] Using direct Supabase signup...
[Auth] Could not auto-confirm email (admin API not available): User not allowed (NORMAL)
[Auth] Adding birth_date to profile: YYYY-MM-DD
[Auth] Adding CNPJ to profile: XX.XXX.XXX/XXXX-XX
[Auth] Profile insert data: { id, name, email, role, birth_date, cnpj, ... }
[Auth] Profile created successfully: { ... }
✅ Toast: "Conta criada com sucesso!"
```

### ❌ Logs de Erro (Se ainda houver problema):
```
[Auth] Profile creation error: { "code": "PGRST204", ... }
```
**Solução:** Execute o SQL novamente

---

## 🔴 Problemas Conhecidos e Soluções

### Erro: "User already registered"
**Causa:** Tentativa anterior criou o usuário no auth, mas falhou ao criar o perfil.

**Solução:**
1. Use outro email, OU
2. Delete o usuário no Supabase:
   - Dashboard → Authentication → Users
   - Encontre o usuário com erro
   - Clique nos três pontos (...)
   - Clique em "Delete user"

### Erro: "No birthDate provided!" (para publicadores)
**Causa:** Este é apenas um aviso. Publicadores não precisam de data de nascimento.

**Status:** ✅ Normal e esperado

### Erro: "Server signup failed, using fallback method"
**Causa:** Edge Function não está disponível.

**Status:** ✅ Normal e esperado - usa fallback

### Erro: "Could not auto-confirm email (admin API not available)"
**Causa:** Admin API não funciona no client-side.

**Status:** ✅ Normal - configure no Dashboard (passo opcional acima)

---

## 📋 Checklist Final

- [ ] ✅ Executei o SQL no Supabase Dashboard
- [ ] ✅ Vi confirmação: "Coluna birth_date adicionada"
- [ ] ✅ Vi confirmação: "Coluna cnpj adicionada"
- [ ] ✅ Recarreguei a aplicação (F5)
- [ ] ✅ Criei conta de leitor com sucesso
- [ ] ✅ Criei conta de publicador com sucesso
- [ ] ✅ Testei login com sucesso
- [ ] 🔧 (Opcional) Desabilitei confirmação de email no Dashboard

---

## 🆘 Ainda Com Problemas?

Se após executar o SQL você ainda tiver erros:

1. **Verifique se o SQL foi executado:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
     AND column_name IN ('birth_date', 'cnpj');
   ```
   Deve retornar 2 linhas.

2. **Limpe o cache do Supabase:**
   - No SQL Editor, execute:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

3. **Reinicie a aplicação:**
   - Feche a aba
   - Abra novamente
   - Ou pressione Ctrl+Shift+R (hard reload)

---

**Data:** 2024  
**Status:** 🚨 URGENTE - Execute o SQL para resolver os erros  
**Tempo estimado:** 2 minutos
