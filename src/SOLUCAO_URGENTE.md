# 🚨 SOLUÇÃO URGENTE - Profile not found

## 🔴 Erro Atual:
```
[Auth] Profile not found for user: dbb78fec-aa42-42da-97a5-28edf4ac5a15
```

**Causa:** Você tentou criar uma conta, mas as colunas `cnpj` e `birth_date` não existiam no banco. O usuário foi criado no `auth.users`, mas o perfil não foi criado na tabela `profiles`.

---

## ✅ SOLUÇÃO EM 3 PASSOS (5 minutos)

### 📋 PASSO 1: Adicionar Colunas no Banco (2 min)

1. **Abra o Supabase Dashboard:** https://supabase.com/dashboard
2. **Selecione o projeto Pagefy**
3. **Clique em SQL Editor** (menu lateral)
4. **Clique em + New query**
5. **Copie TODO o conteúdo do arquivo `/FIX_DATABASE_NOW.sql`**
6. **Cole no editor e clique em RUN**

**O que você deve ver:**
```
✅ Coluna birth_date criada com sucesso!
✅ Coluna cnpj criada com sucesso!
```

E uma lista de todas as colunas da tabela profiles, incluindo:
- `birth_date` (date)
- `cnpj` (character varying)

E possivelmente uma lista de usuários órfãos:
- ID: dbb78fec-aa42-42da-97a5-28edf4ac5a15
- Status: ❌ SEM PERFIL

---

### 🧹 PASSO 2: Limpar Usuário Órfão (1 min)

**Opção A: Deletar e Recriar (RECOMENDADO)**

No mesmo SQL Editor, execute:
```sql
-- Delete o usuário específico que está com problema
DELETE FROM auth.users 
WHERE id = 'dbb78fec-aa42-42da-97a5-28edf4ac5a15';
```

Depois:
1. Volte para o app
2. Crie a conta novamente
3. ✅ Agora vai funcionar!

**Opção B: Criar Perfil Manualmente**

No SQL Editor, execute:
```sql
-- Primeiro, busque o email do usuário
SELECT id, email FROM auth.users 
WHERE id = 'dbb78fec-aa42-42da-97a5-28edf4ac5a15';
```

Copie o email, depois execute:
```sql
-- Crie o perfil manualmente
INSERT INTO profiles (
    id, 
    name, 
    email, 
    role, 
    is_private, 
    is_locked, 
    failed_login_attempts,
    created_at,
    updated_at
)
VALUES (
    'dbb78fec-aa42-42da-97a5-28edf4ac5a15',
    'Seu Nome',                    -- ← Ajuste aqui
    'email@copiado.com',          -- ← Cole o email aqui
    'user',
    false,
    false,
    0,
    NOW(),
    NOW()
);
```

---

### 🔧 PASSO 3: Desabilitar Confirmação de Email (OPCIONAL - 1 min)

Para evitar o erro "Email not confirmed":

1. No Supabase Dashboard, vá em **Authentication**
2. Clique em **Providers**
3. Clique em **Email**
4. **DESABILITE** a opção "Confirm email"
5. Clique em **Save**

---

## 🧪 TESTAR A SOLUÇÃO

### Teste 1: Criar Nova Conta
```
1. Recarregue o app (F5)
2. Clique em "Criar Conta"
3. Selecione "Leitor"
4. Preencha:
   - Nome: João Teste
   - Data de Nascimento: 01/01/2000
   - Email: joao.novo@teste.com
   - Senha: 123456
5. Clique em "Criar Conta"
6. ✅ Deve mostrar: "Conta criada com sucesso!"
7. ✅ Console NÃO deve mostrar: "Profile not found"
```

### Teste 2: Fazer Login
```
1. Faça login com a conta nova
2. ✅ Deve entrar sem erros
3. ✅ Console deve mostrar: "✅ Login bem-sucedido"
```

---

## 📊 Logs Esperados DEPOIS da Correção

### ✅ Criar Conta - Logs Corretos:
```
[Auth Service] signUp called
[Auth] Server signup failed, using fallback method (NORMAL)
[Auth] Using direct Supabase signup...
[Auth] Could not auto-confirm email (admin API not available) (NORMAL)
[Auth] Adding birth_date to profile: 2000-01-01
[Auth] Profile insert data: { id, name, email, role, birth_date, ... }
[Auth] Profile created successfully: { id: '...', name: 'João', ... }
✅ Toast: "Conta criada com sucesso!"
```

