-- Script para limpar usuários criados com erro
-- Use este script APENAS se você tiver usuários no auth.users mas não em profiles

-- ⚠️ ATENÇÃO: Este script deleta dados! Use com cuidado!

-- Passo 1: Verificar usuários órfãos (no auth mas não no profiles)
-- Execute esta query primeiro para ver quais usuários têm problema:

SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ Sem perfil (ERRO)'
        ELSE '✅ Com perfil (OK)'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Passo 2: Se você identificou usuários com erro, pode deletá-los assim:
-- DESCOMENTE as linhas abaixo e substitua 'SEU_EMAIL@AQUI.COM' pelo email do usuário com erro

/*
-- Delete usuário específico por email
DELETE FROM auth.users 
WHERE email = 'SEU_EMAIL@AQUI.COM';

-- OU delete todos os usuários órfãos (cuidado!)
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);
*/

-- Passo 3: Verificar se a limpeza funcionou
SELECT 
    au.id,
    au.email,
    au.created_at,
    p.name,
    p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Notas:
-- 1. Só delete usuários que você criou para teste
-- 2. Após deletar, você pode criar a conta novamente com o mesmo email
-- 3. Se você tiver dúvidas, não delete nada e peça ajuda
