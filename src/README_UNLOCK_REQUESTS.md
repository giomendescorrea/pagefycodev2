# Sistema de Solicitações de Desbloqueio de Conta

## ⚠️ IMPORTANTE - LEIA ANTES DE USAR
Se você está tendo problemas com solicitações de desbloqueio não aparecendo no AdminPanel, consulte o arquivo **`CORRECAO_SOLICITACOES_DESBLOQUEIO.md`** para a correção da foreign key.

## Visão Geral
Este documento descreve a funcionalidade completa de solicitações de desbloqueio de contas bloqueadas por múltiplas tentativas de login incorretas.

## Contexto
Quando um usuário erra a senha 5 vezes consecutivas, sua conta é automaticamente bloqueada. Este sistema permite que usuários solicitem o desbloqueio através do administrador.

## Funcionalidades Implementadas

### 1. Tabela de Solicitações
- **Arquivo SQL**: `/MIGRATION_UNLOCK_REQUESTS.sql`
- Armazena solicitações de desbloqueio
- Status: `pending`, `approved`, `rejected`
- Relacionamento com usuários via foreign key
- Políticas RLS para segurança

### 2. Serviço de Solicitações
- **Arquivo**: `/services/unlock-requests.ts`
- Criar solicitação de desbloqueio
- Listar todas as solicitações (admin)
- Aprovar solicitação (desbloqueia conta)
- Rejeitar solicitação
- Verificar solicitação pendente do usuário

### 3. Interface Administrativa
- **Componente**: `/components/AdminPanel.tsx`
- Seção dedicada para solicitações de desbloqueio
- Badge com contador de solicitações pendentes
- Botões de aprovar/rejeitar
- Histórico de solicitações processadas
- Integrado com contador geral de solicitações

### 4. Mensagem de Bloqueio Melhorada
- **Componente**: `/components/TwoStepLogin.tsx`
- Mensagem clara quando conta é bloqueada
- Exibe email de suporte (suporte.pagefy@gmail.com)
- Link clicável para mailto
- Duração estendida do toast (10 segundos)

## Estrutura do Banco de Dados

### Tabela: unlock_requests
```sql
CREATE TABLE unlock_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Índices
- `idx_unlock_requests_user_id`: Para buscas por usuário
- `idx_unlock_requests_status`: Para filtrar por status

### Políticas RLS
1. Usuários podem criar suas próprias solicitações
2. Usuários podem ver suas próprias solicitações
3. Admins podem ver todas as solicitações
4. Admins podem atualizar/deletar solicitações

## Fluxo de Uso

### Cenário 1: Usuário Bloqueia Conta
1. Usuário erra senha 5 vezes
2. Conta é bloqueada automaticamente
3. Sistema exibe mensagem de bloqueio
4. Mensagem inclui email de suporte
5. Usuário entra em contato com admin

### Cenário 2: Admin Processa Solicitação
1. Admin recebe solicitação de desbloqueio
2. Acessa painel administrativo
3. Vê solicitação na aba "Solicitações"
4. Verifica informações do usuário
5. Decide aprovar ou rejeitar

### Cenário 3: Aprovação de Desbloqueio
1. Admin clica em "Desbloquear"
2. Sistema atualiza status da solicitação
3. Conta do usuário é desbloqueada
4. Tentativas falhadas zeradas
5. Usuário pode fazer login novamente

## API do Serviço

### createUnlockRequest(userId, reason)
Cria nova solicitação de desbloqueio.

```typescript
const request = await unlockRequestsService.createUnlockRequest(
  userId,
  'Esqueci minha senha e minha conta foi bloqueada'
);
```

### getUnlockRequests()
Lista todas as solicitações (apenas admin).

```typescript
const requests = await unlockRequestsService.getUnlockRequests();
```

### approveUnlockRequest(requestId, userId)
Aprova solicitação e desbloqueia conta.

```typescript
await unlockRequestsService.approveUnlockRequest(requestId, userId);
```

### rejectUnlockRequest(requestId)
Rejeita solicitação.

```typescript
await unlockRequestsService.rejectUnlockRequest(requestId);
```

### getUserPendingUnlockRequest(userId)
Verifica se usuário tem solicitação pendente.

```typescript
const pending = await unlockRequestsService.getUserPendingUnlockRequest(userId);
```

## Integração com AdminPanel

### Contador de Solicitações
```typescript
const pendingPublisher = publisherRequests.filter(r => r.status === 'pending').length;
const pendingUnlock = unlockRequests.filter(r => r.status === 'pending').length;
const totalPending = pendingPublisher + pendingUnlock;
```

### Atualização em Tempo Real
O painel atualiza automaticamente quando:
- Nova solicitação é criada
- Solicitação é aprovada
- Solicitação é rejeitada
- Dados são recarregados

## Interface do Administrador

### Seção de Solicitações de Desbloqueio
- **Localização**: Aba "Solicitações" > "Solicitações de Desbloqueio"
- **Cor tema**: Laranja (indica atenção)
- **Informações exibidas**:
  - Nome do usuário
  - Email do usuário
  - Motivo da solicitação
  - Data/hora da solicitação
  - Status atual da conta (se bloqueada)

### Ações Disponíveis
1. **Desbloquear**: Aprova e desbloqueia imediatamente
2. **Rejeitar**: Rejeita a solicitação
3. **Ver Histórico**: Todas as solicitações processadas

### Visual Indicators
- Badge laranja com contador de pendentes
- Cards com fundo laranja claro
- Ícone de cadeado para indicar bloqueio
- Avatar com iniciais do usuário

## Segurança

### Permissões
- Apenas admins podem ver todas as solicitações
- Usuários só veem suas próprias solicitações
- Apenas admins podem aprovar/rejeitar

### Validações
- Verifica se conta está realmente bloqueada
- Previne múltiplas solicitações pendentes
- Atualiza timestamps corretamente
- Foreign key garante integridade

### Auditoria
- Todas as solicitações são registradas
- Timestamps de criação e atualização
- Status histórico mantido
- Rastreabilidade completa

## Migração do Banco de Dados

### Passo 1: Execute o SQL
1. Acesse o Supabase Dashboard
2. Vá em: SQL Editor
3. Copie o conteúdo de `/MIGRATION_UNLOCK_REQUESTS.sql`
4. Cole e execute

### Passo 2: Verifique a Criação
```sql
-- Verificar tabela
SELECT * FROM unlock_requests;

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'unlock_requests';

