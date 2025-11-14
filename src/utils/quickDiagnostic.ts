// Quick diagnostic tool
// Run in browser console: window.runDiagnostic()

import { supabase } from './supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

async function testTableExists(tableName: string): Promise<DiagnosticResult> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return {
          test: `Tabela: ${tableName}`,
          status: 'fail',
          message: `Tabela não existe. Execute a migration correspondente.`,
        };
      }
      return {
        test: `Tabela: ${tableName}`,
        status: 'warning',
        message: error.message,
      };
    }

    return {
      test: `Tabela: ${tableName}`,
      status: 'pass',
      message: 'OK',
    };
  } catch (error: any) {
    return {
      test: `Tabela: ${tableName}`,
      status: 'fail',
      message: error.message || 'Erro desconhecido',
    };
  }
}

async function testProfileColumns(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_locked, failed_login_attempts, locked_at, is_suspended')
      .limit(1);

    if (error) {
      return {
        test: 'Colunas de bloqueio em profiles',
        status: 'fail',
        message: `Execute MIGRATION_ACCOUNT_LOCKING.sql`,
      };
    }

    return {
      test: 'Colunas de bloqueio em profiles',
      status: 'pass',
      message: 'OK',
    };
  } catch (error: any) {
    return {
      test: 'Colunas de bloqueio em profiles',
      status: 'fail',
      message: error.message || 'Erro ao verificar colunas',
    };
  }
}

export async function runDiagnostic(): Promise<void> {
  console.clear();
  console.log('='.repeat(70));
  console.log('🔍 DIAGNÓSTICO RÁPIDO DO PAGEFY');
  console.log('='.repeat(70));
  console.log('');

  const results: DiagnosticResult[] = [];

  // Test critical tables
  const criticalTables = [
    'profiles',
    'books',
    'reviews',
    'publisher_requests',
    'unlock_requests',
  ];

  console.log('📋 Testando tabelas críticas...\n');

  for (const table of criticalTables) {
    const result = await testTableExists(table);
    results.push(result);
    
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
  }

  console.log('\n📋 Testando colunas especiais...\n');

  const columnsResult = await testProfileColumns();
  results.push(columnsResult);
  
  const icon = columnsResult.status === 'pass' ? '✅' : columnsResult.status === 'warning' ? '⚠️' : '❌';
  console.log(`${icon} ${columnsResult.test}: ${columnsResult.message}`);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`⚠️  Avisos: ${warnings}`);
  console.log('');

  if (failed > 0) {
    console.log('⚠️  AÇÕES NECESSÁRIAS:\n');
    
    const failedTests = results.filter(r => r.status === 'fail');
    
    if (failedTests.some(t => t.test.includes('unlock_requests'))) {
      console.log('1. Execute: MIGRATION_UNLOCK_REQUESTS.sql');
    }
    
    if (failedTests.some(t => t.test.includes('Colunas de bloqueio'))) {
      console.log('2. Execute: MIGRATION_ACCOUNT_LOCKING.sql');
    }
    
    console.log('\n📖 Veja instruções em: IMPORTANTE_EXECUTAR_MIGRATIONS.md');
  } else if (warnings > 0) {
    console.log('⚠️  Existem avisos, mas o sistema deve funcionar.');
  } else {
    console.log('🎉 TUDO OK! O sistema está configurado corretamente!');
  }

  console.log('='.repeat(70));
  console.log('');
}

// Make available globally for console use
if (typeof window !== 'undefined') {
  (window as any).runDiagnostic = runDiagnostic;
  console.log('💡 Dica: Execute "runDiagnostic()" no console para verificar o sistema');
}
