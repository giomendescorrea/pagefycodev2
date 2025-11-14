# ❓ FAQ - Migrations Pendentes

## Perguntas Frequentes

### 1. O que é o banner laranja que aparece no topo?

É um aviso amigável de que existem funcionalidades opcionais que podem ser ativadas executando scripts SQL no Supabase. **Não é um erro!**

Você pode:
- ✅ Dispensar o aviso clicando no X
- ✅ Executar as migrations para ativar as funcionalidades extras
- ✅ Ignorar completamente se não precisar das funcionalidades

---

### 2. Meu app está quebrado?

**Não!** O app está funcionando perfeitamente. As funcionalidades principais estão todas ativas:
- Login e cadastro ✅
- Livros e resenhas ✅
- Comentários e citações ✅
- Feed e perfis ✅
- Tudo funciona! ✅

---

### 3. O que são "migrations pendentes"?

São atualizações opcionais do banco de dados que adicionam funcionalidades extras como:
- Sistema de bloqueio de contas após tentativas de login falhas
- Painel para gerenciar solicitações de desbloqueio

---

### 4. Sou obrigado a executar as migrations?

**Não!** Você pode:
- Continuar usando o app normalmente sem executá-las
- Executar quando tiver tempo
- Executar apenas se precisar das funcionalidades extras
- Nunca executar, se não precisar

---

### 5. Como faço para dispensar o aviso?

Clique no **X** no canto superior direito do banner laranja. O aviso não aparecerá novamente (até você limpar o cache do navegador).

---

### 6. Como executo as migrations?

**Guia rápido:**

1. Acesse https://supabase.com/dashboard
2. Entre no seu projeto Pagefy
3. Clique em **SQL Editor**
4. Clique em **New query**
5. Copie e cole o conteúdo de `MIGRATION_ACCOUNT_LOCKING.sql`
6. Clique em **Run**
7. Repita para `MIGRATION_UNLOCK_REQUESTS.sql`
8. Recarregue a aplicação (F5)

**Guia completo:** Leia `README_MIGRATIONS.md`

---

### 7. Quanto tempo leva para executar?

⏱️ **Menos de 2 minutos** para executar todas as migrations!

Cada migration leva cerca de 5-10 segundos.

---

### 8. Posso quebrar alguma coisa executando as migrations?

**Não!** As migrations são seguras porque:
- ✅ Usam `IF NOT EXISTS` (só criam se não existir)
- ✅ Não deletam dados existentes
- ✅ São idempotentes (podem ser executadas várias vezes)
- ✅ Têm comandos de rollback se precisar reverter

---

### 9. Já executei as migrations mas o aviso ainda aparece

Tente:
1. **Recarregar a página** (F5 ou Ctrl+R)
2. **Dispensar manualmente** (clique no X)
3. **Limpar o cache** do navegador
4. **Verificar o console** (F12) se há erros

---

### 10. O que significa "Success. No rows returned"?

✅ **Perfeito!** Significa que a migration foi executada com sucesso. É a mensagem esperada.

---

### 11. Apareceu "relation already exists". É erro?

✅ **Não é erro!** Significa que a tabela já foi criada anteriormente. Continue normalmente.

---

### 12. Posso executar as migrations em produção?

**Sim!** Mas siga as boas práticas:
1. ✅ Faça backup do banco de dados antes
2. ✅ Teste primeiro em desenvolvimento/staging
3. ✅ Execute em horário de baixo tráfego
4. ✅ Monitore após a execução

---

### 13. Preciso ser administrador para executar?

Sim, você precisa ser **owner** ou ter permissões de **admin** no projeto Supabase.

Se você não tem acesso:
- Peça para o administrador do projeto executar
- Ou peça permissões de admin no Supabase

---

### 14. O que fazer se der erro ao executar?

1. 📸 Tire um screenshot do erro
2. 📋 Copie a mensagem de erro completa
3. 🔍 Procure no `TROUBLESHOOTING.md`
4. 📧 Entre em contato com suporte técnico

**Erros comuns:**
- "permission denied" → Você não é owner do projeto
- "relation already exists" → Normal! A tabela já existe
- "column already exists" → Normal! A coluna já existe

---

### 15. Posso executar só uma migration?

**Sim!** Você pode executar apenas as que precisar.

Mas recomendamos executar na ordem:
1. `MIGRATION_ACCOUNT_LOCKING.sql` (primeiro)
2. `MIGRATION_UNLOCK_REQUESTS.sql` (depende da primeira)
3. `MIGRATION_CLEAN_MOCK_BOOKS.sql` (independente, opcional)

---

### 16. E se eu mudar de ideia depois?

Sem problemas! Cada migration tem comandos de **ROLLBACK** para desfazer as alterações.

Exemplo de rollback no final de cada arquivo SQL.

---

### 17. As migrations afetam os dados existentes?

**Não!** As migrations apenas:
- ➕ Adicionam novas tabelas
- ➕ Adicionam novas colunas
- ⚙️ Configuram políticas de segurança

**Nunca:**
- ❌ Deletam dados
- ❌ Modificam dados existentes
- ❌ Removem tabelas ou colunas

---

### 18. Preciso executar sempre que atualizar o app?

**Não!** As migrations são executadas **uma vez só**.

Depois de executadas, você não precisa fazer nada novamente, mesmo após atualizações do app.

---

### 19. Como sei se as migrations foram executadas?

**Via Supabase:**
1. Vá em **Table Editor**
2. Procure pela tabela `unlock_requests`
3. Se existir, as migrations foram executadas!

**Via Aplicação:**
1. O banner laranja não aparece mais
2. No painel admin, a aba "Desbloqueios" está visível

---

### 20. Onde encontro mais informações?

📚 **Documentação completa:**
- `README_MIGRATIONS.md` - Guia completo de migrations
- `IMPORTANTE_EXECUTAR_MIGRATIONS.md` - Instruções passo a passo
- `TROUBLESHOOTING.md` - Solução de problemas
- `SUPABASE_SETUP.md` - Configuração do Supabase

💡 **Console do navegador:**
- Pressione F12
- Vá na aba Console
- Veja instruções detalhadas

---

## 🎯 Resumo Rápido

**Você viu o aviso de migrations pendentes?**

1. ✅ Não se preocupe, não é erro
2. ✅ O app funciona normalmente
3. ✅ Você pode dispensar o aviso
4. ✅ Ou executar as migrations quando quiser
5. ✅ Leva menos de 2 minutos
6. ✅ Completamente seguro

**Quer executar agora?**
👉 Leia: `README_MIGRATIONS.md`

**Quer ignorar?**
👉 Clique no X do banner laranja

**Precisa de ajuda?**
👉 Veja: `TROUBLESHOOTING.md`

---

**Última atualização:** 10/11/2025
