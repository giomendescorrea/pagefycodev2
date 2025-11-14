import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { normalizeEmail } from '../utils/emailUtils';

interface DiagnosticResult {
  totalProfiles: number;
  normalizedCount: number;
  unnormalizedCount: number;
  unnormalizedEmails: { id: string; email: string; normalizedEmail: string }[];
}

export function EmailDiagnostics() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  const checkEmails = async () => {
    setIsChecking(true);
    setResult(null);
    setMigrationResult(null);

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email');

      if (error) throw error;

      if (profiles) {
        const unnormalized = profiles
          .filter(p => p.email !== normalizeEmail(p.email))
          .map(p => ({
            id: p.id,
            email: p.email,
            normalizedEmail: normalizeEmail(p.email),
          }));

        setResult({
          totalProfiles: profiles.length,
          normalizedCount: profiles.length - unnormalized.length,
          unnormalizedCount: unnormalized.length,
          unnormalizedEmails: unnormalized,
        });
      }
    } catch (error) {
      console.error('Error checking emails:', error);
      alert('Erro ao verificar emails. Veja o console para detalhes.');
    } finally {
      setIsChecking(false);
    }
  };

  const migrateEmails = async () => {
    if (!result || result.unnormalizedCount === 0) return;

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of result.unnormalizedEmails) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ email: item.normalizedEmail })
            .eq('id', item.id);

          if (error) {
            console.error(`Error updating ${item.id}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error updating ${item.id}:`, err);
          errorCount++;
        }
      }

      setMigrationResult(
        `Migração concluída: ${successCount} emails atualizados, ${errorCount} erros.`
      );

      // Re-check emails after migration
      await checkEmails();
    } catch (error) {
      console.error('Error migrating emails:', error);
      alert('Erro durante a migração. Veja o console para detalhes.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Emails</CardTitle>
          <CardDescription>
            Ferramenta para verificar e corrigir problemas de normalização de emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={checkEmails} disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Emails'
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.totalProfiles}</div>
                      <div className="text-sm text-gray-600">Total de Perfis</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-6 w-6" />
                        {result.normalizedCount}
                      </div>
                      <div className="text-sm text-gray-600">Emails Corretos</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        {result.unnormalizedCount}
                      </div>
                      <div className="text-sm text-gray-600">Emails Não Normalizados</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.unnormalizedCount > 0 && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 mb-2">
                      <strong>Atenção:</strong> Foram encontrados {result.unnormalizedCount} emails
                      que precisam ser normalizados.
                    </p>
                    <Button onClick={migrateEmails} disabled={isMigrating} variant="outline">
                      {isMigrating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Migrando...
                        </>
                      ) : (
                        'Migrar Emails para Lowercase'
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Emails que serão migrados:</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.unnormalizedEmails.map(item => (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-sm text-red-600">{item.email}</code>
                            <span className="text-gray-400">→</span>
                            <code className="text-sm text-green-600">{item.normalizedEmail}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {result.unnormalizedCount === 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm">
                      <strong>Perfeito!</strong> Todos os emails estão normalizados corretamente.
                    </p>
                  </div>
                </div>
              )}

              {migrationResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{migrationResult}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