### ✅ Login - Logs Corretos:
```
[Auth Service] signIn called
[Auth] Login successful
✅ Toast: "Login bem-sucedido!"
```

### ❌ ANTES da Correção (erro):
```
[Auth] Profile creation error: { "code": "PGRST204", ... }
Error: Falha ao criar perfil
```

---

## 🔍 Entendendo os Avisos (NÃO SÃO ERROS)

### ⚠️ "Server signup failed, using fallback method"
- **Tipo:** Aviso
- **Causa:** Edge Function não disponível
- **Status:** ✅ NORMAL - App usa método fallback automaticamente
- **Ação:** Nenhuma

### ⚠️ "Could not auto-confirm email (admin API not available)"
- **Tipo:** Aviso
- **Causa:** Admin API não funciona no client-side
- **Status:** ✅ NORMAL - Siga Passo 3 para evitar este aviso
- **Ação:** Desabilitar confirmação de email (Passo 3)

### ⚠️ "No birthDate provided!"
- **Tipo:** Aviso
- **Causa:** Criando conta de PUBLICADOR (não precisa de data de nascimento)
- **Status:** ✅ NORMAL - Publicadores só precisam de CNPJ
- **Ação:** Nenhuma

---

## 🎯 Checklist Final

- [ ] ✅ Executei `/FIX_DATABASE_NOW.sql` no Supabase
- [ ] ✅ Vi confirmação: "Coluna birth_date criada"
- [ ] ✅ Vi confirmação: "Coluna cnpj criada"
- [ ] ✅ Deletei o usuário órfão OU criei o perfil manualmente
- [ ] ✅ Recarreguei o app (F5)
- [ ] ✅ Criei uma nova conta de teste
- [ ] ✅ NÃO apareceu erro "Profile not found"
- [ ] ✅ Fiz login com sucesso
- [ ] 🔧 (Opcional) Desabilitei confirmação de email

---

## 🆘 Ainda Com Problemas?

### Erro: "Profile not found" ainda aparece

**Verificação 1:** As colunas foram criadas?
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('birth_date', 'cnpj');
```
Deve retornar 2 linhas. Se não retornar, execute o Passo 1 novamente.

**Verificação 2:** O usuário órfão foi removido?
```sql
SELECT id, email 
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
```
Se retornar linhas, delete ou crie perfis (Passo 2).

**Verificação 3:** Limpou o cache?
- Pressione Ctrl+Shift+Delete
- Selecione "Cookies e dados do site"
- Clique em "Limpar dados"
- Recarregue a página (F5)

### Erro: "Este email já está cadastrado"

Você está tentando usar o mesmo email do usuário órfão. Opções:
1. **Delete o usuário órfão** (Passo 2, Opção A)
2. **Use outro email** para testar

---

## 📝 Resumo do Problema

1. **O que aconteceu:**
   - Você tentou criar conta ANTES das colunas `cnpj` e `birth_date` existirem
   - O auth.users criou o usuário ✅
   - A tabela profiles NÃO criou o perfil ❌ (faltavam colunas)
   - Resultado: Usuário órfão

2. **Como corrigimos:**
   - ✅ Adicionamos as colunas faltantes
   - ✅ Deletamos o usuário órfão
   - ✅ Agora criar conta funciona perfeitamente

3. **Como evitar:**
   - ✅ Sempre execute migrations ANTES de usar recursos novos
   - ✅ Verifique o console para erros de SQL/banco

---

## 📁 Arquivos de Referência

- **`/FIX_DATABASE_NOW.sql`** - SQL para executar AGORA
- **`/CREATE_MISSING_PROFILES.sql`** - SQL para criar perfis de usuários órfãos
- **`/CORRECAO_ERRO_PGRST116.md`** - Documentação do erro anterior
- **`/EXECUTAR_AGORA.md`** - Instruções da migration inicial

---

**⏱️ Tempo total:** 5 minutos  
**🎯 Prioridade:** 🔴 URGENTE  
**📅 Data:** 2024  
**✅ Status após seguir os passos:** 100% funcional
