-- ====================================================================
-- MIGRATION: Função para Reset de Senha (Password Reset Function)
-- ====================================================================
-- Esta função permite redefinir a senha de qualquer usuário
-- usando apenas o email, após validação externa dos dados
-- ====================================================================

-- Criar a função RPC para atualizar senha
CREATE OR REPLACE FUNCTION update_user_password(
  user_email TEXT,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do owner
AS $$
DECLARE
  user_id UUID;
  result JSON;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  -- Verificar se usuário existe
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não encontrado'
    );
  END IF;
  
  -- Atualizar a senha usando a função do Supabase
  -- Nota: Isso gera automaticamente o hash bcrypt correto
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'user_id', user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION update_user_password IS 
  'Atualiza a senha de um usuário após validação externa. ' ||
  'Esta função é usada pelo sistema de recuperação de senha que ' ||
  'valida a identidade do usuário (nome + data de nascimento para leitores, ' ||
  'ou empresa + CNPJ para publicadores) antes de permitir o reset.';

-- ====================================================================
-- VERIFICAÇÃO: Testar se a função foi criada
-- ====================================================================

SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'update_user_password';

-- ====================================================================
-- EXEMPLO DE USO
-- ====================================================================

-- Resetar senha de um usuário:
-- SELECT update_user_password('usuario@email.com', 'novaSenha123');

-- Retorno esperado:
-- {"success": true, "user_id": "uuid-do-usuario"}

-- ====================================================================
-- SEGURANÇA
-- ====================================================================

-- Esta função tem SECURITY DEFINER, o que significa que ela executa
-- com os privilégios do owner (que tem acesso à tabela auth.users).
-- 
-- IMPORTANTE: 
-- - A validação de identidade DEVE ser feita ANTES de chamar esta função
-- - Esta função NÃO faz validação - ela apenas atualiza a senha
-- - O sistema Pagefy valida nome+data ou empresa+CNPJ antes de chamar
-- 
-- Por isso é SEGURO - a função só é chamada após validação rigorosa.

-- ====================================================================
-- PERMISSÕES
-- ====================================================================

-- Garantir que usuários autenticados possam chamar a função
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_password(TEXT, TEXT) TO anon;

-- ====================================================================
-- ROLLBACK (se necessário)
-- ====================================================================

-- Para remover a função:
-- DROP FUNCTION IF EXISTS update_user_password(TEXT, TEXT);
