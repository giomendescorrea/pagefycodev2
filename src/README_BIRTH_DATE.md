# Correção: Data de Nascimento no Sistema de Recuperação de Senha

## Problema Resolvido
O sistema de recuperação de senha estava apresentando erro 404 e não validava corretamente a data de nascimento dos usuários leitores.

## Alterações Realizadas

### 1. **Correção de URLs dos Endpoints** ✅
- Corrigido o caminho da função Supabase de `make-server-5ed9d16e` para `make-server`
- Arquivos alterados:
  - `/services/auth.ts`
  - `/services/password-reset.ts`

### 2. **Correção dos Endpoints do Servidor Hono** ✅
- Removido prefixo duplicado dos endpoints
- Arquivo alterado: `/supabase/functions/make-server/index.ts`
- Endpoints atualizados:
  - `/health` (anteriormente `/make-server-5ed9d16e/health`)
  - `/signup` (anteriormente `/make-server-5ed9d16e/signup`)
  - `/reset-password` (anteriormente `/make-server-5ed9d16e/reset-password`)

### 3. **Melhorias no Endpoint de Reset de Senha** ✅
- Substituído `listUsers()` por `getUserByEmail()` para busca mais eficiente
- Adicionados logs detalhados para facilitar debugging
- Mensagens de erro mais descritivas
- Arquivo alterado: `/supabase/functions/make-server/index.ts`

### 4. **Validação Obrigatória da Data de Nascimento** ✅
- Tornado obrigatório o campo `birth_date` para leitores
- Validação ocorre em duas etapas:
  1. Verifica se o perfil tem `birth_date` cadastrado
  2. Compara se a data informada é igual à cadastrada
- Arquivo alterado: `/services/password-reset.ts`

### 5. **Migration do Banco de Dados** ✅
- Criado script SQL para adicionar coluna `birth_date` na tabela `profiles`
- Arquivo criado: `/MIGRATION_BIRTH_DATE.sql`

## Como Executar a Migration

### No Supabase Dashboard:
1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo `/MIGRATION_BIRTH_DATE.sql`
4. Copie e cole o conteúdo no editor
5. Clique em **Run** para executar

O script é seguro e:
- Verifica se a coluna já existe antes de criar
- Não altera dados existentes
- Retorna mensagem de confirmação

## Fluxo de Recuperação de Senha para Leitores

### 1. Usuário insere email
- Sistema busca o perfil no banco de dados
- Identifica se é leitor ou publicador

### 2. Verificação de identidade (Leitores)
- **Nome Completo**: Deve ser exatamente igual ao cadastrado
- **Data de Nascimento**: Deve ser exatamente igual à cadastrada
- Comparação case-insensitive para o nome
- Comparação exata da data (formato: YYYY-MM-DD)

### 3. Definição de nova senha
- Mínimo de 6 caracteres
- Confirmação da senha
- Validação client-side e server-side

### 4. Atualização no Supabase
- Senha atualizada via Admin API
- Usuário pode fazer login imediatamente

## Validações Implementadas

### Client-side (ForgotPassword.tsx)
- Email válido e cadastrado
- Nome completo preenchido
- Data de nascimento preenchida
- Senha com mínimo 6 caracteres
- Senhas conferem

### Service-side (password-reset.ts)
- Email existe no banco
- Nome completo confere (case-insensitive)
- Data de nascimento confere (exata)
- Perfil tem `birth_date` cadastrado

### Server-side (make-server/index.ts)
- Email existe no Auth
- Senha tem mínimo 6 caracteres
- Usuário encontrado no sistema
- Senha atualizada com sucesso

## Estrutura de Dados

### Profile (Tabela profiles)
```typescript
{
  id: string;
  name: string;
  email: string;
  birth_date: string; // Formato: YYYY-MM-DD
  role: 'user' | 'publisher' | 'admin';
  is_private: boolean;
  is_locked: boolean;
  failed_login_attempts: number;
  created_at: string;
  updated_at: string;
}
```

## Testes Recomendados

1. **Cadastro de novo leitor com data de nascimento**
   - Verificar se `birth_date` é salvo no Supabase
   
2. **Recuperação de senha - dados corretos**
   - Nome e data corretos → deve funcionar
   
3. **Recuperação de senha - nome incorreto**
   - Nome diferente → deve falhar com mensagem apropriada
   
4. **Recuperação de senha - data incorreta**
   - Data diferente → deve falhar com mensagem apropriada
   
5. **Recuperação de senha - perfil sem birth_date**
   - Perfis antigos sem data → mensagem de perfil incompleto

## Logs para Debugging

Os seguintes logs foram adicionados para facilitar o debugging:

### Services
```
[resetPassword] Iniciando reset de senha para: {email}
[resetPassword] Perfil encontrado: {profileId}
[resetPassword] Nome não confere
[resetPassword] Data de nascimento não cadastrada no perfil
[resetPassword] Data de nascimento não confere
[resetPassword] Chamando servidor para atualizar senha...
[resetPassword] Senha redefinida com sucesso
```

### Server
```
[reset-password] Iniciando reset para email: {email}
[reset-password] Buscando usuário por email...
[reset-password] Usuário encontrado: {userId}
[reset-password] Atualizando senha...
[reset-password] Senha atualizada com sucesso
```

## Próximos Passos

1. ✅ Executar migration `MIGRATION_BIRTH_DATE.sql`
2. ✅ Testar fluxo completo de recuperação de senha
3. ⚠️ Considerar adicionar opção para usuários antigos atualizarem perfil
4. ⚠️ Adicionar campo `birth_date` obrigatório para perfis existentes

## Notas Importantes

- **Perfis antigos**: Usuários cadastrados antes desta atualização podem não ter `birth_date` e precisarão contatar o suporte
- **Segurança**: A validação de nome e data adiciona uma camada extra de segurança
- **Privacidade**: A data de nascimento não é exposta em nenhuma API pública
- **CNPJ para publicadores**: Funciona da mesma forma, validando nome da empresa e CNPJ
