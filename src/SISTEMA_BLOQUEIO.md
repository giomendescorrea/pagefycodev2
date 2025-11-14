# Sistema de Bloqueio e Segurança de Contas

## Visão Geral

O Pagefy implementa um sistema robusto de segurança de contas que protege os usuários contra acessos não autorizados, bloqueando temporariamente contas após múltiplas tentativas de login falhas.

## Fluxo de Autenticação e Bloqueio

### 1. Login Bem-Sucedido
- **Condição**: Email e senha corretos de primeira tentativa
- **Ação**: Usuário faz login imediatamente
- **Resultado**: Contador de tentativas falhas é resetado para 0

### 2. Email Não Encontrado
- **Condição**: Email não está cadastrado no sistema
- **Ação**: Sistema verifica que o email não existe na tabela `profiles`
- **Mensagem**: "Email não encontrado - Primeira vez aqui? Clique em 'Criar Conta' para se cadastrar."
- **Importante**: Não conta como tentativa falha (email não existe)

### 3. Senha Incorreta (Email Existe)
- **Condição**: Email está cadastrado mas senha está errada
- **Ação**: Sistema incrementa contador `failed_login_attempts`
- **Mensagem**: "Senha incorreta - Atenção: Você tem X tentativa(s) restante(s) antes da conta ser bloqueada."
- **Contador**: 
  - 1ª tentativa errada: 4 tentativas restantes
  - 2ª tentativa errada: 3 tentativas restantes
  - 3ª tentativa errada: 2 tentativas restantes
  - 4ª tentativa errada: 1 tentativa restante
  - 5ª tentativa errada: Conta bloqueada

### 4. Bloqueio da Conta (5 Tentativas Falhas)
- **Condição**: `failed_login_attempts` chega a 5
- **Ações Automáticas**:
  1. Campo `is_locked` é definido como `true`
  2. Campo `locked_at` recebe timestamp do bloqueio
  3. Email é enviado ao usuário informando o bloqueio
  4. Notificação é criada para TODOS os administradores
  5. Solicitação de desbloqueio é registrada automaticamente

- **Mensagem ao Usuário**: 
  ```
  Conta bloqueada
  
  Sua conta foi bloqueada após 5 tentativas de login sem sucesso por motivos de segurança.
  
  Uma solicitação de desbloqueio foi automaticamente enviada aos administradores.
  
  Aguarde a análise ou entre em contato: suporte@pagefy.com
  ```

### 5. Tentativa de Login em Conta Bloqueada
- **Condição**: Usuário tenta fazer login em conta já bloqueada
- **Ação**: Login é impedido imediatamente
- **Mensagem**: "Conta bloqueada - Uma solicitação de desbloqueio foi enviada aos administradores."

## Processo de Desbloqueio

### Pelo Administrador (AdminPanel)

1. **Notificação para Admins**:
   - Quando uma conta é bloqueada, todos os administradores recebem uma notificação
   - Tipo: `system`
   - Título: "Solicitação de Desbloqueio de Conta"
   - Descrição: "[Nome] ([email]) teve sua conta bloqueada após 5 tentativas de login sem sucesso e precisa de aprovação para desbloqueio."

2. **Visualização no Painel**:
   - Admins podem ver usuários bloqueados na aba "Usuários"
   - Badge laranja "🔒 Bloqueado" aparece ao lado do nome
   - Badge amarelo mostra tentativas falhas se < 5

3. **Ação de Desbloqueio**:
   - Admin clica no botão de desbloqueio (ícone de cadeado aberto)
   - Confirmação é solicitada
   - Sistema executa:
     - Define `is_locked = false`
     - Reseta `failed_login_attempts = 0`
     - Limpa `locked_at = null`
     - Envia email ao usuário confirmando desbloqueio
     - Cria notificação para o usuário

4. **Email de Desbloqueio**:
   ```
   Assunto: Pagefy - Sua conta foi desbloqueada
   
   Olá [Nome],
   
   Boas notícias! Sua conta no Pagefy foi desbloqueada pelo administrador.
   
   Você já pode fazer login normalmente usando suas credenciais.
   ```

## Campos na Tabela `profiles`

```sql
-- Campos relacionados ao bloqueio
is_locked: boolean (padrão: false)
failed_login_attempts: integer (padrão: 0)
locked_at: timestamp (null quando não bloqueado)
```

## Códigos de Erro

