# 🚀 Guia Rápido: Configuração de Data de Nascimento

## ⚡ Executar AGORA no Supabase

### 1. Acessar SQL Editor
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### 2. Executar Migration
Copie e cole o código abaixo no editor SQL e clique em **Run**:

```sql
-- Adicionar coluna birth_date se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date DATE;
    RAISE NOTICE 'Coluna birth_date adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna birth_date já existe';
  END IF;
END $$;
```

### 3. Verificar
Execute este comando para confirmar que a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'birth_date';
```

**Resultado esperado:**
```
column_name | data_type | is_nullable
------------|-----------|-------------
birth_date  | date      | YES
```

## ✅ Pronto!

Agora o sistema está configurado para:
- ✅ Salvar data de nascimento no cadastro de leitores
- ✅ Validar data de nascimento na recuperação de senha
- ✅ Exigir nome completo + data de nascimento para reset de senha

## 🔍 Como Testar

### Teste 1: Novo Cadastro
1. Criar conta como **Leitor**
2. Preencher nome e data de nascimento
3. Verificar no Supabase → Table Editor → profiles
4. Confirmar que `birth_date` foi salvo

### Teste 2: Recuperação de Senha
1. Na tela de login, clicar em **Esqueci minha senha**
2. Digitar email do leitor
3. Preencher nome completo (exato)
4. Preencher data de nascimento (exata)
5. Definir nova senha
6. ✅ Senha redefinida!

### Teste 3: Validação de Dados
1. Tentar recuperar senha com nome diferente → ❌ Deve falhar
2. Tentar recuperar senha com data diferente → ❌ Deve falhar
3. Usar dados corretos → ✅ Deve funcionar

## 📋 Checklist

- [ ] Migration executada no Supabase
- [ ] Coluna `birth_date` criada na tabela `profiles`
- [ ] Testado cadastro de novo leitor com data de nascimento
- [ ] Testado recuperação de senha com dados corretos
- [ ] Testado recuperação de senha com dados incorretos

## ⚠️ Importante

**Usuários cadastrados ANTES desta atualização:**
- Podem não ter `birth_date` no perfil
- Receberão mensagem: "Perfil incompleto. Por favor, entre em contato com o suporte."
- Solução: Adicionar campo para atualizar perfil OU pedir que criem nova conta

**Segurança:**
- A data de nascimento é armazenada de forma segura
- Validação case-insensitive para o nome (mais flexível)
- Validação exata para a data (mais seguro)
- Logs detalhados para debugging

## 🐛 Troubleshooting

### Erro: "Perfil incompleto"
**Causa:** Usuário cadastrado antes da atualização não tem `birth_date`

**Solução 1 - SQL Manual:**
```sql
UPDATE profiles
SET birth_date = '2000-01-01'  -- Data de nascimento do usuário
WHERE email = 'usuario@email.com';
```

**Solução 2 - Recriar conta:**
1. Deletar conta antiga (se possível)
2. Cadastrar novamente com data de nascimento

### Erro 404 no reset de senha
**Causa:** URL da função Supabase incorreta

**Verificação:**
1. Conferir que a pasta é `/supabase/functions/make-server`
2. Conferir que `SERVER_URL` em `/services/password-reset.ts` usa `make-server`
3. Conferir que os endpoints no Hono não têm prefixo duplicado

### Data não salva no cadastro
**Causa:** Campo não está sendo enviado corretamente

**Verificação:**
1. Abrir DevTools → Network
2. Fazer cadastro de leitor
3. Verificar payload do POST para `/signup`
4. Deve conter: `{ name, email, password, accountType: 'reader', birthDate: 'YYYY-MM-DD' }`

## 📞 Suporte

Se encontrar problemas:
1. Verificar console do navegador (F12)
2. Verificar logs do Supabase Functions
3. Verificar dados na tabela `profiles`
4. Consultar `/README_BIRTH_DATE.md` para mais detalhes
