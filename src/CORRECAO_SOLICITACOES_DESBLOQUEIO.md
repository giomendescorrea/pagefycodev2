# 🔧 CORREÇÃO: Solicitações de Desbloqueio Não Aparecem

## Problema Identificado

Os usuários bloqueados não estavam aparecendo na aba de solicitações de desbloqueio no AdminPanel.

### Causa Raiz

A migration SQL original (`MIGRATION_UNLOCK_REQUESTS.sql`) criava uma foreign key apontando para `auth.users(id)`, mas o código TypeScript (`/services/unlock-requests.ts`) tentava fazer um JOIN com a tabela `profiles` usando o nome da foreign key `unlock_requests_user_id_fkey`, que não existia.

Isso causava falha na query SQL, fazendo com que nenhuma solicitação fosse retornada.

## Solução Aplicada

A migration foi corrigida para:
1. Criar a tabela `unlock_requests` sem foreign key inicialmente
2. Adicionar explicitamente a foreign key com o nome `unlock_requests_user_id_fkey` apontando para `profiles(id)`
3. Isso permite que o JOIN no código funcione corretamente

## ⚠️ IMPORTANTE - AÇÃO NECESSÁRIA

### Se você já executou a migration antiga:

Você precisa **recriar a tabela** no Supabase para aplicar a correção. Siga estes passos:

#### Passo 1: Deletar a tabela existente

No SQL Editor do Supabase, execute:

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

#### Passo 2: Executar a migration corrigida

Agora execute todo o conteúdo do arquivo `MIGRATION_UNLOCK_REQUESTS.sql` (que já está corrigido).

### Se você ainda NÃO executou a migration:

Simplesmente execute o arquivo `MIGRATION_UNLOCK_REQUESTS.sql` normalmente. Ele já está corrigido.

## Como Testar

1. **Bloqueie uma conta de teste:**
   - Tente fazer login com senha incorreta 5 vezes seguidas
   - A conta será bloqueada automaticamente

2. **Verifique o AdminPanel:**
   - Faça login como administrador
   - Vá para "Solicitações → Desbloqueio"
   - Você deverá ver a solicitação automática criada

3. **Aprove o desbloqueio:**
   - Clique em "Desbloquear" na solicitação
   - A conta deve ser desbloqueada e o usuário poderá fazer login novamente

## Verificação da Foreign Key

Para confirmar que a foreign key está correta, execute no SQL Editor:

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'unlock_requests';
```

Resultado esperado:
- `constraint_name`: `unlock_requests_user_id_fkey`
- `table_name`: `unlock_requests`
- `column_name`: `user_id`
- `foreign_table_name`: `profiles`
- `foreign_column_name`: `id`

## Fluxo Completo do Sistema

1. **Tentativa de Login Falha:**
   - Usuário erra senha → contador incrementa
   - 5 tentativas → conta bloqueada (`is_locked = true`)
   - Solicitação de desbloqueio criada automaticamente

2. **Administrador Visualiza:**
   - Entra no AdminPanel
   - Vê solicitação em "Solicitações → Desbloqueio"
   - Informações mostradas: nome, email, motivo, data

3. **Administrador Aprova:**
   - Clica em "Desbloquear"
   - Conta desbloqueada (`is_locked = false`, `failed_login_attempts = 0`)
   - Usuário pode fazer login normalmente

## Arquivos Modificados

- ✅ `/MIGRATION_UNLOCK_REQUESTS.sql` - Corrigida foreign key
- ℹ️ `/services/unlock-requests.ts` - Nenhuma alteração necessária (já estava correto)
- ℹ️ `/components/AdminPanel.tsx` - Nenhuma alteração necessária (já estava correto)
- ℹ️ `/services/auth.ts` - Nenhuma alteração necessária (já estava correto)

## Conclusão

Após aplicar a correção da migration, o sistema de solicitações de desbloqueio funcionará perfeitamente:
- ✅ Criação automática de solicitações ao bloquear conta
- ✅ Visualização correta no AdminPanel
- ✅ Aprovação/rejeição funcional
- ✅ Desbloqueio automático ao aprovar

---

**Data da Correção:** 10/11/2025  
**Arquivo de Migration:** MIGRATION_UNLOCK_REQUESTS.sql  
**Status:** ✅ Corrigido
