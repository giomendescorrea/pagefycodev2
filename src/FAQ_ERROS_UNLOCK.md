# ❓ FAQ - Perguntas Frequentes sobre os Erros de Unlock Requests

**Última atualização:** 10/11/2025

---

## 🔴 Erros

### P: O que significa o erro PGRST200?
**R:** Significa que o Supabase não consegue encontrar a relação (foreign key) entre `unlock_requests` e `profiles`. Isso acontece porque:
1. A tabela `unlock_requests` ainda não foi criada, OU
2. A foreign key não foi criada corretamente

**Solução:** Execute a migration `/MIGRATION_UNLOCK_REQUESTS.sql`

---

### P: O que significa o erro 42501?
**R:** É um erro de RLS (Row Level Security) que significa "nova linha viola política de segurança". Isso acontece quando:
1. As políticas de RLS são muito restritivas, OU
2. O usuário não tem permissão para inserir dados

**Solução:** A migration corrigida tem políticas RLS adequadas que resolvem este problema.

---

### P: Por que vejo "ACCOUNT_LOCKED" no console?
**R:** Isso NÃO é um erro! É uma mensagem normal do sistema indicando que uma conta foi bloqueada. Você vê isso quando:
- Um usuário erra a senha 5 vezes
- O sistema bloqueia a conta automaticamente

**Ação:** Nenhuma. Isso é o comportamento esperado.

---

### P: Por que vejo "ACCOUNT_LOCKED_NOW" no console?
**R:** Também NÃO é um erro! Significa que uma conta acabou de ser bloqueada (neste exato momento). É diferente de "ACCOUNT_LOCKED" que indica que a conta já estava bloqueada.

**Ação:** Nenhuma. Isso indica que o sistema de bloqueio está funcionando.

---

## 🔧 Migration

### P: Preciso executar a migration mesmo se já executei antes?
**R:** **SIM!** A migration foi corrigida com novas políticas RLS. Execute novamente para aplicar as correções.

---

### P: A migration vai apagar meus dados existentes?
**R:** **NÃO!** A migration usa:
- `CREATE TABLE IF NOT EXISTS` - não recria se já existir
- `DROP POLICY IF EXISTS` - apenas remove políticas antigas
- Dados nas tabelas são preservados

---

### P: Quanto tempo demora para executar a migration?
**R:** Normalmente menos de 5 segundos. Se demorar mais de 30 segundos, algo pode estar errado.

---

### P: Posso executar a migration múltiplas vezes?
**R:** **SIM!** A migration é **idempotente**, ou seja, pode ser executada várias vezes sem causar problemas.

---

### P: Preciso executar outras migrations antes?
**R:** Sim, você precisa ter executado:
1. Setup inicial das tabelas (profiles, books, etc.)
2. `MIGRATION_ACCOUNT_LOCKING.sql` (bloqueio de contas)
3. `MIGRATION_UNLOCK_REQUESTS.sql` (esta)

---

## 🔐 Segurança e Políticas

### P: As novas políticas RLS são seguras?
**R:** **SIM!** Elas permitem:
- ✅ Qualquer pessoa criar solicitação APENAS para usuários **bloqueados**
- ✅ Admins criarem solicitação para qualquer usuário
- ❌ Usuários normais criarem solicitações aleatórias
- ❌ Spam ou abuso do sistema

---

### P: Por que qualquer pessoa pode criar solicitações para contas bloqueadas?
**R:** Porque quando um usuário erra a senha 5 vezes, ele NÃO está autenticado (`auth.uid()` = null). O sistema precisa criar a solicitação automaticamente, mas como o usuário não está logado, a política precisa permitir isso. A segurança está no CHECK que verifica se o usuário está de fato bloqueado.

---

### P: Alguém pode criar solicitações falsas?
**R:** **NÃO!** A política verifica:
```sql
WHERE profiles.id = user_id AND profiles.is_locked = true
```
Só permite criar se o usuário estiver DE FATO bloqueado no banco de dados.

---

