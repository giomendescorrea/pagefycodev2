-- Migration: Add CNPJ and Birth Date columns to profiles table
-- Data: 2024
-- Descrição: Adiciona campos cnpj e birth_date para recuperação de senha

-- Adiciona coluna birth_date se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='birth_date') THEN
        ALTER TABLE profiles ADD COLUMN birth_date DATE;
        RAISE NOTICE 'Coluna birth_date adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna birth_date já existe';
    END IF;
END $$;

-- Adiciona coluna cnpj se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='cnpj') THEN
        ALTER TABLE profiles ADD COLUMN cnpj VARCHAR(18);
        RAISE NOTICE 'Coluna cnpj adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna cnpj já existe';
    END IF;
END $$;

-- Adiciona índice para busca rápida por CNPJ
CREATE INDEX IF NOT EXISTS idx_profiles_cnpj ON profiles(cnpj);

-- Adiciona comentários nas colunas
COMMENT ON COLUMN profiles.birth_date IS 'Data de nascimento do usuário (usado para recuperação de senha de leitores)';
COMMENT ON COLUMN profiles.cnpj IS 'CNPJ da empresa (usado para recuperação de senha de publicadores)';

-- Exibe informações sobre as colunas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('birth_date', 'cnpj')
ORDER BY column_name;
