# ⚠️ Erros Frequentes - Guia Visual Rápido

> **💡 Dica:** Para soluções detalhadas, consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 🔴 "Invalid login credentials"

```
❌ Sign in error: AuthApiError: Invalid login credentials
❌ Error in signIn: AuthApiError: Invalid login credentials
❌ Login error: AuthApiError: Invalid login credentials
```

### 🤔 Por que estou vendo isso?

**99% das vezes é porque você ainda NÃO criou uma conta!**

### ✅ Solução em 3 passos:

```
1️⃣ Clique em "Criar Conta"
     ⬇️
2️⃣ Preencha o formulário
     ⬇️
3️⃣ DEPOIS faça login
```

### ⚡ Solução Rápida

```
┌─────────────────────────────────┐
│  🚨 NÃO TEM CONTA? CRIE UMA!   │
│                                  │
│  1. Clique "Criar Conta"        │
│  2. Escolha tipo (Leitor)       │
│  3. Preencha: Nome, Email,      │
│     Data Nasc., Senha           │
│  4. Clique "Criar Conta"        │
│  5. Agora SIM, faça login!      │
└─────────────────────────────────┘
```

**🔗 Leia mais:** [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)

---

## 🔴 Erro 403 no Deploy

```
❌ Error while deploying: XHR for ".../edge_functions/make-server/deploy" 
   failed with status 403
```

### 🤔 Por que estou vendo isso?

Problema de permissões no deploy automático das edge functions.

### ✅ Soluções possíveis:

#### Opção 1: Ignorar o erro
```
Se você consegue criar contas, o erro pode ser ignorado!
A função já pode estar deployada de uma tentativa anterior.
```

#### Opção 2: Deploy manual via CLI
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link projeto
supabase link --project-ref tvdgzsqrkryzqdjpqoqr

# Deploy
supabase functions deploy make-server
```

#### Opção 3: Verificar permissões
```
1. Vá no Supabase Dashboard
2. Settings → API
3. Verifique Service Role Key
4. Confirme que você é admin do projeto
```

**🔗 Leia mais:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Seção "Erros de Deploy"

---

## 🔴 "Este email já está cadastrado"

```
❌ Este email já está cadastrado. Por favor, use outro email.
```

### 🤔 Por que estou vendo isso?

Você JÁ criou uma conta com este email antes.

### ✅ Solução:

```
┌─────────────────────────────────┐
│  USE O LOGIN, NÃO O SIGNUP!    │
│                                  │
│  1. Volte para tela de Login    │
│  2. Digite email e senha        │
│  3. Clique "Entrar"             │
└─────────────────────────────────┘
```

**Se esqueceu a senha:** Entre em contato com suporte@pagefy.com

---

## 🔴 "Conta temporariamente bloqueada"

```
❌ Conta temporariamente bloqueada
❌ Sua conta foi bloqueada após múltiplas tentativas de login sem sucesso
```

### 🤔 Por que estou vendo isso?

Você tentou fazer login 5 vezes com senha errada.

### ✅ O que fazer:

```
1️⃣ NÃO tente criar outra conta
     ⬇️
2️⃣ Verifique seu email
     (você recebeu notificação)
     ⬇️
3️⃣ Entre em contato:
     📧 suporte@pagefy.com
     ⬇️
4️⃣ Aguarde admin desbloquear
```

**⚠️ IMPORTANTE:** Criar outra conta NÃO resolve!

---

## 🔴 "CNPJ inválido"

```
❌ CNPJ inválido. Por favor, insira um CNPJ válido com dígitos 
   verificadores corretos.
```

### 🤔 Por que estou vendo isso?

O CNPJ que você digitou não é válido (dígitos verificadores incorretos).

### ✅ Solução:

Use um CNPJ válido real. Exemplos para teste:

```
✅ 11.222.333/0001-81
✅ 00.000.000/0001-91
```

**🔗 Validador online:** Busque "validar CNPJ" no Google

---

## 🔴 "Este CNPJ já está cadastrado"

```
❌ Este CNPJ já está cadastrado. Por favor, use outro CNPJ.
```

### 🤔 Por que estou vendo isso?

Já existe uma solicitação de publicador com este CNPJ.

### ✅ Soluções:

1. **Use outro CNPJ**
2. **Verifique se você já se cadastrou antes**
   - Talvez você já tenha uma solicitação pendente
   - Faça login e verifique
3. **Entre em contato:** suporte@pagefy.com

---

## 🔴 Não consigo adicionar resenha

```
(Botão "Adicionar Resenha" está cinza/desabilitado)
```

### 🤔 Por que não funciona?

Você só pode adicionar resenhas para livros marcados como **"Lido"**.

### ✅ Solução em 4 passos:

```
1️⃣ Vá na página do livro
     ⬇️
