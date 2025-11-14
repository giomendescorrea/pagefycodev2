# 🧪 TESTE AGORA - Data de Nascimento

## ⚡ Teste Rápido (2 minutos)

### 1. Abrir Console
```
Pressionar F12 no navegador
Ir para aba "Console"
```

### 2. Fazer Cadastro
```
1. Clicar em "Criar Conta"
2. Escolher "Leitor"
3. Preencher:
   ✏️ Nome: João Teste
   📅 Data de Nascimento: 2000-01-15
   📧 Email: joao.teste@email.com
   🔒 Senha: 123456
   🔒 Confirmar: 123456
4. Clicar em "Criar Conta"
```

### 3. Olhar Console
Deve aparecer:
```javascript
[App] handleSignup called with: {
  name: "João Teste",
  email: "joao.teste@email.com", 
  accountType: "reader",
  cnpj: undefined,
  birthDate: "2000-01-15"  // ✅ DEVE TER AQUI
}

[Auth] Using direct Supabase signup...
[Auth] Adding birth_date to profile: 2000-01-15  // ✅ CONFIRMA
[Auth] Profile created successfully: {...}  // ✅ SALVO
```

### 4. Verificar no Supabase
```sql
SELECT name, email, birth_date 
FROM profiles 
WHERE email = 'joao.teste@email.com';
```

**Deve retornar:**
```
name: João Teste
email: joao.teste@email.com
birth_date: 2000-01-15  ✅ NÃO PODE SER NULL
```

---

## 🔧 Teste de Recuperação de Senha

### 1. Fazer Logout
```
Menu → Sair
```

### 2. Esqueci a Senha
```
Login → "Esqueci minha senha"
```

### 3. Preencher (EXATAMENTE como cadastrou)
```
📧 Email: joao.teste@email.com
✏️ Nome Completo: João Teste
📅 Data de Nascimento: 2000-01-15
🔒 Nova Senha: nova123
🔒 Confirmar: nova123
```

### 4. Resultado
```
✅ "Senha redefinida com sucesso!"
```

**Se der erro:**
```
❌ "Perfil incompleto" → birth_date está NULL no banco
❌ "Data de nascimento não confere" → digitou diferente
❌ "Nome completo não confere" → digitou diferente
```

---

## ❌ Se Não Funcionar

### Opção 1: Verificar Logs
Copie TODOS os logs do console que começam com `[App]` ou `[Auth]` e compartilhe.

### Opção 2: Verificar Banco
```sql
-- Ver último perfil criado
SELECT id, name, email, birth_date, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 1;
```

Se `birth_date` for NULL → problema no salvamento

### Opção 3: Atualizar Manualmente
```sql
UPDATE profiles
SET birth_date = '2000-01-15'
WHERE email = 'joao.teste@email.com';
```

Depois testar recuperação de senha novamente.

---

## ✅ Checklist Rápido

- [ ] F12 aberto
- [ ] Console visível
- [ ] Cadastro feito
- [ ] Logs vistos
- [ ] `birthDate` aparece nos logs
- [ ] Verificado no Supabase
- [ ] `birth_date` não é NULL
- [ ] Teste de senha funcionou

---

## 📸 O Que Você Deve Ver

### Console do Navegador:
```
✅ [App] handleSignup called with: { birthDate: "2000-01-15" }
✅ [Auth] Adding birth_date to profile: 2000-01-15
✅ [Auth] Profile created successfully: {...}
```

### Supabase (Table Editor → profiles):
```
| name       | email                   | birth_date  |
|------------|-------------------------|-------------|
| João Teste | joao.teste@email.com    | 2000-01-15  | ✅
```

### Recuperação de Senha:
```
✅ Senha redefinida com sucesso!
```

---

**Se tudo funcionar:** 🎉 Sistema 100% OK!  
**Se não funcionar:** Compartilhe os logs do console para análise

---

**Tempo estimado:** 2 minutos  
**Dificuldade:** Fácil  
**Resultado:** Validação completa do sistema
