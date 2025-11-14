import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface ReaderVerificationData {
  fullName: string;
  birthDate: string;
}

export interface PublisherVerificationData {
  companyName: string;
  cnpj: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  verificationData: ReaderVerificationData | PublisherVerificationData;
  userType: 'reader' | 'publisher';
}

export interface ResetPasswordResponse {
  success: boolean;
  error?: string;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server`;

/**
 * Reset password for a user after verification
 */
export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  try {
    console.log('[resetPassword] Iniciando reset de senha para:', request.email);
    
    // Buscar o perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', request.email)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[resetPassword] Erro ao buscar perfil:', profileError);
      return {
        success: false,
        error: 'Usuário não encontrado'
      };
    }

    console.log('[resetPassword] Perfil encontrado:', profile.id);

    // Verificar dados de acordo com o tipo de usuário
    if (request.userType === 'reader') {
      const data = request.verificationData as ReaderVerificationData;
      
      // Comparar nome
      const profileName = profile.name.toLowerCase().trim().replace(/\s+/g, ' ');
      const inputName = data.fullName.toLowerCase().trim().replace(/\s+/g, ' ');
      
      if (profileName !== inputName) {
        console.error('[resetPassword] Nome não confere');
        return {
          success: false,
          error: 'Dados de verificação inválidos'
        };
      }
      
      // Comparar data de nascimento - obrigatório para leitores
      if (!profile.birth_date) {
        console.error('[resetPassword] Data de nascimento não cadastrada no perfil');
        return {
          success: false,
          error: 'Perfil incompleto. Cadastre-se novamente ou entre em contato com o suporte.'
        };
      }
      
      if (profile.birth_date !== data.birthDate) {
        console.error('[resetPassword] Data de nascimento não confere');
        return {
          success: false,
          error: 'Dados de verificação inválidos'
        };
      }
    } else {
      const data = request.verificationData as PublisherVerificationData;
      
      // Comparar nome da empresa
      const profileCompany = profile.name.toLowerCase().trim().replace(/\s+/g, ' ');
      const inputCompany = data.companyName.toLowerCase().trim().replace(/\s+/g, ' ');
      
      if (profileCompany !== inputCompany) {
        console.error('[resetPassword] Nome da empresa não confere');
        return {
          success: false,
          error: 'Dados de verificação inválidos'
        };
      }
      
      // Comparar CNPJ se existir
      if (profile.cnpj) {
        const cleanProfileCNPJ = profile.cnpj.replace(/\D/g, '');
        const cleanInputCNPJ = data.cnpj.replace(/\D/g, '');
        
        if (cleanProfileCNPJ !== cleanInputCNPJ) {
          console.error('[resetPassword] CNPJ não confere');
          return {
            success: false,
            error: 'Dados de verificação inválidos'
          };
        }
      }
    }

    console.log('[resetPassword] Validação de identidade passou ✅');

    // MÉTODO 1: Tentar função RPC (mais rápido que o servidor)
    console.log('[resetPassword] Tentando função RPC...');
    
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('update_user_password', {
        user_email: request.email,
        new_password: request.newPassword
      });
      
      if (rpcError) {
        // Se o erro for "function not found", pular silenciosamente
        if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
          console.warn('[resetPassword] ⚠️ Função RPC não existe ainda (precisa executar migration)');
          throw rpcError;
        }
        console.warn('[resetPassword] ❌ RPC erro:', rpcError.code);
        throw rpcError;
      }
      
      const result = rpcResult as { success: boolean; error?: string };
      
      if (result && result.success) {
        console.log('[resetPassword] ✅ Senha redefinida via RPC');
        return { success: true };
      }
      
      throw new Error(result?.error || 'RPC falhou');
    } catch (rpcError: any) {
      console.warn('[resetPassword] ❌ RPC falhou:', rpcError.message);
    }

    // MÉTODO 2: Tentar servidor (Edge Function) com timeout
    console.log('[resetPassword] Tentando servidor...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
      
      const response = await fetch(`${SERVER_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: request.email,
          newPassword: request.newPassword,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log('[resetPassword] ✅ Senha redefinida via servidor');
        return { success: true };
      }
      
      throw new Error(`Server error: ${response.status}`);
    } catch (serverError: any) {
      if (serverError.name === 'AbortError') {
        console.warn('[resetPassword] ❌ Servidor timeout (5s)');
      } else {
        console.warn('[resetPassword] ❌ Servidor falhou:', serverError.message);
      }
    }

    // MÉTODO 3: Email de recuperação nativo do Supabase (mais confiável)
    console.log('[resetPassword] Usando email de recuperação (método mais confiável)...');
    
    try {
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: `${window.location.origin}/`
        }
      );
      
      if (emailError) {
        throw emailError;
      }
      
      console.log('[resetPassword] ⚠️ Email de recuperação enviado');
      return {
        success: false,
        error: '⚠️ IMPORTANTE: Configure o sistema primeiro!\n\n' +
               '1. Abra o Supabase Dashboard\n' +
               '2. Vá em SQL Editor\n' +
               '3. Execute o arquivo: EXECUTAR_MIGRATIONS_COMPLETO.md\n\n' +
               'Enquanto isso, enviamos um email de recuperação para ' + request.email + '. ' +
               'Verifique sua caixa de entrada.'
      };
    } catch (emailError: any) {
      console.error('[resetPassword] ❌ Email de recuperação falhou:', emailError);
    }

    // Nenhum método funcionou
    console.error('[resetPassword] ❌ Todos os métodos falharam');
    return {
      success: false,
      error: '⚠️ SISTEMA NÃO CONFIGURADO\n\n' +
             'Para usar a recuperação de senha, você precisa:\n\n' +
             '1. Abrir Supabase Dashboard → SQL Editor\n' +
             '2. Executar o SQL do arquivo: /EXECUTAR_MIGRATIONS_COMPLETO.md\n' +
             '3. Leva apenas 2 minutos!\n\n' +
             'Após configurar, a recuperação de senha funcionará perfeitamente.'
    };
  } catch (error: any) {
    console.error('[resetPassword] Erro geral:', error);
    return {
      success: false,
      error: error.message || 'Erro ao redefinir senha'
    };
  }
}