-- =====================================================
-- MIGRATION: LIMPEZA DE LIVROS MOCKADOS
-- =====================================================
-- Este script remove livros que foram criados antes da
-- implementação do sistema de publicadores
-- 
-- Execute este script no Supabase SQL Editor apenas se
-- você tiver livros mockados que precisa remover.
-- 
-- IMPORTANTE: Este script NÃO remove livros adicionados
-- por publicadores ou administradores (publisher_id não nulo)
-- =====================================================

-- Identificar livros sem publisher_id (possivelmente mockados)
SELECT 
  id, 
  title, 
  author, 
  created_at,
  publisher_id
FROM books
WHERE publisher_id IS NULL
ORDER BY created_at ASC;

-- =====================================================
-- CUIDADO: O comando abaixo irá DELETAR os livros!
-- =====================================================
-- Descomente as linhas abaixo somente se você tiver
-- certeza que quer remover os livros sem publisher_id
-- =====================================================

-- DELETE FROM books
-- WHERE publisher_id IS NULL;

-- =====================================================
-- VERIFICAÇÃO PÓS-LIMPEZA
-- =====================================================
-- Execute este comando para verificar os livros restantes

-- SELECT 
--   id, 
--   title, 
--   author, 
--   publisher_id,
--   created_at
-- FROM books
-- ORDER BY created_at DESC;

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Todos os livros futuros devem ser criados por:
-- 1. Publicadores autenticados (com publisher_id)
-- 2. Administradores (que também podem ter publisher_id)
-- 
-- O sistema não permite mais a criação de livros sem
-- um publisher_id associado através do seedData.ts
-- =====================================================
