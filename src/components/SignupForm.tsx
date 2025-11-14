import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { normalizeEmail } from '../utils/emailUtils';

interface SignupFormProps {
  onSignup: (name: string, email: string, password: string, accountType: 'reader' | 'publisher', cnpj?: string, birthDate?: string) => void;
  onSwitchToLogin: () => void;
}

export function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [accountType, setAccountType] = useState<'reader' | 'publisher'>('reader');

  const validateCNPJ = (cnpj: string): boolean => {
    // Remove formatação
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) {
      return false;
    }
    
    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      return false;
    }
    
    // Validação dos dígitos verificadores
    let size = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, size);
    const digits = cleanCNPJ.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    // Calcula o primeiro dígito verificador
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) {
      return false;
    }
    
    // Calcula o segundo dígito verificador
    size = size + 1;
    numbers = cleanCNPJ.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) {
      return false;
    }
    
    return true;
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accountType === 'publisher') {
      // Validação para publicador
      if (!name || !cnpj || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      // Valida CNPJ
      if (!validateCNPJ(cnpj)) {
        alert('CNPJ inválido. Por favor, insira um CNPJ válido com dígitos verificadores corretos.');
        return;
      }
      
      if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
      }
      // Normaliza email antes de enviar
      const normalizedEmail = normalizeEmail(email);
      console.log('[SignupForm] Creating publisher account with email:', normalizedEmail);
      onSignup(name, normalizedEmail, password, accountType, cnpj, undefined);
    } else {
      // Validação para leitor
      if (!name || !birthDate || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      
      // Valida idade mínima de 5 anos
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      if (age < 5) {
        alert('Você deve ter pelo menos 5 anos de idade para criar uma conta.');
        return;
      }
      
      if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      
      if (password !== confirmPassword) {
        alert('As senhas não coincidem.');
        return;
      }
      // Normaliza email antes de enviar
      const normalizedEmail = normalizeEmail(email);
      console.log('[SignupForm] Creating reader account with email:', normalizedEmail);
      onSignup(name, normalizedEmail, password, accountType, undefined, birthDate);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#f2f2f2] to-white pb-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="h-16 w-16 bg-[#1e3a8a] rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-[#1e3a8a] mb-1">Pagefy</h1>
          <p className="text-gray-600">Crie sua conta</p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-900">
                ✨ Crie sua conta gratuitamente e comece a compartilhar suas resenhas de livros!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3 mb-4">
                <Label>Tipo de Conta</Label>
                <RadioGroup value={accountType} onValueChange={(value) => {
                  setAccountType(value as 'reader' | 'publisher');
                  // Reset fields when switching
                  setName('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setCnpj('');
                }}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="reader" id="reader" />
                    <Label htmlFor="reader" className="flex-1 cursor-pointer">
                      <div>
                        <p className="text-gray-900">Leitor</p>
                        <p className="text-xs text-gray-500">Acesso imediato para ler e compartilhar resenhas</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="publisher" id="publisher" />
                    <Label htmlFor="publisher" className="flex-1 cursor-pointer">
                      <div>
                        <p className="text-gray-900">Publicador</p>
                        <p className="text-xs text-gray-500">Requer aprovação do administrador</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {accountType === 'reader' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
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
                      minLength={6}
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Nome da empresa ou editora"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-12"
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
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="corporateEmail">Email Corporativo</Label>
                    <Input
                      id="corporateEmail"
                      type="email"
                      placeholder="contato@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
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
                      minLength={6}
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12"
                    />
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-900 text-sm">
                      ⚠️ Sua conta será criada, mas você só poderá acessar após a aprovação do administrador.
                    </p>
                  </div>
                </>
              )}
              
              <Button type="submit" className="w-full h-12">
                {accountType === 'publisher' ? 'Solicitar Conta Corporativa' : 'Criar Conta'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2 pb-6">
            <p className="text-gray-600 text-center">
              Já tem uma conta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#1e3a8a]"
              >
                Fazer Login
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}