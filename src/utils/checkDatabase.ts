// Database verification utility
// Use this to check if all required tables and columns exist

import { supabase } from './supabase/client';

interface DatabaseCheck {
  name: string;
  exists: boolean;
  error?: string;
}

export async function checkDatabaseSetup(): Promise<{
  tables: DatabaseCheck[];
  columns: DatabaseCheck[];
  allOk: boolean;
}> {
  const results: {
    tables: DatabaseCheck[];
    columns: DatabaseCheck[];
    allOk: boolean;
  } = {
    tables: [],
    columns: [],
    allOk: true,
  };

  // Silent mode - only log if explicitly needed
  const silentMode = true;
  if (!silentMode) {
    console.log('🔍 Verificando configuração do banco de dados...\n');
  }

  // Check core tables (required)
  const coreTables = [
    'profiles',
    'books',
    'reviews',
    'comments',
    'notes',
    'quotes',
    'user_books',
    'follows',
    'notifications',
    'publisher_requests',
    'posts',
  ];
  
  // Optional tables (for extra features)
  const optionalTables = [
    'unlock_requests', // For account unlock requests feature
  ];
  
  const requiredTables = [...coreTables, ...optionalTables];

  for (const tableName of requiredTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (error) {
        const isOptional = optionalTables.includes(tableName);
        results.tables.push({
          name: tableName,
          exists: false,
          error: error.message,
        });
        
        if (!isOptional) {
          results.allOk = false;
          if (!silentMode) {
            console.log(`❌ Tabela '${tableName}': NÃO EXISTE`);
            console.log(`   Erro: ${error.message}\n`);
          }
        } else {
          if (!silentMode) {
            console.log(`⚠️  Tabela '${tableName}': OPCIONAL (não instalada)`);
          }
          results.allOk = false; // Still mark as not ok to show banner
        }
      } else {
        results.tables.push({
          name: tableName,
          exists: true,
        });
        if (!silentMode) {
          console.log(`✅ Tabela '${tableName}': OK`);
        }
      }
    } catch (error: any) {
      results.tables.push({
        name: tableName,
        exists: false,
        error: error.message,
      });
      results.allOk = false;
      console.log(`❌ Tabela '${tableName}': ERRO`);
      console.log(`   ${error.message}\n`);
    }
  }

  if (!silentMode) {
    console.log('\n🔍 Verificando colunas da tabela profiles...\n');
  }

  // Check required columns in profiles table
  const requiredProfileColumns = [
    'is_locked',
    'failed_login_attempts',
    'locked_at',
    'is_suspended',
  ];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(requiredProfileColumns.join(','))
      .limit(1);

    if (error) {
      for (const col of requiredProfileColumns) {
        results.columns.push({
          name: `profiles.${col}`,
          exists: false,
          error: error.message,
        });
      }
      results.allOk = false;
      if (!silentMode) {
        console.log(`❌ Colunas de bloqueio: NÃO EXISTEM`);
        console.log(`   Erro: ${error.message}\n`);
      }
    } else {
      for (const col of requiredProfileColumns) {
        results.columns.push({
          name: `profiles.${col}`,
          exists: true,
        });
        if (!silentMode) {
          console.log(`✅ Coluna 'profiles.${col}': OK`);
        }
      }
    }
  } catch (error: any) {
    for (const col of requiredProfileColumns) {
      results.columns.push({
        name: `profiles.${col}`,
        exists: false,
        error: error.message,
      });
    }
    results.allOk = false;
    if (!silentMode) {
      console.log(`❌ Erro ao verificar colunas: ${error.message}\n`);
    }
  }

  // Summary
  const missingTables = results.tables.filter(t => !t.exists);
  const missingColumns = results.columns.filter(c => !c.exists);

  if (!silentMode) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA VERIFICAÇÃO');
    console.log('='.repeat(60));
  }

  if (results.allOk) {
    if (!silentMode) {
      console.log('✅ TUDO OK! Todas as tabelas e colunas necessárias existem.\n');
    }
  } else if (!silentMode) {
    const criticalMissing = missingTables.filter(t => !optionalTables.includes(t.name));
    const optionalMissing = missingTables.filter(t => optionalTables.includes(t.name));
    
    if (criticalMissing.length > 0) {
      console.log('❌ ERRO! Tabelas essenciais faltando:\n');
      criticalMissing.forEach(t => {
        console.log(`   - ${t.name}`);
      });
      console.log('\n⚠️  Ação urgente necessária!\n');
    } else if (optionalMissing.length > 0 || missingColumns.length > 0) {
      console.log('💡 INFO: Funcionalidades extras disponíveis\n');
      
      if (optionalMissing.length > 0) {
        console.log(`⚠️  Tabelas opcionais não instaladas (${optionalMissing.length}):`);
        optionalMissing.forEach(t => {
          console.log(`   - ${t.name} (opcional)`);
        });
        console.log('');
      }

      if (missingColumns.length > 0) {
        console.log(`⚠️  Colunas opcionais não instaladas (${missingColumns.length}):`);
        missingColumns.forEach(c => {
          console.log(`   - ${c.name} (opcional)`);
        });
        console.log('');
      }

      console.log('📝 Para ativar funcionalidades extras:');
      console.log('   Execute as migrations SQL no Supabase Dashboard:\n');
      
      if (missingColumns.length > 0) {
        console.log('   1. Execute: MIGRATION_ACCOUNT_LOCKING.sql');
      }
      
      if (missingTables.some(t => t.name === 'unlock_requests')) {
        console.log('   2. Execute: MIGRATION_UNLOCK_REQUESTS.sql');
      }
      
      console.log('\n   Ou leia: README_MIGRATIONS.md (guia rápido)');
    }
  }

  if (!silentMode) {
    console.log('='.repeat(60) + '\n');
  }

  return results;
}

// Function to display migration instructions
export function showMigrationInstructions(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📚 COMO EXECUTAR AS MIGRATIONS');
  console.log('='.repeat(60));
  console.log(`
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto Pagefy
3. Clique em 'SQL Editor' no menu lateral
4. Clique em '+ New query'

5. Execute MIGRATION_ACCOUNT_LOCKING.sql:
   - Copie todo o conteúdo do arquivo
   - Cole no editor SQL
   - Clique em 'Run'
   - Aguarde a confirmação de sucesso

6. Execute MIGRATION_UNLOCK_REQUESTS.sql:
   - Clique em '+ New query' novamente
   - Copie todo o conteúdo do arquivo
   - Cole no editor SQL
   - Clique em 'Run'
   - Aguarde a confirmação de sucesso

7. Recarregue esta aplicação (F5)

Para mais detalhes, leia: IMPORTANTE_EXECUTAR_MIGRATIONS.md
`);
  console.log('='.repeat(60) + '\n');
}

// Auto-run check on import (only in development)
// Disabled by default - check is now done in App.tsx with less intrusive banner
// Uncomment if you want detailed logs on every page load:
/*
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    checkDatabaseSetup().then(results => {
      if (!results.allOk) {
        showMigrationInstructions();
      }
    });
  }, 2000);
}
*/
