# 🔧 Troubleshooting - Pagefy

## ❌ Erros Comuns e Soluções

### 🔐 Erros de Autenticação

#### "Email não encontrado"

**Sintomas:**
```
Email não encontrado
Este email não está cadastrado no sistema.
Primeira vez aqui? Clique em "Criar Conta" para se cadastrar.
```

**Causa:** Este é o erro mais comum para novos usuários. O email que você digitou não existe no sistema.

**Solução:**
1. ✅ Clique em **"Criar Conta"** para fazer seu cadastro
2. ✅ O Pagefy não tem usuários pré-cadastrados
3. ✅ Consulte `INICIO_RAPIDO.md` para instruções de cadastro

**Importante:** Este NÃO conta como tentativa falha de login, pois o email não existe.

---

#### "Senha incorreta"

**Sintomas:**
```
Senha incorreta
A senha que você digitou está incorreta.
Atenção: Você tem X tentativa(s) restante(s) antes da conta ser bloqueada.
```

**Causa:** O email existe no sistema, mas a senha está errada.

**Soluções:**
1. ✅ Verifique se digitou a senha corretamente
2. ✅ A senha é case-sensitive (diferencia maiúsculas e minúsculas)
3. ⚠️ **ATENÇÃO:** Você tem um número limitado de tentativas
4. 🛑 **PARE** após 2-3 tentativas se não lembrar a senha
5. 📧 Entre em contato com suporte@pagefy.com para resetar senha

**Contador de Tentativas:**
- 1ª tentativa errada: 4 tentativas restantes
- 2ª tentativa errada: 3 tentativas restantes
- 3ª tentativa errada: 2 tentativas restantes
- 4ª tentativa errada: 1 tentativa restante
- 5ª tentativa errada: **Conta bloqueada automaticamente**

---

#### "Invalid login credentials" (Erro Antigo)

**Nota:** Este erro genérico foi **substituído** por mensagens mais específicas:
- "Email não encontrado" → quando email não existe
- "Senha incorreta" → quando email existe mas senha está errada

Se ainda vir este erro, pode ser:
1. Erro de conexão com o banco de dados
2. Problema com o Supabase
3. Bug no sistema → Reporte para suporte@pagefy.com

#### "Este email já está cadastrado"

**Causa:** Você já criou uma conta com este email anteriormente.

**Soluções:**
1. Use a tela de LOGIN (não signup) com suas credenciais
2. Se esqueceu a senha, entre em contato com o administrador
3. Use outro email para criar uma nova conta

#### "Conta bloqueada"

**Sintomas:**
```
Conta bloqueada

Sua conta foi bloqueada após 5 tentativas de login sem sucesso por motivos de segurança.

Uma solicitação de desbloqueio foi automaticamente enviada aos administradores.

Aguarde a análise ou entre em contato: suporte@pagefy.com
```

**Causa:** 5 tentativas de login com senha incorreta.

**O que aconteceu:**
1. 🔒 Sua conta foi bloqueada automaticamente por segurança
2. 📧 Você recebeu um email de notificação
3. 🔔 Todos os administradores foram notificados automaticamente
4. 📝 Uma solicitação de desbloqueio foi criada

**O que fazer:**
1. ✉️ Verifique seu email para confirmação de bloqueio
2. ⏳ Aguarde a análise do administrador (geralmente até 24h)
3. 📞 Ou entre em contato: **suporte@pagefy.com** para agilizar
4. 🔓 O admin desbloqueará sua conta pelo Painel de Administrador
5. ✅ Você receberá um email quando for desbloqueado

**Importante:** 
- ❌ Não tente criar uma nova conta, isso não resolverá o problema
- ❌ Não tente fazer login novamente enquanto bloqueado
- ✅ Certifique-se de lembrar sua senha correta antes de tentar novamente

**Para Administradores:**
- Acesse o Painel de Administrador → Aba "Usuários"
- Usuários bloqueados aparecem com badge laranja "🔒 Bloqueado"
- Clique no botão de cadeado aberto para desbloquear
- O usuário receberá email automático de confirmação

Veja `SISTEMA_BLOQUEIO.md` para detalhes completos do sistema de segurança.

---

### 🚀 Erros de Deploy

#### Erro 403 no deploy de Edge Functions

**Sintomas:**
```
Error while deploying: XHR for "/api/integrations/supabase/.../edge_functions/make-server/deploy" failed with status 403
```

**Causas e Soluções:**

1. **Permissões insuficientes**
   - ✅ Verifique se você é admin do projeto Supabase
   - ✅ Vá em Supabase Dashboard → Settings → API
   - ✅ Confirme que o Service Role Key está presente

2. **Arquivos duplicados (.tsx e .ts)**
   - ⚠️ Existem arquivos .tsx (protegidos) e .ts nas pastas
   - ✅ Os arquivos .ts são os corretos para edge functions
   - ℹ️ Os arquivos .tsx não podem ser deletados (protegidos pelo sistema)

3. **Workaround - Deploy Manual:**
   ```bash
   # Instale o Supabase CLI
   npm install -g supabase
   
   # Faça login
   supabase login
   
   # Link ao projeto
   supabase link --project-ref tvdgzsqrkryzqdjpqoqr
   
   # Deploy manual
   supabase functions deploy make-server
   ```

4. **Alternativa - Ignorar o erro**
   - O erro 403 pode ser ignorado se a função já estiver deployada
   - Teste se o signup funciona mesmo com o erro 403
   - Se funcionar, o deploy anterior ainda está válido

---

### 📝 Erros de Cadastro

