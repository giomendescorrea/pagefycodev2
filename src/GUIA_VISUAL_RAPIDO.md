# 🎯 Guia Visual Rápido - Resolução de Problemas

## 🚦 Está vendo erro no console?

```
┌─────────────────────────────────────────────────┐
│  Você está vendo erro no console/tela?         │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
       SIM                     NÃO
        │                       │
        ▼                       ▼
  ┌──────────┐          ┌──────────────┐
  │ Qual     │          │ Tudo certo!  │
  │ erro?    │          │ Continue     │
  └──────────┘          │ usando! 🎉   │
        │               └──────────────┘
        │
        ├── "Table not found" → Vá para [A]
        ├── "Email já cadastrado" → Vá para [B]
        └── "Permission denied" → Vá para [C]
```

---

## [A] Erro: "Could not find the table"

```
❌ "Could not find the table 'unlock_requests'"
❌ "PGRST205"

┌─────────────────────────────────────┐
│  SOLUÇÃO RÁPIDA (5 minutos)        │
└─────────────────────────────────────┘

1️⃣  Abra o Supabase
    https://supabase.com/dashboard
    
2️⃣  Selecione projeto "Pagefy"

3️⃣  SQL Editor → + New query

4️⃣  Copie arquivo: MIGRATION_UNLOCK_REQUESTS.sql
    Cole no editor
    Clique RUN
    
5️⃣  Recarregue seu app (F5)

✅ Problema resolvido!

📖 Guia detalhado: IMPORTANTE_EXECUTAR_MIGRATIONS.md
```

---

## [B] Erro: "Email já cadastrado"

```
❌ "Este email já está cadastrado"

┌─────────────────────────────────────┐
│  ESCOLHA UMA OPÇÃO:                │
└─────────────────────────────────────┘

Opção 1: USE OUTRO EMAIL
┌────────────────────────┐
│ exemplo2@email.com     │
└────────────────────────┘

Opção 2: FAÇA LOGIN
┌────────────────────────┐
│ Já tenho conta         │
│ [Entrar] ──────────────┤
└────────────────────────┘

Opção 3: RECUPERE SENHA
┌────────────────────────┐
│ Esqueceu senha?        │
│ [Recuperar] ───────────┤
└────────────────────────┘

Opção 4 (DEV): DELETE A CONTA
Supabase → Authentication → Users
→ Encontre email → Delete
```

---

## [C] Erro: "Permission denied"

```
❌ "Permission denied"
❌ "RLS policy"

┌─────────────────────────────────────┐
│  VERIFICAR:                        │
└─────────────────────────────────────┘

1️⃣  Você está logado?
    └─ NÃO → Faça login
    └─ SIM → Continue

2️⃣  Seu usuário tem permissão?
    └─ Precisa ser ADMIN?
    └─ Verifique role no Supabase:
       Table Editor → profiles
       → Seu registro → role = 'admin'

3️⃣  Ainda com erro?
    └─ Verifique políticas RLS
    └─ Supabase → Database → Policies
```

---

## 🔍 Diagnóstico Automático

```
┌─────────────────────────────────────────────┐
│  FERRAMENTA DE DIAGNÓSTICO                 │
└─────────────────────────────────────────────┘

1. Abra console do navegador (F12)

2. Digite:
   ┌──────────────────┐
   │ runDiagnostic()  │
   └──────────────────┘

3. Aguarde resultado:

   ✅ Tudo Verde → Está OK!
   ❌ Algo Vermelho → Siga instruções na tela

4. A ferramenta te dirá EXATAMENTE o que fazer!
```

---

## 📚 Mapa de Documentação

```
                    DOCUMENTAÇÃO
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     INÍCIO          PROBLEMA          AVANÇADO
        │                │                │
        ▼                ▼                ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ LEIA_    │    │ SOLUCAO_ │    │ STATUS_  │
  │ PRIMEIRO │    │ RAPIDA   │    │ PROJETO  │
  └──────────┘    └──────────┘    └──────────┘
        │                │                │
        ▼                ▼                ▼
  Começando      Erro específico    Visão geral
  do zero        Solução rápida     completa
```

### Quando usar cada documento:

```
┌─────────────────────────────────────────────┐
│ LEIA_PRIMEIRO.md                           │
│ ➜ Primeira vez usando o app               │
│ ➜ Quer entender o básico                  │
│ ➜ Precisa de overview rápido              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ SOLUCAO_RAPIDA_ERROS.md                    │
│ ➜ Está com erro AGORA                     │
│ ➜ Precisa de solução RÁPIDA               │
│ ➜ Quer copiar/colar comandos              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ IMPORTANTE_EXECUTAR_MIGRATIONS.md          │
│ ➜ Precisa executar migrations             │
│ ➜ Quer guia passo a passo detalhado       │
│ ➜ Primeira instalação                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ STATUS_PROJETO.md                          │
│ ➜ Quer saber o que está implementado      │
│ ➜ Procura roadmap                          │
│ ➜ Quer visão técnica completa             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ CHECKLIST_SETUP.md                         │
│ ➜ Fazendo setup inicial                   │
│ ➜ Preparando para produção                │
│ ➜ Quer testar tudo sistematicamente       │
└─────────────────────────────────────────────┘
```

---

