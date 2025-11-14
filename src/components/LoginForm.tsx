import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { CardTitle, CardDescription } from './ui/card';
import { normalizeEmail } from '../utils/emailUtils';
import logoHead from 'figma:asset/65228ae796c9e976e1c571fe7e272d268eef730f.png';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSwitchToSignup: () => void;
}

export function LoginForm({ onLogin, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      const normalizedEmail = normalizeEmail(email);
      console.log('[LoginForm] Submitting login for:', normalizedEmail);
      try {
        await onLogin(normalizedEmail, password);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#f2f2f2] to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img src={logoHead} alt="Pagefy" className="h-32" />
          </div>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-[#1e3a8a] hover:underline"
              >
                Criar Conta
              </button>
            </p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>⚠️ Primeira vez aqui?</strong>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Você precisa criar uma conta antes de fazer login! Clique em "Criar Conta" acima para começar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}