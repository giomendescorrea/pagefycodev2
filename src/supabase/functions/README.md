# Edge Functions - Pagefy

## 📁 Estrutura

Este diretório contém as edge functions do Supabase para o Pagefy:

### `/make-server/`
Edge function principal responsável por operações de autenticação que requerem privilégios administrativos.

**Endpoints:**
- `GET /make-server-5ed9d16e/health` - Health check
- `POST /make-server-5ed9d16e/signup` - Criação de usuários com admin API

### `/server/`
Backup/alternativa da edge function principal (mesmo conteúdo de make-server).

## 🔧 Troubleshooting

### Erro 403 no Deploy

Se você está recebendo erro 403 ao fazer deploy das edge functions:

1. **Verifique as credenciais do Supabase:**
   - Certifique-se de que o projeto está conectado corretamente
   - Verifique se as variáveis de ambiente estão configuradas

2. **Verifique as permissões:**
   - No Supabase Dashboard, vá em Settings → API
   - Verifique se o Service Role Key está configurado
   - Confirme que você tem permissões de admin no projeto

3. **Arquivos duplicados:**
   - Existem arquivos .tsx e .ts nas pastas
   - Os arquivos .tsx são protegidos e não podem ser deletados
   - Os arquivos .ts são os que devem ser usados para deploy

4. **Workaround manual:**
   - Se o deploy automático falhar, faça deploy manual via CLI:
   ```bash
   supabase functions deploy make-server
   ```

### Erros de Login "Invalid credentials"

Este erro é **esperado** quando:
- O usuário ainda não criou uma conta
- O email ou senha estão incorretos
- A conta foi bloqueada (5 tentativas falhas)

**Solução:** 
- Usuários novos devem clicar em "Criar Conta" primeiro
- Consulte `INICIO_RAPIDO.md` para instruções detalhadas

## 🔑 Variáveis de Ambiente

As edge functions precisam das seguintes variáveis (configuradas automaticamente pelo Supabase):

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key para operações admin
- `SUPABASE_ANON_KEY` - Anon key pública

## 📝 Funcionalidades

### Signup Endpoint

**POST /make-server-5ed9d16e/signup**

Cria um novo usuário com a Admin API do Supabase, permitindo confirmação automática de email.

**Request Body:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123",
  "accountType": "reader",  // ou "publisher"
  "birthDate": "1990-01-01",  // opcional, requerido para readers
  "cnpj": "12.345.678/0001-90"  // opcional, requerido para publishers
}
```

**Response (sucesso):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "access_token": "jwt_token"
  },
  "profile": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "role": "user",
    "is_private": false,
    "is_locked": false,
    "failed_login_attempts": 0
  },
  "isPendingApproval": false  // true se accountType === 'publisher'
}
```

**Validações:**
- Email único (retorna erro se já existir)
- Senha mínima de 6 caracteres
- CNPJ válido para publishers
- Nome da empresa único para publishers
- CNPJ único para publishers

**Fluxo para Publishers:**
1. Usuário criado com role 'user'
2. Publisher request criado com status 'pending'
3. Admins notificados sobre nova solicitação
4. Usuário aguarda aprovação
5. Após aprovação, role muda para 'publisher'

## 🛡️ Segurança

### Proteções Implementadas:

1. **Email único:** Verifica duplicatas antes de criar
2. **CNPJ único:** Valida e verifica duplicatas para publishers
3. **Validação de CNPJ:** Verificação de dígitos verificadores
4. **Cleanup automático:** Deleta auth user se criação de profile falhar
5. **Confirmação automática:** Email confirmado automaticamente (dev mode)

### Bloqueio de Conta:

O bloqueio de conta (após 5 tentativas falhas) é gerenciado no **client-side** em `/services/auth.ts`, não na edge function.

## 📚 Documentação Adicional

- `INICIO_RAPIDO.md` - Guia para usuários finais
- `SUPABASE_SETUP.md` - Configuração técnica completa
- `README.md` - Visão geral do projeto

## 🔄 Sync com Server

As pastas `/make-server/` e `/server/` contêm o mesmo código. Isso é intencional para garantir compatibilidade durante a migração de .tsx para .ts.

**Importante:** Ao atualizar a edge function, atualize AMBOS os arquivos:
- `/make-server/index.ts`
- `/server/index.ts`

## 🐛 Debug

Para debugar a edge function localmente:

```bash
# Iniciar Supabase local
supabase start

# Deploy local da função
supabase functions serve make-server --env-file .env.local

# Testar endpoint
curl -X POST http://localhost:54321/functions/v1/make-server-5ed9d16e/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","accountType":"reader"}'
```

## 📊 Logs

Para ver logs da edge function no Supabase Dashboard:
1. Vá em Edge Functions
2. Selecione "make-server"
3. Clique na aba "Logs"
4. Filtre por erro/warning conforme necessário