#### "CNPJ inválido"

**Causa:** CNPJ com dígitos verificadores incorretos.

**Solução:**
- Use um CNPJ válido real
- Formato: 12.345.678/0001-90
- O sistema valida os dígitos verificadores

**Para teste rápido (CNPJs válidos de exemplo):**
- 11.222.333/0001-81
- 00.000.000/0001-91

#### "Este CNPJ já está cadastrado"

**Causa:** Já existe uma solicitação de publisher com este CNPJ.

**Soluções:**
1. Use outro CNPJ
2. Verifique se você já tem uma solicitação pendente
3. Entre em contato com o administrador

#### "Uma empresa com este nome já está cadastrada"

**Causa:** Já existe um perfil com este nome de empresa.

**Solução:** Use outro nome para sua empresa.

#### "Você deve ter pelo menos 5 anos"

**Causa:** Data de nascimento indicando idade inferior a 5 anos.

**Solução:** Insira uma data de nascimento válida (mínimo 5 anos de idade).

---

### 📱 Erros de Interface

#### Tela em branco após clicar em perfil de usuário

**Status:** ✅ CORRIGIDO

**Era causado por:** Bug no roteamento da UserProfileView.

**Se ainda ocorrer:**
1. Recarregue a página (F5)
2. Faça logout e login novamente
3. Limpe o cache do navegador

#### Não consigo adicionar resenha

**Causa:** Você só pode adicionar resenhas para livros marcados como "lido".

**Solução:**
1. Vá na página do livro
2. Clique em "Adicionar à Estante"
3. Selecione "Lendo" primeiro
4. Depois mude para "Lido"
5. Agora você pode adicionar resenhas

**Importante:** O sistema só permite ir de "Para Ler" → "Lendo" → "Lido".

#### Notificações não aparecem

**Verificações:**
1. Você está na tela correta? (ícone de sino no topo)
2. Há outras pessoas no sistema para interagir?
3. Você seguiu alguém ou comentou em algo?

**Para testar:**
1. Crie uma segunda conta
2. Siga sua conta principal com a segunda conta
3. Verifique se a notificação aparece

---

### 🗄️ Erros de Banco de Dados

#### "Profile not found"

**Causa:** Usuário foi criado no auth mas não tem perfil na tabela profiles.

**Solução (Admin):**
1. Acesse Supabase Dashboard → Database → Tables → profiles
2. Verifique se o perfil existe
3. Se não existir, delete o usuário do Auth e recrie

#### "Failed to create profile"

**Causa:** Erro ao inserir na tabela profiles durante signup.

**Possíveis razões:**
- Constraint violada (email duplicado)
- Permissões RLS incorretas
- Tabela profiles não existe

**Solução:**
1. Verifique se a tabela profiles existe no Supabase
2. Consulte `SUPABASE_SETUP.md` para schema correto
3. Recrie as tabelas se necessário

---

### 🔍 Diagnóstico Geral

#### Como verificar se o Supabase está funcionando

**Teste rápido:**
1. Acesse `https://tvdgzsqrkryzqdjpqoqr.supabase.co/rest/v1/`
2. Se retornar JSON ou erro de auth, está funcionando
3. Se der timeout, o Supabase está offline

#### Como verificar se a edge function está funcionando

**Teste de health check:**
```bash
curl https://tvdgzsqrkryzqdjpqoqr.supabase.co/functions/v1/make-server-5ed9d16e/health
```

**Resposta esperada:**
```json
{"status":"ok"}
```

#### Logs do navegador

Abra o Console do navegador (F12) e procure por:
- ❌ Erros em vermelho
- ⚠️ Warnings em amarelo
- 📝 Mensagens de log que começam com `[Auth]`, `[Admin]`, etc.

Copie e cole as mensagens relevantes ao reportar problemas.

---

## 🆘 Quando Pedir Ajuda

Antes de pedir ajuda, colete as seguintes informações:

1. **Erro exato:**
   - Copie a mensagem de erro completa
   - Tire um screenshot se possível

2. **O que você estava fazendo:**
   - Passo a passo para reproduzir o erro
   - Em qual tela/função ocorreu

3. **Console do navegador:**
   - Abra F12 → Console
   - Copie mensagens de erro em vermelho

4. **Informações da conta:**
   - Tipo de conta (leitor/publicador/admin)
   - Email usado (NÃO envie a senha!)

**Email de suporte:** suporte@pagefy.com

---

## 📚 Documentos Relacionados

- `INICIO_RAPIDO.md` - Como começar a usar o Pagefy
- `SUPABASE_SETUP.md` - Configuração técnica do banco de dados
- `README.md` - Visão geral do projeto
- `/supabase/functions/README.md` - Documentação das edge functions

---

## ✅ Checklist de Troubleshooting

Use este checklist antes de pedir ajuda:

- [ ] Li o `INICIO_RAPIDO.md`
- [ ] Criei uma conta (não tentei apenas fazer login)
- [ ] Verifiquei se digitei email e senha corretamente
- [ ] Verifiquei o console do navegador (F12)
- [ ] Tentei fazer logout e login novamente
- [ ] Limpei o cache do navegador
- [ ] Testei em uma janela anônima/privada
- [ ] Verifiquei se o Supabase está online
- [ ] Li a seção relevante neste documento

Se todos os itens acima foram verificados e o problema persiste, entre em contato com suporte@pagefy.com incluindo as informações da seção "Quando Pedir Ajuda".

---

**Última atualização:** Novembro 2025  
**Versão do documento:** 1.0
