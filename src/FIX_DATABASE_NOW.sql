-- ========================================
-- SCRIPT DE CORREÇÃO URGENTE - Pagefy
-- Execute este SQL AGORA no Supabase
-- ========================================

-- Passo 1: Verificar se as colunas existem
DO $$ 
DECLARE
    birth_date_exists BOOLEAN;
    cnpj_exists BOOLEAN;
BEGIN
    -- Check birth_date
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='birth_date'
    ) INTO birth_date_exists;
    
    -- Check cnpj
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='cnpj'
    ) INTO cnpj_exists;
    
    -- Report status
    IF birth_date_exists THEN
        RAISE NOTICE '✅ Coluna birth_date já existe';
    ELSE
        RAISE NOTICE '❌ Coluna birth_date NÃO existe - será criada';
    END IF;
    
    IF cnpj_exists THEN
        RAISE NOTICE '✅ Coluna cnpj já existe';
    ELSE
        RAISE NOTICE '❌ Coluna cnpj NÃO existe - será criada';
    END IF;
END $$;

-- Passo 2: Adicionar coluna birth_date se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='birth_date'
    ) THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
        RAISE NOTICE '✅ Coluna birth_date criada com sucesso!';
    END IF;
END $$;

-- Passo 3: Adicionar coluna cnpj se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='cnpj'
    ) THEN
        ALTER TABLE profiles ADD COLUMN cnpj VARCHAR(18);
        RAISE NOTICE '✅ Coluna cnpj criada com sucesso!';
    END IF;
END $$;

-- Passo 4: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_cnpj ON profiles(cnpj);
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);

-- Passo 5: Adicionar comentários
COMMENT ON COLUMN profiles.birth_date IS 'Data de nascimento do usuário (para recuperação de senha)';
COMMENT ON COLUMN profiles.cnpj IS 'CNPJ da empresa (para publicadores - recuperação de senha)';

-- Passo 6: Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Passo 7: Buscar usuários órfãos (no auth mas sem perfil)
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        ELSE '✅ OK'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- ========================================
-- IMPORTANTE: 
-- Se você vir usuários com "❌ SEM PERFIL",
-- você tem duas opções:
--
-- OPÇÃO 1: Deletar o usuário e criar conta novamente
-- DELETE FROM auth.users WHERE id = 'cole-o-id-aqui';
--
-- OPÇÃO 2: Criar o perfil manualmente (veja próximo script)
-- ========================================
