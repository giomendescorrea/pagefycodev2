# 🔥 RESOLUÇÃO RÁPIDA - Solicitações de Desbloqueio

## Problema
Usuários bloqueados não aparecem na aba de solicitações de desbloqueio no AdminPanel.

## Causa
A foreign key na tabela `unlock_requests` estava apontando para `auth.users` em vez de `profiles`.

## ✅ Solução em 3 Passos

### 1️⃣ Deletar tabela antiga (se existir)

Abra o **SQL Editor** no Supabase e execute:

```sql
-- Remove todas as policies
DROP POLICY IF EXISTS "Users can create unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Users can view own unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Admins can view all unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Admins can update unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Admins can delete unlock requests" ON unlock_requests;

-- Remove a tabela
DROP TABLE IF EXISTS unlock_requests CASCADE;
```

### 2️⃣ Criar tabela corrigida

Execute o conteúdo completo do arquivo **`MIGRATION_UNLOCK_REQUESTS.sql`**

### 3️⃣ Testar

1. Tente fazer login com senha incorreta 5 vezes
2. Conta será bloqueada
3. Entre como admin no AdminPanel
4. Vá em **Solicitações → Desbloqueio**
5. A solicitação deve aparecer!

## ✨ Pronto!

Agora o sistema está funcionando perfeitamente.

---

**Arquivo Detalhado:** `/CORRECAO_SOLICITACOES_DESBLOQUEIO.md`  
**Migration Corrigida:** `/MIGRATION_UNLOCK_REQUESTS.sql`
