-- Migration: Adicionar coluna birth_date à tabela profiles
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna birth_date se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date DATE;
    RAISE NOTICE 'Coluna birth_date adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna birth_date já existe';
  END IF;
END $$;

-- Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'birth_date';
