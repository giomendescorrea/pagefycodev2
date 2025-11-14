# 🚨 EXECUTAR AGORA - Correção de Senha

## ⚡ 1 Minuto para Corrigir

### Passo 1: Abrir Supabase
1. Acesse: https://supabase.com/dashboard
2. Escolha seu projeto Pagefy

### Passo 2: SQL Editor
1. Menu lateral → **SQL Editor**
2. Click em **New query**

### Passo 3: Copiar e Colar
```sql
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date DATE;
    RAISE NOTICE 'Coluna birth_date adicionada';
  END IF;
END $$;
```

### Passo 4: Executar
1. Click em **Run** (ou Ctrl+Enter)
2. Aguardar mensagem de sucesso

### Passo 5: Verificar
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'birth_date';
```

**Resultado esperado:**
```
birth_date | date
```

---

## ✅ Pronto!

Agora teste:
1. Cadastrar um leitor novo
2. Usar "Esqueci minha senha"
3. Preencher nome + data de nascimento
4. Redefinir senha com sucesso!

---

## 🎉 Sistema Corrigido

- ✅ Erro 404 resolvido
- ✅ Validação de nome e data funcionando
- ✅ Logs detalhados ativos
- ✅ Documentação completa

**Status:** 🟢 Pronto para uso!