### P: Posso ter múltiplas solicitações pendentes para o mesmo usuário?
**R:** Tecnicamente sim, mas você pode adicionar um índice UNIQUE para evitar:
```sql
CREATE UNIQUE INDEX idx_unlock_requests_user_pending 
ON unlock_requests(user_id) 
WHERE status = 'pending';
```

---

## 🎯 Funcionalidades

### P: As solicitações são criadas automaticamente?
**R:** **SIM!** Em três situações:
1. Quando usuário erra senha 5x (bloqueio automático)
2. Quando admin detecta bloqueados sem solicitação
3. Quando AdminPanel sincroniza usuários bloqueados

---

### P: O que acontece quando admin aprova uma solicitação?
**R:** Quatro coisas:
1. `status` da solicitação muda para `'approved'`
2. `is_locked` do usuário vira `false`
3. `failed_login_attempts` reseta para `0`
4. `locked_at` vira `null`

---

### P: Posso rejeitar solicitações?
**R:** **SIM!** O admin pode clicar em "Rejeitar". Isso apenas muda o `status` para `'rejected'`, mas não desbloqueia o usuário.

---

### P: Solicitações rejeitadas aparecem na lista?
**R:** Depende do filtro. Por padrão, o AdminPanel mostra apenas `status = 'pending'`.

---

## 🐛 Troubleshooting

### P: Executei a migration mas os erros continuam
**R:** Tente isso NA ORDEM:
1. Recarregue a aplicação (F5)
2. Limpe o cache (Ctrl+Shift+Delete)
3. Feche e abra o navegador
4. Verifique no Supabase → Table Editor se `unlock_requests` existe
5. Verifique se a migration rodou SEM erros vermelhos

---

### P: Vejo erro "Table already exists"
**R:** Execute isto ANTES da migration:
```sql
DROP TABLE IF EXISTS unlock_requests CASCADE;
```
Depois execute a migration completa novamente.

---

### P: Vejo erro "Permission denied"
**R:** Você não é owner do projeto Supabase. Peça ao owner para executar a migration.

---

### P: AdminPanel não mostra solicitações
**R:** Verifique:
1. Você está logado como admin?
2. Existem usuários bloqueados com solicitações?
3. A migration foi executada com sucesso?
4. A tabela `unlock_requests` existe no Supabase?

---

### P: Foreign key não funciona (ainda vejo PGRST200)
**R:** Provável que a migration não foi executada. Verifique:
```sql
-- No Supabase SQL Editor, execute:
SELECT 
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE constraint_name = 'unlock_requests_user_id_fkey';

-- Deve retornar 1 linha
-- Se retornar 0, a foreign key não foi criada
```

---

## 📊 Dados e Testes

### P: Como criar um usuário de teste para bloquear?
**R:** 
```sql
-- No Supabase SQL Editor:
INSERT INTO profiles (id, name, email, role, is_locked, failed_login_attempts)
VALUES (
  gen_random_uuid(),
  'Teste Bloqueado',
  'teste@bloqueado.com',
  'user',
  true,
  5
);
```

---

### P: Como criar uma solicitação de teste manualmente?
**R:**
```sql
-- Pegue o ID de um usuário bloqueado
SELECT id, name, email FROM profiles WHERE is_locked = true;

-- Crie a solicitação
INSERT INTO unlock_requests (user_id, reason, status)
VALUES (
  'id_do_usuario_aqui',
  'Solicitação de teste',
  'pending'
);
```

---

### P: Como ver todas as solicitações no banco?
**R:**
```sql
SELECT 
  ur.*,
  p.name,
  p.email,
  p.is_locked
FROM unlock_requests ur
JOIN profiles p ON ur.user_id = p.id
ORDER BY ur.created_at DESC;
```

---

### P: Como deletar todas as solicitações (para resetar)?
**R:**
```sql
DELETE FROM unlock_requests;
```

---

### P: Como desbloquear um usuário manualmente?
**R:**
```sql
UPDATE profiles 
SET 
  is_locked = false,
  failed_login_attempts = 0,
  locked_at = null
WHERE email = 'email_do_usuario@exemplo.com';
```

---

## 🔄 Sincronização

