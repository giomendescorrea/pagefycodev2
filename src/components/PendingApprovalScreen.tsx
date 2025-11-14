import { BookOpen, Clock, Mail, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import logoHead from 'figma:asset/65228ae796c9e976e1c571fe7e272d268eef730f.png';

interface PendingApprovalScreenProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export function PendingApprovalScreen({ userName, userEmail, onLogout }: PendingApprovalScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#f2f2f2] to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src={logoHead} alt="Pagefy" className="h-32" />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-gray-900 mb-2">Conta Aguardando Aprovação</h2>
              <p className="text-gray-600">
                Olá, <span className="font-semibold">{userName}</span>
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="p-4 bg-[#e8f5f5] rounded-lg border border-[#348e91]/30">
              <p className="text-[#1c5052] mb-2">
                ✨ Sua solicitação de conta corporativa foi recebida!
              </p>
              <p className="text-[#213635] text-sm">
                Nosso administrador está analisando suas credenciais. Se a aprovação não for feita em até 48 horas, entre em contato em suporte@pagefy.com.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">Email cadastrado</p>
                  <p className="text-gray-600 text-sm">{userEmail}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-sm mb-2">
                  <strong>O que acontece agora?</strong>
                </p>
                <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                  <li>O administrador verificará suas credenciais</li>
                  <li>Você receberá uma notificação no app</li>
                  <li>Após aprovação, poderá acessar o sistema</li>
                  <li>Caso não seja aprovado em 48h, entre em contato no email de suporte</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-gray-600 text-sm text-center mb-4">
                Tempo médio de aprovação: 24-48 horas
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-sm mt-6">
          Dúvidas? Entre em contato:{' '}
          <a href="mailto:suporte@pagefy.com" className="text-[#348e91]">
            suporte@pagefy.com
          </a>
        </p>
      </div>
    </div>
  );
}