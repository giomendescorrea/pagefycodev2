import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, ExternalLink, FileCode, X } from 'lucide-react';

export function GlobalMigrationBanner() {
  const [dismissed, setDismissed] = useState(() => {
    // Check if user has already dismissed this warning
    return localStorage.getItem('migration-warning-dismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('migration-warning-dismissed', 'true');
  };

  const handleOpenDocs = () => {
    console.clear();
    console.info('\n📚 GUIA RÁPIDO: Ativar Funcionalidades Extras');
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.info('');
    console.info('✅ SEU APP ESTÁ FUNCIONANDO PERFEITAMENTE!');
    console.info('');
    console.info('🎯 Funcionalidades extras disponíveis:');
    console.info('   • Sistema de bloqueio automático após 5 tentativas de login');
    console.info('   • Painel para usuários solicitarem desbloqueio');
    console.info('   • Gerenciamento admin de solicitações');
    console.info('');
    console.info('📖 Para ativar (leva 2 minutos):');
    console.info('   1. Leia: README_MIGRATIONS.md');
    console.info('   2. Ou se preferir: FAQ_MIGRATIONS.md');
    console.info('');
    console.info('🚀 Resumo super rápido:');
    console.info('   1. Acesse: https://supabase.com/dashboard');
    console.info('   2. Vá em: SQL Editor');
    console.info('   3. Execute: MIGRATION_ACCOUNT_LOCKING.sql');
    console.info('   4. Execute: MIGRATION_UNLOCK_REQUESTS.sql');
    console.info('   5. Recarregue a página');
    console.info('');
    console.info('💡 Não quer ativar agora? Clique no X para dispensar');
    console.info('');
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  };

  if (dismissed) {
    return null;
  }

  return (
    <div className="relative">
      <Alert className="border-blue-200 bg-blue-50 rounded-none border-x-0">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 pr-8">Funcionalidades Extras Disponíveis</AlertTitle>
        <AlertDescription className="text-blue-800">
          <p className="mb-2 text-sm">
            <strong className="text-blue-900">Tudo funcionando!</strong> Você pode ativar recursos extras (sistema de bloqueio e desbloqueio de contas) executando migrations no Supabase.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="bg-white h-7 text-xs border-blue-300 hover:bg-blue-50"
              onClick={handleOpenDocs}
            >
              <FileCode className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white h-7 text-xs border-blue-300 hover:bg-blue-50"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Supabase
            </Button>
          </div>
        </AlertDescription>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-blue-100"
          onClick={handleDismiss}
          title="Não mostrar novamente"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}
