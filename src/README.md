# Pagefy - Plataforma de Resenhas de Livros

> 🚀 **Primeira vez aqui?** Leia [LEIA_PRIMEIRO.md](./LEIA_PRIMEIRO.md) ⭐  
> ⚡ **Execução Rápida:** [IMPORTANTE_EXECUTAR_MIGRATIONS.md](./IMPORTANTE_EXECUTAR_MIGRATIONS.md) ⚠️  
> 🔧 **Com erro?** Leia [SOLUCAO_RAPIDA_ERROS.md](./SOLUCAO_RAPIDA_ERROS.md)  
> 📊 **Status do Projeto:** [STATUS_PROJETO.md](./STATUS_PROJETO.md)  
> 📚 **Índice Completo:** [INDICE_DOCUMENTACAO.md](./INDICE_DOCUMENTACAO.md)

## ⚠️ AÇÃO NECESSÁRIA

**Antes de usar o aplicativo, você DEVE executar as migrations SQL no Supabase!**

1. Leia: [IMPORTANTE_EXECUTAR_MIGRATIONS.md](./IMPORTANTE_EXECUTAR_MIGRATIONS.md)
2. Execute: `MIGRATION_ACCOUNT_LOCKING.sql`
3. Execute: `MIGRATION_UNLOCK_REQUESTS.sql`
4. Recarregue a aplicação (F5)

**Depois disso, o app estará 100% funcional!** 🎉

## 📚 Sobre o Projeto

Pagefy é uma plataforma mobile-first de resenhas de livros onde usuários podem fazer login, cadastro, adicionar comentários e resenhas sobre livros, seguir outros leitores e muito mais.

## 🎭 Tipos de Usuários

### 👤 Usuário Regular
- Login com qualquer email (exceto os especiais abaixo)
- Visualizar e curtir resenhas
- Adicionar comentários e resenhas
- Seguir outros usuários
- Gerenciar estante pessoal
- Receber notificações

### 📚 Publicador
- **Email de teste:** `publisher@pagina42.com` ou qualquer email com "editora"
- Todas as funcionalidades de usuário regular
- Acesso ao Painel do Publicador
- Adicionar novos livros à plataforma
- Gerenciar livros publicados (publicar/despublicar)
- Ver estatísticas de visualizações e avaliações
- Organizar livros em rascunhos e publicados

### 🛡️ Administrador (Master)
- **Email de teste:** `admin@pagina42.com`
- Acesso total ao sistema
- Painel de Administração completo
- Gerenciar usuários (promover, suspender, excluir)
- Moderar denúncias
- Ver estatísticas do sistema
- Configurações avançadas
- Acesso ao Painel do Publicador

## 🎯 Funcionalidades Principais

### Navegação Inferior (5 Botões)
1. **Início** - Feed com resenhas e citações de livros
2. **Busca** - Buscar livros e pessoas com filtros avançados
3. **Estante** - Livros organizados por status (lido, lendo, quer ler, abandonado)
4. **Perfil** - Informações do usuário, estatísticas e histórico
5. **Menu** - Estatísticas, gráficos e acesso aos painéis especiais

### Notificações Push em Tempo Real
- ❤️ Curtidas em publicações
- 💬 Novos comentários
- 👥 Novos seguidores
- ⭐ Novas resenhas
- Badge com contador de não lidas
- Painel deslizante de notificações

### Sistema de Follow/Unfollow
- Buscar usuários na aba "Busca"
- Seguir/deixar de seguir com um clique
- Ver contadores de seguidores e seguindo no perfil
- Notificações quando alguém segue você

### Filtros Avançados de Busca
- **Por Gênero:** Ficção Científica, Fantasia, Romance, etc.
- **Por Período:** 1800s, 1900-1950, 1950-2000, 2000+
- **Busca Combinada:** Título, autor e descrição
- **Busca de Usuários:** Nome e biografia

### Painel do Publicador
- Adicionar novos livros com formulário completo
- Upload de capa (URL)
- Definir gênero e ano de publicação
- Gerenciar status (rascunho/publicado)
- Estatísticas de visualizações e avaliações
- Editar e excluir livros

### Painel do Administrador
- **Gestão de Usuários:**
  - Listar todos os usuários
  - Alterar permissões (user → publisher → admin)
  - Suspender/reativar usuários
  - Excluir usuários do sistema
  - Buscar usuários por nome ou email

