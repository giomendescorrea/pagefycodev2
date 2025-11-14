import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import logoHead from 'figma:asset/65228ae796c9e976e1c571fe7e272d268eef730f.png';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onVerify: (data: ReaderVerification | PublisherVerification, userType: 'reader' | 'publisher') => void;
}

export interface ReaderVerification {
  name: string;
  birth_date: string;
  email: string;
}

export interface PublisherVerification {
  company_name: string;
  cnpj: string;
  corporate_email: string;
}

export function ForgotPasswordScreen({ onBack, onVerify }: ForgotPasswordScreenProps) {
  const [userType, setUserType] = useState<'reader' | 'publisher'>('reader');
  
  // Reader fields
  const [readerName, setReaderName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [readerEmail, setReaderEmail] = useState('');
  
  // Publisher fields
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userType === 'reader') {
      onVerify(
        {
          name: readerName,
          birth_date: birthDate,
          email: readerEmail
        },
        'reader'
      );
    } else {
      onVerify(
        {
          company_name: companyName,
          cnpj,
          corporate_email: corporateEmail
        },
        'publisher'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#348e91] to-[#2a7173] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img src={logoHead} alt="Pagefy" className="h-32" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Key className="h-6 w-6 text-[#348e91]" />
            <h2 className="text-gray-900">Recuperar Senha</h2>
          </div>
          <p className="text-gray-600">
            Confirme seus dados para redefinir sua senha
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'reader' | 'publisher')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="reader">Leitor</TabsTrigger>
              <TabsTrigger value="publisher">Publicador</TabsTrigger>
            </TabsList>

            <TabsContent value="reader">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reader-name">Nome Completo</Label>
                  <Input
                    id="reader-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={readerName}
                    onChange={(e) => setReaderName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth-date">Data de Nascimento</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reader-email">E-mail</Label>
                  <Input
                    id="reader-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={readerEmail}
                    onChange={(e) => setReaderEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Verificar Dados
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="publisher">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="Nome da sua empresa"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={cnpj}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCnpj(value);
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corporate-email">E-mail Corporativo</Label>
                  <Input
                    id="corporate-email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Verificar Dados
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}