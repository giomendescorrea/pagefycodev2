-- ========================================
-- CRIAR PERFIS FALTANTES PARA USUÁRIOS ÓRFÃOS
-- Execute DEPOIS de FIX_DATABASE_NOW.sql
-- ========================================

-- Este script cria perfis para usuários que existem no auth.users
-- mas não têm perfil correspondente na tabela profiles

-- Passo 1: Verificar quantos usuários órfãos existem
SELECT COUNT(*) as usuarios_sem_perfil
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Passo 2: Ver detalhes dos usuários órfãos
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'name' as name,
    au.raw_user_meta_data->>'account_type' as account_type,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- Passo 3: CRIAR PERFIS AUTOMATICAMENTE para todos os usuários órfãos
-- ⚠️ ATENÇÃO: Isto criará perfis para TODOS os usuários sem perfil
-- Descomente as linhas abaixo para executar:

/*
INSERT INTO profiles (id, name, email, role, is_private, is_locked, failed_login_attempts, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    au.email,
    'user' as role,
    false as is_private,
    false as is_locked,
    0 as failed_login_attempts,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
*/

-- Passo 4: Verificar se os perfis foram criados
SELECT 
    au.id,
    au.email,
    p.name,
    p.role,
    CASE 
        WHEN p.id IS NULL THEN '❌ SEM PERFIL'
        ELSE '✅ PERFIL OK'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- ========================================
-- CRIAR PERFIL MANUALMENTE PARA UM USUÁRIO ESPECÍFICO
-- ========================================

-- Se você preferir criar o perfil manualmente para um usuário específico:
-- 1. Copie o ID e email do usuário da query acima
-- 2. Descomente e ajuste a query abaixo:

/*
INSERT INTO profiles (
    id, 
    name, 
    email, 
    role, 
    is_private, 
    is_locked, 
    failed_login_attempts,
    created_at,
    updated_at
)
VALUES (
    'dbb78fec-aa42-42da-97a5-28edf4ac5a15',  -- ← Cole o ID do usuário aqui
    'Nome do Usuário',                        -- ← Ajuste o nome
    'email@exemplo.com',                      -- ← Cole o email aqui
    'user',                                   -- role: 'user', 'publisher' ou 'admin'
    false,                                    -- is_private
    false,                                    -- is_locked
    0,                                        -- failed_login_attempts
    NOW(),                                    -- created_at
    NOW()                                     -- updated_at
);
*/

-- ========================================
-- OPÇÃO ALTERNATIVA: DELETAR USUÁRIO E RECRIAR
-- ========================================

-- Se preferir deletar o usuário órfão e criar a conta novamente:
-- Descomente a linha abaixo e substitua o ID:

/*
DELETE FROM auth.users 
WHERE id = 'dbb78fec-aa42-42da-97a5-28edf4ac5a15';  -- ← Cole o ID aqui
*/

-- Depois de deletar, você pode criar a conta novamente pela interface do app

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Execute esta query para garantir que está tudo OK:
SELECT 
    'Usuários no auth' as tipo,
    COUNT(*) as quantidade
FROM auth.users
UNION ALL
SELECT 
    'Perfis na tabela profiles' as tipo,
    COUNT(*) as quantidade
FROM profiles
UNION ALL
SELECT 
    'Usuários SEM perfil (órfãos)' as tipo,
    COUNT(*) as quantidade
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
