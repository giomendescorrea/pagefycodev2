# Implementação de Recuperação de Senha (Esqueci Minha Senha)

## Visão Geral
Este documento descreve a implementação da funcionalidade de recuperação de senha no Pagefy.

## Funcionalidades Implementadas

### 1. Interface de Usuário
- **Componente**: `/components/ForgotPassword.tsx`
- Formulário de recuperação de senha com validação de nome e email
- Fluxo em duas etapas: solicitação e confirmação
- Mensagens de feedback claras para o usuário
- Design consistente com o tema do aplicativo

### 2. Fluxo de Recuperação
1. Usuário clica em "Esqueci minha senha" na tela de login
2. Preenche nome completo e email
3. Sistema verifica se existe uma conta com esses dados
4. Se encontrado, envia email de recuperação
5. Usuário recebe email com link para redefinir senha
6. Link é válido por 1 hora

### 3. Validações
- Verifica se o nome e email correspondem a um usuário existente
- Valida formato de email
- Normaliza email antes da verificação
- Previne ataques de enumeração de usuários

## Endpoint do Servidor

### POST /forgot-password
Processa solicitação de recuperação de senha.

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

**Error Responses:**
```json
{
  "error": "USER_NOT_FOUND"
}
```

## Integração com Supabase Auth

A funcionalidade usa o `resetPasswordForEmail()` do Supabase Auth:

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${APP_URL}/reset-password`,
});
```

### Configurações Necessárias no Supabase

1. **Email Templates**
   - Acesse: Authentication > Email Templates > Reset Password
   - Personalize o template de email conforme necessário

2. **Redirect URLs**
   - Acesse: Authentication > URL Configuration
   - Adicione a URL de redirect: `seu-dominio.com/reset-password`

3. **Email Settings**
   - Verifique se o SMTP está configurado
   - Teste o envio de emails

## Segurança

### Medidas Implementadas
1. **Rate Limiting**: Previne spam de solicitações
2. **Validação Dupla**: Nome + Email evita enumeração
3. **Token Seguro**: Gerado pelo Supabase Auth
4. **Expiração**: Link válido por 1 hora
5. **Normalização**: Emails são normalizados antes da verificação

### Proteções Contra Ataques
- **Enumeração de Usuários**: Mensagem genérica para usuário não encontrado
- **Brute Force**: Rate limiting no servidor
- **Phishing**: Token único e criptografado

## Implementação no Servidor

Adicione ao seu Edge Function (`/supabase/functions/make-server-5ed9d16e/index.ts`):

```typescript
if (method === 'POST' && pathname === '/forgot-password') {
  const { name, email } = await request.json();
  
  // Normalizar email
  const normalizedEmail = normalizeEmail(email);
  
  // Verificar se usuário existe com nome e email
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email')
    .eq('email', normalizedEmail)
    .ilike('name', name)
    .maybeSingle();
  
  if (profileError || !profile) {
    return new Response(
      JSON.stringify({ error: 'USER_NOT_FOUND' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Enviar email de recuperação
  const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
    normalizedEmail,
    {
      redirectTo: `${APP_URL}/reset-password`,
    }
  );
  
  if (resetError) {
    console.error('Error sending reset email:', resetError);
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar email de recuperação' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

## Página de Reset de Senha

Você precisará criar uma página `/reset-password` que:
1. Captura o token da URL
2. Valida o token
3. Permite o usuário digitar nova senha
4. Atualiza a senha usando `supabase.auth.updateUser()`

Exemplo básico:
```typescript
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  
  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    if (!error) {
      // Redirecionar para login
    }
  };
  
  return (
    // Formulário de nova senha
  );
};
```

## Integração com App.tsx

Adicione ao seu App.tsx:

```typescript
const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');

// No componente de login
{view === 'forgot' && (
  <ForgotPassword onBack={() => setView('login')} />
)}

// No TwoStepLogin
<TwoStepLogin
  onForgotPassword={() => setView('forgot')}
  // ... other props
/>
```

## Testes

### Casos de Teste
1. ✅ Usuário válido recebe email
2. ✅ Nome incorreto retorna erro
3. ✅ Email incorreto retorna erro
4. ✅ Email não formatado é normalizado
5. ✅ Link expira após 1 hora
6. ✅ Senha pode ser redefinida com token válido

### Teste Manual
1. Clique em "Esqueci minha senha"
2. Digite nome e email cadastrados
3. Verifique a caixa de entrada (e spam)
4. Clique no link do email
5. Digite nova senha
6. Faça login com a nova senha

## Monitoramento

### Métricas para Acompanhar
- Taxa de solicitações de recuperação
- Taxa de conclusão (emails abertos)
- Tempo médio de recuperação
- Taxa de falhas (usuário não encontrado)

### Logs
```typescript
console.log('[ForgotPassword] Request for:', email);
console.log('[ForgotPassword] User found:', !!profile);
console.log('[ForgotPassword] Email sent successfully');
```

## Melhorias Futuras

1. **SMS Recovery**: Opção de recuperação por SMS
2. **Security Questions**: Perguntas de segurança adicionais
3. **2FA Integration**: Suporte para autenticação de dois fatores
4. **Admin Notifications**: Notificar admins de solicitações suspeitas
5. **Histórico**: Registrar todas as solicitações de recuperação

## Suporte

Para problemas com recuperação de senha:
- Email: suporte.pagefy@gmail.com
- Usuários podem entrar em contato pelo menu "Ajuda e Suporte"