## ⚡ Comandos Rápidos

### No Console do Navegador (F12):

```javascript
// 1. Diagnóstico completo
runDiagnostic()

// 2. Verificar emails
import { checkForUnnormalizedEmails } from './utils/migrateEmails'
await checkForUnnormalizedEmails()

// 3. Corrigir emails
import { migrateEmailsToLowercase } from './utils/migrateEmails'
await migrateEmailsToLowercase()

// 4. Ver versão do Supabase
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

### No SQL Editor do Supabase:

```sql
-- 1. Ver todas as tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Verificar se unlock_requests existe
SELECT * FROM unlock_requests LIMIT 1;

-- 3. Verificar colunas de bloqueio
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_locked', 'failed_login_attempts');

-- 4. Fazer você mesmo admin
UPDATE profiles SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';

-- 5. Ver quantos usuários tem
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

---

## 🎯 Fluxo de Resolução de Problemas

```
PROBLEMA
   │
   ├─ Tentou solução rápida?
   │  └─ NÃO → SOLUCAO_RAPIDA_ERROS.md
   │  └─ SIM → Continue
   │
   ├─ Executou runDiagnostic()?
   │  └─ NÃO → Abra console, rode comando
   │  └─ SIM → Viu o que faltou?
   │
   ├─ Executou migrations?
   │  └─ NÃO → IMPORTANTE_EXECUTAR_MIGRATIONS.md
   │  └─ SIM → Continue
   │
   ├─ Recarregou app (F5)?
   │  └─ NÃO → Recarregue agora
   │  └─ SIM → Continue
   │
   └─ Ainda com problema?
      └─ Veja TROUBLESHOOTING.md
```

---

## 🏃 Atalhos para Ações Comuns

### Criar conta Admin:
```
1. Crie usuário normal no app
2. Supabase → Table Editor → profiles
3. Encontre seu registro
4. Edite: role = 'admin'
5. Salve
6. Faça logout e login novamente
```

### Resetar senha de teste:
```
1. Supabase → Authentication → Users
2. Encontre o usuário
3. Clique nos 3 pontos (...)
4. Send Password Recovery
   (ou Delete User para recriar)
```

### Limpar dados de teste:
```sql
-- No SQL Editor:
DELETE FROM reviews;
DELETE FROM comments;
DELETE FROM notes;
DELETE FROM quotes;
DELETE FROM user_books;
DELETE FROM follows;
DELETE FROM notifications;
DELETE FROM publisher_requests;
DELETE FROM unlock_requests;

-- NÃO delete profiles ou books!
```

---

## 📱 Interface do App

```
┌─────────────────────────────────┐
│  [←]  Página Atual              │
│                                 │
│  [Conteúdo da página]          │
│                                 │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [🏠] [🔍] [👤] [📚] [☰]        │
│ Home Busca Perfil Est. Menu     │
└─────────────────────────────────┘
```

### Navegação Rápida:
- 🏠 **Home** → Feed de atividades
- 🔍 **Busca** → Procurar livros
- 👤 **Perfil** → Seu perfil e configurações
- 📚 **Estante** → Seus livros organizados
- ☰ **Menu** → Configurações e recursos especiais

### Recursos do Menu:
```
☰ MENU
  ├─ Editar Perfil
  ├─ Notificações
  ├─ Solicitar Perfil de Publicador
  ├─ Painel do Administrador (só admin)
  ├─ Painel do Publicador (só publisher)
  ├─ Ajuda e Suporte
  └─ Sair
```

---

## 🎨 Código de Cores dos Logs

```
🟢 Verde (✅)  = OK, funcionou
🟡 Amarelo (⚠️) = Aviso, não é crítico
🔴 Vermelho (❌) = Erro, precisa atenção
🔵 Azul (ℹ️)   = Informação
```

Quando ver:
- **Muitos ✅** → Tudo OK!
- **Alguns ⚠️** → Verificar, mas não urgente
- **Vários ❌** → EXECUTE AS MIGRATIONS!

---

## 🆘 SOS - Emergência

### Se NADA funcionar:

```
┌─────────────────────────────────────────┐
│  RESET COMPLETO (ÚLTIMO RECURSO)       │
└─────────────────────────────────────────┘

⚠️  ATENÇÃO: Apaga TODOS os dados!

1. Supabase → Database → Tables
2. Delete TODAS as tabelas (menos system)
3. SQL Editor → Execute todas as migrations:
   - Setup inicial
   - MIGRATION_ACCOUNT_LOCKING.sql
   - MIGRATION_UNLOCK_REQUESTS.sql
4. Recarregue app
5. Dados de exemplo serão recriados

💡 Backup primeiro se tiver dados importantes!
```

---

## ✅ Checklist de 2 Minutos

Antes de pedir ajuda, verifique:

- [ ] Executou as 2 migrations SQL?
- [ ] Recarregou a página depois?
- [ ] Rodou `runDiagnostic()` no console?
- [ ] Leu a mensagem de erro completa?
- [ ] Verificou que está no projeto certo do Supabase?
- [ ] Tentou fazer logout e login novamente?

Se tudo ✅, vá para documentação específica do seu problema.

---

**Última atualização:** 10/01/2025

💡 **Lembre-se:** A maioria dos problemas se resolve executando as migrations SQL! 
