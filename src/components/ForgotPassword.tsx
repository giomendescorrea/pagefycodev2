import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent } from './ui/card';
import { CardTitle, CardDescription } from './ui/card';
import { ArrowLeft, Mail, CheckCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { normalizeEmail, isValidEmail } from '../utils/emailUtils';
import { supabase } from '../utils/supabase/client';
import { resetPassword } from '../services/password-reset';

interface ForgotPasswordProps {
  email: string;
  onBack: () => void;
}

type Step = 'verification' | 'newPassword' | 'success';
type UserType = 'reader' | 'publisher' | null;

export function ForgotPassword({ email: initialEmail, onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('verification');
  const [email] = useState(initialEmail);
  const [userType, setUserType] = useState<UserType>(null);
  const [userId, setUserId] = useState<string>('');
  
  console.log('[ForgotPassword] Componente montado com email:', initialEmail);
  
  // Campos de verificação para leitor
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Campos de verificação para publicador
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  
  // Nova senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotFound, setEmailNotFound] = useState(false);

  // Ao montar o componente, verificar o tipo de usuário
  useEffect(() => {
    const checkUserType = async () => {
      if (!email) {
        console.error('[ForgotPassword] Email não fornecido');
        toast.error('Email não fornecido');
        onBack();
        return;
      }

      setIsLoading(true);
      try {
        const normalizedEmail = normalizeEmail(email);
        console.log('[ForgotPassword] Buscando usuário com email:', normalizedEmail);
        
        // Tentar buscar com email normalizado primeiro - sem birth_date e cnpj na query inicial
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('id, name, email, role')
          .eq('email', normalizedEmail)
          .maybeSingle();

        // Se não encontrar, tentar com email original (case-insensitive)
        if (!profile) {
          console.log('[ForgotPassword] Tentando busca case-insensitive...');
          const { data: allProfiles, error: searchError } = await supabase
            .from('profiles')
            .select('id, name, email, role');
          
          if (searchError) {
            console.error('[ForgotPassword] Erro na busca:', searchError);
          } else if (allProfiles) {
            // Procurar manualmente com case-insensitive
            profile = allProfiles.find(p => 
              p.email?.toLowerCase() === normalizedEmail.toLowerCase()
            ) || null;
            console.log('[ForgotPassword] Perfil encontrado na busca case-insensitive:', !!profile);
          }
        }

        console.log('[ForgotPassword] Resultado da busca:', { profile, error });

        if (!profile) {
          console.error('[ForgotPassword] Email não encontrado no banco');
          toast.error('Email não encontrado. Verifique se você digitou corretamente ou se está cadastrado no sistema.');
          // Não chamar onBack() automaticamente - deixar o usuário tentar novamente
          setIsLoading(false);
          setEmailNotFound(true);
          return;
        }

        // Determinar tipo de usuário
        const type = profile.role === 'publisher' || profile.role === 'admin' ? 'publisher' : 'reader';
        console.log('[ForgotPassword] Tipo de usuário:', type);
        setUserType(type);
        setUserId(profile.id);
      } catch (error: any) {
        console.error('[ForgotPassword] Error:', error);
        toast.error('Erro ao processar solicitação. Tente novamente.');
        // Não chamar onBack() automaticamente
      } finally {
        setIsLoading(false);
      }
    };

    checkUserType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
    }
    return cleaned;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCnpj(formatted);
  };

  const getMaxBirthDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 5);
    return today.toISOString().split('T')[0];
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);

      if (userType === 'reader') {
        // Validar leitor
        if (!fullName.trim() || !birthDate) {
          toast.error('Por favor, preencha todos os campos');
          setIsLoading(false);
          return;
        }

        // Verificar dados no banco - tentar buscar com todas as colunas
        const { data: profiles, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (selectError || !profiles) {
          console.error('[ForgotPassword] Erro ao verificar dados:', selectError);
          toast.error('Erro ao verificar dados. Tente novamente.');
          setIsLoading(false);
          return;
        }

        const profile = profiles as any;

        // Comparar nome (case insensitive e remover espaços extras)
        const profileName = profile.name.toLowerCase().trim().replace(/\s+/g, ' ');
        const inputName = fullName.toLowerCase().trim().replace(/\s+/g, ' ');

        if (profileName !== inputName) {
          toast.error('Nome completo não confere com o cadastrado');
          setIsLoading(false);
          return;
        }

        // Comparar data de nascimento - obrigatório para leitores
        if (!profile.birth_date) {
          toast.error('Perfil incompleto. Por favor, entre em contato com o suporte.');
          setIsLoading(false);
          return;
        }
        
        if (profile.birth_date !== birthDate) {
          toast.error('Data de nascimento não confere com a cadastrada');
          setIsLoading(false);
          return;
        }

      } else if (userType === 'publisher') {
        // Validar publicador
        if (!companyName.trim() || !cnpj) {
          toast.error('Por favor, preencha todos os campos');
          setIsLoading(false);
          return;
        }

        // Verificar dados no banco - usar select('*') para pegar todas as colunas
        const { data: profiles, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (selectError || !profiles) {
          console.error('[ForgotPassword] Erro ao verificar dados:', selectError);
          toast.error('Erro ao verificar dados. Tente novamente.');
          setIsLoading(false);
          return;
        }

        const profile = profiles as any;

        // Comparar nome da empresa (case insensitive e remover espaços extras)
        const profileCompany = profile.name.toLowerCase().trim().replace(/\s+/g, ' ');
        const inputCompany = companyName.toLowerCase().trim().replace(/\s+/g, ' ');

        if (profileCompany !== inputCompany) {
          toast.error('Nome da empresa não confere com o cadastrado');
          setIsLoading(false);
          return;
        }

        // Comparar CNPJ se existir no perfil
        if (profile.cnpj) {
          const cleanProfileCNPJ = profile.cnpj.replace(/\D/g, '');
          const cleanInputCNPJ = cnpj.replace(/\D/g, '');

          if (cleanProfileCNPJ !== cleanInputCNPJ) {
            toast.error('CNPJ não confere com o cadastrado');
            setIsLoading(false);
            return;
          }
        } else {
          // Se não há CNPJ no perfil, apenas validar o nome da empresa
          console.log('[ForgotPassword] Perfil não tem CNPJ, validando apenas nome da empresa');
        }
      }

      // Verificação bem-sucedida
      setStep('newPassword');
      toast.success('Identidade verificada! Agora defina sua nova senha.');
    } catch (error: any) {
      console.error('[ForgotPassword] Verification error:', error);
      toast.error('Erro ao verificar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);

      // Chamar serviço de reset de senha
      const result = await resetPassword({
        email: normalizedEmail,
        newPassword,
        verificationData: userType === 'reader' 
          ? { fullName, birthDate }
          : { companyName, cnpj },
        userType: userType!,
      });

      if (!result.success) {
        // Verificar se é erro de configuração
        if (result.error?.includes('SISTEMA NÃO CONFIGURADO') || result.error?.includes('Configure o sistema')) {
          toast.error('Sistema de recuperação não configurado', {
            description: 'Execute o SQL do arquivo URGENTE_EXECUTAR_SQL.md no Supabase. Leva 2 minutos!',
            duration: 8000,
          });
        } else {
          toast.error(result.error || 'Erro ao redefinir senha');
        }
        setIsLoading(false);
        return;
      }

      // Resetar tentativas de login falhas no banco
      await supabase
        .from('profiles')
        .update({
          failed_login_attempts: 0,
          is_locked: false,
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      setStep('success');
      toast.success('Senha redefinida com sucesso!');
    } catch (error: any) {
      console.error('[ForgotPassword] Password reset error:', error);
      toast.error(error.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#1e3a8a] to-[#1e40af]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <h1 className="text-[#1e40af] mb-2">Pagefy</h1>
          {step === 'verification' && (
            <>
              <CardTitle>Verificação de Identidade</CardTitle>
              <CardDescription>
                {userType === 'publisher'
                  ? 'Confirme os dados da sua empresa'
                  : 'Confirme seus dados pessoais'}
              </CardDescription>
            </>
          )}
          {step === 'newPassword' && (
            <>
              <CardTitle>Nova Senha</CardTitle>
              <CardDescription>
                Defina sua nova senha de acesso
              </CardDescription>
            </>
          )}
          {step === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle>Senha Redefinida!</CardTitle>
              <CardDescription>
                Sua senha foi alterada com sucesso
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {/* Exibir mensagem de erro se email não for encontrado */}
          {emailNotFound && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 mb-2">
                  Email não encontrado
                </p>
                <p className="text-red-700 text-sm">
                  O email <strong>{email}</strong> não está cadastrado no sistema. Verifique se digitou corretamente ou crie uma nova conta.
                </p>
              </div>

              <Button 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </Button>
            </div>
          )}

          {step === 'verification' && userType === 'reader' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="mb-2 p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={getMaxBirthDate()}
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 text-sm">
                  Os dados devem ser exatamente iguais aos cadastrados.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar Dados'}
              </Button>
            </form>
          )}

          {step === 'verification' && userType === 'publisher' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="mb-2 p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Digite o nome da empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCNPJChange}
                  required
                  maxLength={18}
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 text-sm">
                  Os dados devem ser exatamente iguais aos cadastrados.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar Dados'}
              </Button>
            </form>
          )}

          {step === 'newPassword' && (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <KeyRound className="h-4 w-4 inline mr-1" />
                  Sua nova senha deve ter no mínimo 6 caracteres.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
                disabled={isLoading}
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm mb-2">
                  Sua senha foi redefinida com sucesso!
                </p>
                <p className="text-green-700 text-sm">
                  Agora você já pode fazer login com sua nova senha.
                </p>
              </div>

              <Button 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
                onClick={onBack}
              >
                Voltar ao login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}