2️⃣ Clique "Adicionar à Estante"
     ⬇️
3️⃣ Selecione "Lendo" → depois "Lido"
     ⬇️
4️⃣ Agora pode adicionar resenha!
```

**Regra:** Para Ler → Lendo → Lido (nesta ordem!)

---

## 🔴 Tela em branco ao clicar em perfil

```
(Tela fica branca/vazia após clicar no perfil de um usuário)
```

### 🤔 Por que acontece?

Bug já corrigido, mas pode persistir em cache.

### ✅ Soluções:

```
Opção 1: Recarregar (F5)
Opção 2: Ctrl+Shift+R (hard reload)
Opção 3: Limpar cache do navegador
Opção 4: Logout → Login
```

---

## 🔴 "Você deve ter pelo menos 5 anos"

```
❌ Você deve ter pelo menos 5 anos de idade para criar uma conta.
```

### 🤔 Por que estou vendo isso?

A data de nascimento que você digitou indica menos de 5 anos de idade.

### ✅ Solução:

Digite uma data de nascimento válida (mínimo 5 anos atrás).

**Exemplo para hoje (2025):**
```
✅ 01/01/2020 ou anterior
❌ 01/01/2023 (muito recente)
```

---

## 🔴 "Failed to create profile"

```
❌ Failed to create profile
```

### 🤔 Por que acontece?

Erro ao criar perfil no banco de dados.

### ✅ O que fazer:

```
1️⃣ Tente novamente com outro email
     ⬇️
2️⃣ Se persistir, entre em contato:
     📧 suporte@pagefy.com
     ⬇️
3️⃣ Informe:
     - Email que tentou usar
     - Mensagem de erro completa
     - Console do navegador (F12)
```

---

## 🆘 Nenhuma dessas soluções funcionou?

### 📋 Checklist antes de pedir ajuda:

- [ ] Li este documento
- [ ] Li [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)
- [ ] Li [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [ ] Tentei em outra janela anônima
- [ ] Limpei cache do navegador
- [ ] Verifiquei Console (F12)

### 📧 Entre em contato:

**Email:** suporte@pagefy.com

**Inclua:**
- ✅ Mensagem de erro COMPLETA
- ✅ O que você estava tentando fazer
- ✅ Screenshot (se possível)
- ✅ Console do navegador (F12 → copie erros em vermelho)
- ✅ Seu email de cadastro (NÃO envie senha!)

---

## 📚 Documentação Completa

| Documento | Quando usar |
|-----------|-------------|
| [DOCUMENTACAO.md](./DOCUMENTACAO.md) | 📑 Índice geral |
| [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) | 🚀 Primeira vez |
| **ERROS_FREQUENTES.md** | ⚡ **Solução rápida** |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 🔧 Solução detalhada |
| [README.md](./README.md) | 📖 Visão geral |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | 🛠️ Configuração técnica |

---

## 🎯 Atalhos Rápidos

### Erro de Login?
**→** Seção "Invalid login credentials" acima ⬆️

### Erro 403?
**→** Seção "Erro 403 no Deploy" acima ⬆️

### Conta Bloqueada?
**→** Seção "Conta temporariamente bloqueada" acima ⬆️

### Problema com CNPJ?
**→** Seções "CNPJ inválido" e "CNPJ já cadastrado" acima ⬆️

### Não encontrou seu erro?
**→** Leia [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**💡 Dica Final:** A maioria dos problemas se resolve lendo [INICIO_RAPIDO.md](./INICIO_RAPIDO.md) e criando uma conta corretamente!

---

**Versão:** 1.0 | **Data:** Novembro 2025