### P: O que é a "sincronização automática"?
**R:** É quando o AdminPanel detecta usuários bloqueados sem solicitações pendentes e cria automaticamente. Isso garante que todos os bloqueados aparecem na lista.

---

### P: Com que frequência a sincronização acontece?
**R:** Toda vez que o AdminPanel carrega (função `loadAdminData`).

---

### P: Posso desativar a sincronização automática?
**R:** Sim, comente este trecho em `/components/AdminPanel.tsx`:
```typescript
// Comentar estas linhas:
// for (const lockedUser of lockedUsers) {
//   if (!usersWithPendingRequests.has(lockedUser.id)) {
//     await unlockRequestsService.createUnlockRequest(...)
//   }
// }
```

---

## 📝 Código

### P: Posso modificar as políticas RLS?
**R:** **SIM**, mas com cuidado! Se modificar, teste MUITO bem para garantir que:
1. Bloqueio automático funciona
2. Admin pode criar/aprovar
3. Segurança não é comprometida

---

### P: Posso adicionar campos à tabela unlock_requests?
**R:** **SIM!** Exemplo:
```sql
ALTER TABLE unlock_requests ADD COLUMN admin_notes TEXT;
```
Depois atualize a interface TypeScript em `/services/unlock-requests.ts`.

---

### P: Posso mudar os status possíveis?
**R:** Sim, mas precisa alterar o CHECK constraint:
```sql
ALTER TABLE unlock_requests 
  DROP CONSTRAINT unlock_requests_status_check;

ALTER TABLE unlock_requests 
  ADD CONSTRAINT unlock_requests_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'seu_novo_status'));
```

---

## 🎯 Próximos Passos

### P: Preciso fazer mais alguma coisa depois da migration?
**R:** 
1. ✅ Execute a migration
2. ✅ Recarregue o app
3. ✅ Teste bloqueio automático
4. ✅ Teste Admin Panel
5. ✅ Teste aprovação
6. ✅ Pronto! Sistema funcionando

---

### P: Quais outras funcionalidades posso adicionar?
**R:** Sugestões:
- Notificações por email quando conta é bloqueada
- Histórico de todas as solicitações (não só pendentes)
- Tempo máximo de bloqueio (auto-desbloquear após X dias)
- Razões predefinidas para rejeição
- Dashboard com estatísticas de bloqueios

---

### P: Onde encontro mais documentação?
**R:** Arquivos criados para você:
- `/README_CORRIGI_OS_ERROS.md` - Resumo geral
- `/EXECUTAR_ISTO_AGORA.md` - Guia rápido
- `/INSTRUCOES_MIGRATION_UNLOCK.md` - Guia completo
- `/SOLUCAO_FINAL_RLS.md` - Explicação técnica
- `/RESUMO_VISUAL_CORRECAO.md` - Visualização
- `/FAQ_ERROS_UNLOCK.md` - Este arquivo

---

## 🆘 Ajuda Adicional

### P: Ainda estou com problemas. O que fazer?
**R:** Checklist de diagnóstico:
1. [ ] Executei a migration corretamente?
2. [ ] Vi mensagem de sucesso verde?
3. [ ] Recarreguei a aplicação (F5)?
4. [ ] Tabela `unlock_requests` existe no Supabase?
5. [ ] Políticas RLS foram criadas?
6. [ ] Foreign key existe?
7. [ ] Console do navegador mostra novos erros?

---

### P: Como verifico se tudo está OK?
**R:** Execute no Supabase SQL Editor:
```sql
-- 1. Verifica se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'unlock_requests'
) AS table_exists;

-- 2. Verifica foreign key
SELECT COUNT(*) FROM information_schema.table_constraints
WHERE constraint_name = 'unlock_requests_user_id_fkey';

-- 3. Verifica políticas
SELECT COUNT(*) FROM pg_policies
WHERE tablename = 'unlock_requests';

-- Deve retornar:
-- table_exists: true
-- foreign key count: 1
-- policies count: 6
```

---

**Ainda com dúvidas?** Releia a documentação ou verifique o console do navegador (F12) para mensagens específicas de erro.

---

**Criado em:** 10/11/2025  
**Versão:** 1.0  
**Status:** ✅ Completo