- **Moderação:**
  - Ver denúncias pendentes
  - Aprovar ou rejeitar denúncias
  - Moderar conteúdo ofensivo

- **Estatísticas do Sistema:**
  - Total de usuários
  - Total de livros
  - Total de resenhas
  - Denúncias pendentes

- **Configurações:**
  - Modo de manutenção
  - Backup de dados
  - Limpar cache

## 🎨 Design Mobile

- Layout otimizado para dispositivos móveis
- Container máximo de 448px (max-w-md)
- Navegação inferior fixa e acessível
- Scroll independente para cada tela
- Feedback visual em todas as interações
- Toast notifications para ações importantes

## 🚀 Como Começar

### Primeiro Acesso
**⚠️ IMPORTANTE:** Não existem usuários pré-cadastrados!

1. **Criar sua primeira conta:**
   - Clique em "Criar Conta" na tela inicial
   - Escolha o tipo de conta (Leitor ou Publicador)
   - Preencha os dados solicitados
   - Leitores têm acesso imediato
   - Publicadores aguardam aprovação do admin

2. **Criar conta de Administrador:**
   - Crie uma conta normal primeiro
   - Acesse o banco de dados Supabase
   - Altere manualmente o campo `role` para `'admin'` na tabela `profiles`

### Segurança e Notificações
- Sistema de bloqueio após 5 tentativas de login sem sucesso
- Solicitações de desbloqueio via admin
- **Emails Automáticos:**
  - ✅ Aprovação de perfil de publicador
  - ✅ Rejeição de solicitação de publicador
  - ✅ Notificação de conta bloqueada
  - ✅ Notificação de conta desbloqueada
- ⚠️ **Atualmente em modo simulação** (emails aparecem no console)
- Para emails reais: Configure em `/services/email.ts` (veja [README_FORGOT_PASSWORD.md](./README_FORGOT_PASSWORD.md))
- Administrador pode desbloquear contas pelo painel
- Contato para suporte: suporte@pagefy.com

## 📱 Estrutura de Telas

```
/Login ou /Signup
  └─> /Main (Feed)
       ├─> /Home (Feed de atividades)
       ├─> /Search (Busca de livros e pessoas)
       ├─> /Shelf (Estante pessoal)
       ├─> /Profile (Perfil do usuário)
       ├─> /Menu (Estatísticas e configurações)
       ├─> /Admin (Painel administrativo) [Admin only]
       ├─> /Publisher (Painel de publicação) [Publisher/Admin only]
       └─> /BookDetail (Detalhes do livro)
```

## 🔔 Tipos de Notificações

1. **Like** (❤️) - Quando alguém curte sua publicação
2. **Comment** (💬) - Quando alguém comenta em sua resenha
3. **Follow** (👥) - Quando alguém começa a seguir você
4. **Review** (⭐) - Notificações do sistema e novas resenhas

## 📊 Estatísticas

### Perfil do Usuário
- Livros lidos
- Resenhas publicadas
- Seguidores
- Seguindo

### Painel do Publicador
- Total de livros
- Livros publicados
- Total de visualizações
- Total de resenhas
- Média de avaliação

### Painel do Administrador
- Total de usuários
- Usuários ativos
- Total de livros
- Total de resenhas
- Denúncias pendentes
- Novos usuários hoje

## 🎯 Próximas Funcionalidades Sugeridas

- [ ] Sistema de metas de leitura mensal/anual
- [ ] Recomendações baseadas no histórico
- [ ] Grupos de leitura e discussões
- [ ] Integração com backend Supabase
- [ ] Upload real de imagens
- [ ] Chat entre usuários
- [ ] Sistema de badges e conquistas
- [ ] Exportar estante para PDF

## 🛠️ Tecnologias

- React + TypeScript
- Tailwind CSS v4
- Shadcn/UI Components
- Recharts (gráficos)
- Lucide React (ícones)
- Sonner (toast notifications)

## 📝 Notas Importantes

- **Integração Supabase:** O aplicativo agora está totalmente integrado com Supabase
- **Autenticação Real:** Sistema completo de signup/login com validação
- **Banco de Dados PostgreSQL:** Todos os dados são persistidos
- **Edge Functions:** Operações do servidor executadas em edge functions
- **Segurança:** Sistema de bloqueio de conta e notificações por email
- Layout otimizado especificamente para mobile (max-width: 448px)
- Consulte `SUPABASE_SETUP.md` para mais detalhes técnicos
