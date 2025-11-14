# 🚀 Setup Rápido - Pagefy

## 🎯 Objetivo
Fazer o aplicativo Pagefy funcionar completamente em 5 minutos.

---

## ⚡ Passo a Passo (5 minutos)

### 1️⃣ Execute a Migration SQL (2 min)

**O QUE FAZER:**
1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione o projeto Pagefy
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **+ New query**
5. Abra o arquivo `/MIGRATION_ADD_CNPJ_BIRTHDATE.sql` deste projeto
6. Copie TODO o conteúdo
7. Cole no SQL Editor
8. Clique em **Run**
9. Aguarde a mensagem de sucesso: ✅

**POR QUÊ:**
- Adiciona coluna `birth_date` (data de nascimento dos leitores)
- Adiciona coluna `cnpj` (CNPJ dos publicadores)
- Ambas são necessárias para recuperação de senha

**RESULTADO ESPERADO:**
```
✅ Coluna birth_date adicionada com sucesso
✅ Coluna cnpj adicionada com sucesso
```

---

### 2️⃣ Desabilite Confirmação de Email (1 min) - OPCIONAL

**O QUE FAZER:**
1. No Supabase Dashboard, vá em **Authentication**
2. Clique em **Providers**
3. Clique em **Email**
4. Encontre **"Confirm email"**
5. **DESABILITE** esta opção
6. Clique em **Save**

**POR QUÊ:**
- Remove erro: "Email not confirmed"
- Usuários podem fazer login imediatamente após criar conta
- Sem necessidade de confirmar email

**RESULTADO ESPERADO:**
- Usuários podem fazer login instantaneamente

---

### 3️⃣ Recarregue a Aplicação (10 seg)

**O QUE FAZER:**
1. Pressione **F5** ou **Ctrl+R** no navegador
2. Ou feche e abra a aba novamente

**POR QUÊ:**
- Atualiza o cache do Supabase
- Carrega as novas colunas do banco

---

### 4️⃣ Teste a Aplicação (2 min)

**TESTE 1: Criar Conta de Leitor**
1. Clique em "Criar Conta"
2. Selecione "Leitor"
3. Preencha:
   - Nome: João Silva
   - Data de Nascimento: 01/01/2000
   - Email: joao@teste.com
   - Senha: 123456
4. Clique em "Criar Conta"
5. ✅ Deve mostrar: "Conta criada com sucesso!"
6. Faça login com o mesmo email e senha
7. ✅ Deve entrar na aplicação

**TESTE 2: Criar Conta de Publicador**
1. Clique em "Criar Conta"
2. Selecione "Publicador"
3. Preencha:
   - Nome da Empresa: Editora XYZ
   - CNPJ: 12.345.678/0001-90
   - Email: editora@teste.com
   - Senha: 123456
4. Clique em "Solicitar Conta Corporativa"
5. ✅ Deve mostrar: "Solicitação enviada!"
6. Faça login com o mesmo email e senha
7. ✅ Deve entrar (com acesso de leitor até aprovação)

---

## 🎉 Pronto!

Se os testes funcionaram, você está com o Pagefy 100% operacional!

---

## 📊 Como Saber se Está Funcionando

### ✅ Sinais de Sucesso:

1. **No Console do Navegador (F12):**
   ```
   [Auth] Adding birth_date to profile: 2000-01-01
   [Auth] Adding CNPJ to profile: 12.345.678/0001-90
   [Auth] Profile created successfully
   ✅ Login bem-sucedido
   ```

2. **Na Interface:**
   - Toast verde: "Conta criada com sucesso!"
   - Login funciona imediatamente
   - Sem erros de "Email not confirmed"

### ❌ Sinais de Problema:

1. **Erro no Console:**
   ```
   [Auth] Profile creation error: { "code": "PGRST204" }
   ```
   **Solução:** Execute o SQL novamente (Passo 1)

2. **Erro na Interface:**
   ```
   Error: Falha ao criar perfil
   ```
   **Solução:** Execute o SQL novamente (Passo 1)

3. **Erro de Email:**
   ```
   Login error: AuthApiError: Email not confirmed
   ```
   **Solução:** Desabilite confirmação de email (Passo 2)

---

## 🔧 Recursos Adicionais

### Se houver usuários com erro:
- Use `/LIMPAR_USUARIOS_COM_ERRO.sql`
- Veja instruções detalhadas em `/EXECUTAR_AGORA.md`

### Documentação Completa:
- `/CORRECOES_IMPLEMENTADAS.md` - Todas as correções aplicadas
- `/EXECUTAR_AGORA.md` - Guia detalhado com troubleshooting
- `/MIGRATION_ADD_CNPJ_BIRTHDATE.sql` - Script SQL para executar

---

## 🆘 Problemas Comuns

### "User already registered"
**Causa:** Você tentou criar conta antes de executar o SQL, e o usuário ficou no auth sem perfil.

**Solução:**
1. Use outro email, OU
2. Delete o usuário: Dashboard → Authentication → Users → Delete

### "Could not find the 'cnpj' column"
**Causa:** O SQL não foi executado ainda.

**Solução:** Execute o Passo 1 acima

### "No birthDate provided!" (aviso amarelo)
**Causa:** Você está criando conta de publicador.

**Status:** ✅ Normal - Publicadores não precisam de data de nascimento

---

## 📞 Suporte

Se você seguiu todos os passos e ainda há problemas:

1. Verifique os logs no console (F12)
2. Tire um print do erro
3. Verifique se o SQL foi executado:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
     AND column_name IN ('birth_date', 'cnpj');
   ```
   Deve retornar 2 linhas.

---

**Última atualização:** 2024  
**Tempo total:** 5 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
