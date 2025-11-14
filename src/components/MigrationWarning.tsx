import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertTriangle, ExternalLink, FileCode } from 'lucide-react';

interface MigrationWarningProps {
  missingFeature: string;
  migrationFile: string;
  onDismiss?: () => void;
}

export function MigrationWarning({ missingFeature, migrationFile, onDismiss }: MigrationWarningProps) {
  const handleOpenDocs = () => {
    // In a real app, this would open documentation
    console.log(`📖 Abra o arquivo: ${migrationFile}`);
    console.log('📖 Leia: IMPORTANTE_EXECUTAR_MIGRATIONS.md');
  };

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900">Migration Pendente</AlertTitle>
      <AlertDescription className="text-orange-800">
        <p className="mb-3">
          A funcionalidade <strong>{missingFeature}</strong> não está disponível porque a tabela correspondente não foi criada no banco de dados.
        </p>
        <div className="space-y-2 mb-3">
          <p className="text-sm">Para ativar esta funcionalidade:</p>
          <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
            <li>Acesse o Supabase Dashboard</li>
            <li>Vá em SQL Editor</li>
            <li>Execute o arquivo: <code className="bg-orange-100 px-1 py-0.5 rounded text-xs">{migrationFile}</code></li>
            <li>Recarregue esta página</li>
          </ol>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={handleOpenDocs}
          >
            <FileCode className="h-3 w-3 mr-1" />
            Ver Instruções
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Abrir Supabase
          </Button>
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
            >
              Dispensar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