-- Verificar políticas
SELECT policyname FROM pg_policies WHERE tablename = 'unlock_requests';
```

### Passo 3: Teste as Permissões
1. Crie uma solicitação como usuário comum
2. Tente ver solicitações de outros (deve falhar)
3. Faça login como admin
4. Verifique se vê todas as solicitações

## Mensagens de Erro e Feedback

### Mensagem de Conta Bloqueada
```
Conta bloqueada

Sua conta foi bloqueada devido a múltiplas tentativas de login incorretas.

Entre em contato com o administrador para desbloquear sua conta:
suporte.pagefy@gmail.com
```

### Toast de Sucesso (Desbloqueio)
```
Conta desbloqueada com sucesso!
```

### Toast de Rejeição
```
Solicitação de desbloqueio rejeitada
```

## Estatísticas e Métricas

### Dados Rastreados
- Total de solicitações criadas
- Solicitações pendentes
- Taxa de aprovação
- Taxa de rejeição
- Tempo médio de resposta
- Usuários mais bloqueados

### Monitoramento
```typescript
// No AdminPanel
const stats = {
  totalUnlockRequests: unlockRequests.length,
  pendingUnlockRequests: unlockRequests.filter(r => r.status === 'pending').length,
  approvedToday: unlockRequests.filter(r => 
    r.status === 'approved' && 
    isToday(r.updated_at)
  ).length
};
```

## Melhorias Futuras

### Notificações
- [ ] Email automático quando conta é bloqueada
- [ ] Notificação push para admins
- [ ] Lembrete de solicitações pendentes

### Automação
- [ ] Desbloqueio automático após 24h
- [ ] Limpar solicitações antigas
- [ ] Auto-rejeitar após X dias

### Analytics
- [ ] Dashboard de bloqueios
- [ ] Relatórios de segurança
- [ ] Padrões de bloqueio

### UX
- [ ] Chat direto com admin
- [ ] Upload de comprovante de identidade
- [ ] Vídeo chamada para verificação

## Troubleshooting

### Problema: Solicitação não aparece no admin
**Solução**: 
- **IMPORTANTE**: Consulte `/CORRECAO_SOLICITACOES_DESBLOQUEIO.md` para corrigir a foreign key
- Verificar se RLS está ativo
- Confirmar que usuário é admin
- Recarregar dados do painel
- Verificar se a migration foi executada corretamente com a foreign key para `profiles`

### Problema: Conta não desbloqueia após aprovação
**Solução**:
- Verificar logs do console
- Confirmar execução do serviço
- Checar permissões do usuário admin

### Problema: Erro ao criar solicitação
**Solução**:
- Verificar se tabela foi criada
- Confirmar foreign key válida
- Checar políticas RLS

## Contato e Suporte

Para questões sobre o sistema de desbloqueio:
- **Email de Suporte**: suporte.pagefy@gmail.com
- **Documentação**: Este arquivo
- **Logs**: Console do browser e Supabase Logs

## Checklist de Implementação

- [x] Criar tabela unlock_requests
- [x] Implementar serviço de solicitações
- [x] Atualizar AdminPanel com seção de desbloqueio
- [x] Melhorar mensagem de conta bloqueada
- [x] Adicionar email de suporte na mensagem
- [x] Integrar contador de solicitações
- [x] Criar histórico de desbloqueios
- [x] Documentar funcionalidades
- [ ] Executar migração no Supabase
- [ ] Testar fluxo completo
- [ ] Configurar notificações por email