| Código | Significado | Ação |
|--------|-------------|------|
| `EMAIL_NOT_FOUND` | Email não existe no sistema | Sugerir criar conta |
| `WRONG_PASSWORD:X` | Senha errada, X tentativas restantes | Avisar usuário |
| `ACCOUNT_LOCKED` | Conta já estava bloqueada | Informar sobre solicitação |
| `ACCOUNT_LOCKED_NOW` | Conta acabou de ser bloqueada | Informar sobre bloqueio e solicitação |

## Segurança

### Por que este sistema é seguro?

1. **Proteção contra Força Bruta**: Limita tentativas de adivinhar senhas
2. **Notificação Imediata**: Usuário é avisado por email sobre bloqueio
3. **Aprovação Manual**: Admin revisa cada desbloqueio
4. **Rastreamento**: Timestamp do bloqueio permite análise posterior
5. **Diferenciação**: Distingue entre email inexistente e senha errada

### Melhores Práticas para Usuários

1. **Use senhas fortes**: Combine letras, números e símbolos
2. **Não compartilhe credenciais**: Sua senha é pessoal
3. **Atenção ao contador**: Pare após 2-3 tentativas se esquecer a senha
4. **Entre em contato**: Use suporte@pagefy.com se bloqueado

### Para Administradores

1. **Verifique identidade**: Confirme que é o dono da conta antes de desbloquear
2. **Analise padrões**: Múltiplos bloqueios podem indicar ataque
3. **Documente**: Mantenha registro de desbloqueios
4. **Comunique**: Oriente usuários sobre segurança de senhas

## Logs e Monitoramento

### Logs Importantes

```javascript
// Quando conta é bloqueada
'[Auth] Account locked email sent to: [email]'
'[Auth] Unlock request notifications sent to admins'

// Quando conta é desbloqueada
'[Users] Account unlocked email sent to: [email]'
'[Users] Unlock notification created for user: [userId]'
```

### Monitoramento Sugerido

- Quantidade de bloqueios por dia
- Tempo médio até desbloqueio
- Usuários com múltiplos bloqueios
- Horários de pico de tentativas falhas

## Fluxograma

```
Início do Login
    ↓
Email existe? → NÃO → Mensagem "Email não encontrado"
    ↓ SIM
Conta bloqueada? → SIM → Mensagem "Conta bloqueada"
    ↓ NÃO
Senha correta? → SIM → Login + Reset contador → FIM
    ↓ NÃO
Incrementa contador
    ↓
Contador = 5? → NÃO → Mensagem "X tentativas restantes"
    ↓ SIM
Bloqueia conta
    ↓
Envia email ao usuário
    ↓
Notifica todos admins
    ↓
Mensagem "Conta bloqueada - Aguarde aprovação"
```

## Exemplos de Uso

### Exemplo 1: Usuário Esqueceu a Senha
```
1. Tentativa 1: Senha errada → "4 tentativas restantes"
2. Tentativa 2: Senha errada → "3 tentativas restantes"
3. Usuário percebe e para de tentar
4. Entra em contato com suporte para resetar senha
```

### Exemplo 2: Email Novo (Não Cadastrado)
```
1. Usuário digita email que não existe
2. Sistema: "Email não encontrado"
3. Usuário clica em "Criar Conta"
4. Completa cadastro normalmente
```

### Exemplo 3: Bloqueio e Desbloqueio
```
1. Usuário erra senha 5 vezes
2. Conta bloqueada → Email enviado
3. Admin recebe notificação
4. Admin verifica identidade do usuário
5. Admin desbloqueia conta
6. Usuário recebe email de confirmação
7. Usuário faz login com sucesso
```

## Perguntas Frequentes

**P: O que acontece se eu esquecer minha senha?**
R: Pare de tentar após 2-3 tentativas e entre em contato com suporte@pagefy.com para resetar sua senha.

**P: Quanto tempo leva para desbloquear?**
R: Depende da disponibilidade do administrador. Em horário comercial, geralmente até 24 horas.

**P: Posso ser bloqueado novamente?**
R: Sim, se você errar a senha 5 vezes novamente. Use a senha correta ou redefina-a.

**P: Como admin, devo desbloquear todas as contas?**
R: Não. Verifique se é realmente o dono da conta. Se houver suspeita de invasão, não desbloqueie e investigue.

**P: O contador é resetado após quanto tempo?**
R: O contador só é resetado após login bem-sucedido ou desbloqueio manual pelo admin.

## Atualizações Futuras Sugeridas

1. **Reset automático de tentativas**: Após 24h sem tentativas
2. **Captcha**: Após 3 tentativas falhas
3. **2FA**: Autenticação de dois fatores
4. **Reset de senha**: Fluxo self-service via email
5. **Histórico de logins**: Log de IPs e dispositivos
6. **Alertas**: Notificar usuário de tentativas em locais incomuns
