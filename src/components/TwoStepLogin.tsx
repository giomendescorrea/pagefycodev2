import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent } from './ui/card';
import { CardTitle, CardDescription } from './ui/card';
import { ArrowLeft } from 'lucide-react';
import { normalizeEmail, isValidEmail } from '../utils/emailUtils';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface TwoStepLoginProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignup: () => void;
  onForgotPassword?: (email: string) => void;
}

export function TwoStepLogin({ onLogin, onSwitchToSignup, onForgotPassword }: TwoStepLoginProps) {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const SUPPORT_EMAIL = 'suporte.pagefy@gmail.com';

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-5ed9d16e/check-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: normalizeEmail(email) }),
        }
      );

      if (!response.ok) {
        console.error('[CheckEmail] Server error:', response.status);
        return false;
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('[CheckEmail] Error checking email:', error);
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !isValidEmail(email)) {
      toast.error('Por favor, digite um email válido');
      return;
    }

    setIsLoading(true);
    try {
      const exists = await checkEmailExists(email);
      
      if (!exists) {
        toast.error(
          <div className="space-y-2">
            <p className="font-semibold">Email não encontrado</p>
            <p className="text-sm">
              Este email não está cadastrado no sistema.
            </p>
            <p className="text-sm">
              <strong>Primeira vez aqui?</strong> Clique em "Criar conta" para se cadastrar.
            </p>
          </div>,
          { duration: 5000 }
        );
        setIsLoading(false);
        return;
      }

      // Move to password step
      setStep('password');
      setRemainingAttempts(null); // Reset attempts when moving to password step
    } catch (error) {
      console.error('[TwoStepLogin] Error:', error);
      toast.error('Erro ao verificar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      const normalizedEmail = normalizeEmail(email);
      
      try {
        // Call onLogin which will use the auth service with attempt tracking
        await onLogin(normalizedEmail, password);
      } catch (error: any) {
        // Handle error silently (expected behavior for wrong password, locked accounts, etc.)
        
        // Handle specific error types
        if (error.message === 'ACCOUNT_LOCKED' || error.message === 'ACCOUNT_LOCKED_NOW') {
          const isNewLock = error.message === 'ACCOUNT_LOCKED_NOW';
          
          toast.error(
            <div className="space-y-2">
              <p className="font-semibold">Conta bloqueada</p>
              <p className="text-sm">
                Sua conta foi bloqueada devido a múltiplas tentativas de login incorretas.
              </p>
              {isNewLock && (
                <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                  ✅ Uma solicitação de desbloqueio foi enviada automaticamente ao administrador.
                </p>
              )}
              <p className="text-sm">
                Para desbloquear mais rapidamente, entre em contato:
              </p>
              <a 
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-sm text-blue-600 hover:underline block"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>,
            { duration: 12000 }
          );
          setRemainingAttempts(0);
        } else if (error.message === 'WRONG_PASSWORD') {
          const remaining = error.remainingAttempts !== undefined ? error.remainingAttempts : 0;
          setRemainingAttempts(remaining);
          
          if (remaining > 0) {
            toast.error(
              <div className="space-y-2">
                <p className="font-semibold">Senha incorreta</p>
                <p className="text-sm">
                  Você tem mais <strong>{remaining}</strong> tentativa{remaining !== 1 ? 's' : ''} antes da conta ser bloqueada.
                </p>
              </div>,
              { duration: 5000 }
            );
          } else {
            toast.error('Senha incorreta');
          }
        } else if (error.message === 'EMAIL_NOT_FOUND') {
          toast.error('Email não encontrado');
        } else if (error.message === 'EMAIL_NOT_CONFIRMED') {
          toast.error(
            <div className="space-y-2">
              <p className="font-semibold">📧 Email não confirmado</p>
              <p className="text-sm">
                Para fazer login, você precisa confirmar seu email primeiro.
              </p>
              <ol className="text-sm list-decimal list-inside space-y-1 mt-2">
                <li>Verifique sua caixa de entrada</li>
                <li>Procure o email do Supabase</li>
                <li>Clique no link "Confirm your email"</li>
                <li>Volte e faça login novamente</li>
              </ol>
              <p className="text-xs mt-2 text-gray-600">
                💡 Não recebeu o email? Verifique a pasta de spam ou entre em contato com o suporte.
              </p>
            </div>,
            { duration: 15000 }
          );
        } else {
          toast.error(error.message || 'Erro ao fazer login');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#1e3a8a] to-[#1e40af]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <h1 className="text-[#1e40af] mb-2">Pagefy</h1>
          <CardTitle>{step === 'email' ? 'Entrar' : 'Digite sua senha'}</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Digite seu email para continuar' 
              : `Entrando como ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
              >
                Entrar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSwitchToSignup}
              >
                Criar conta
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="mb-2 p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a]"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
              {onForgotPassword && (
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => {
                    console.log('[TwoStepLogin] Esqueci senha clicado, email:', email);
                    onForgotPassword(email);
                  }}
                >
                  Esqueci minha senha
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}