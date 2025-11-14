-- ========================================
-- 🚨 COPIE E COLE ESTE SQL INTEIRO NO SUPABASE
-- Tempo: 30 segundos
-- ========================================

-- 1️⃣ Adicionar colunas faltantes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);

-- 2️⃣ Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_cnpj ON profiles(cnpj);
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);

-- 3️⃣ Deletar usuário órfão específico (ajuste o ID se necessário)
DELETE FROM auth.users 
WHERE id = 'dbb78fec-aa42-42da-97a5-28edf4ac5a15';

-- 4️⃣ OU deletar TODOS os usuários órfãos (cuidado!)
-- DELETE FROM auth.users WHERE id NOT IN (SELECT id FROM profiles);

-- 5️⃣ Verificar se está OK
SELECT 
    'Total de usuários' as info,
    COUNT(*) as quantidade
FROM auth.users
UNION ALL
SELECT 
    'Total de perfis' as info,
    COUNT(*) as quantidade
FROM profiles
UNION ALL
SELECT 
    'Usuários SEM perfil' as info,
    COUNT(*) as quantidade
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ========================================
-- ✅ RESULTADO ESPERADO:
-- Total de usuários: X
-- Total de perfis: X  (deve ser igual)
-- Usuários SEM perfil: 0  (deve ser zero!)
-- ========================================
