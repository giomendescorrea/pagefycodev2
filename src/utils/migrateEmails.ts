import { supabase } from './supabase/client';
import { normalizeEmail } from './emailUtils';

/**
 * Script de migração para normalizar todos os emails existentes no banco de dados
 * Este script deve ser executado UMA VEZ para garantir que todos os emails estejam em lowercase
 */
export async function migrateEmailsToLowercase() {
  console.log('[Migration] Starting email normalization migration...');
  
  try {
    // 1. Atualizar emails na tabela profiles
    console.log('[Migration] Normalizing emails in profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');
    
    if (profilesError) {
      console.error('[Migration] Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    if (profiles && profiles.length > 0) {
      console.log(`[Migration] Found ${profiles.length} profiles to check`);
      
      let updatedCount = 0;
      for (const profile of profiles) {
        const normalizedEmail = normalizeEmail(profile.email);
        
        // Só atualiza se o email for diferente
        if (profile.email !== normalizedEmail) {
          console.log(`[Migration] Updating profile ${profile.id}: ${profile.email} -> ${normalizedEmail}`);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ email: normalizedEmail })
            .eq('id', profile.id);
          
          if (updateError) {
            console.error(`[Migration] Error updating profile ${profile.id}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      }
      
      console.log(`[Migration] Updated ${updatedCount} profile emails`);
    }
    
    // 2. Atualizar emails na tabela auth.users (isso precisa ser feito via API do Supabase Admin)
    console.log('[Migration] Note: Auth users need to be updated via Supabase Admin API');
    console.log('[Migration] This should be done in the server edge function');
    
    console.log('[Migration] Email normalization migration completed successfully!');
    return true;
  } catch (error) {
    console.error('[Migration] Email normalization migration failed:', error);
    return false;
  }
}

/**
 * Função para verificar se há emails não normalizados no sistema
 */
export async function checkForUnnormalizedEmails() {
  console.log('[Check] Checking for unnormalized emails...');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email');
    
    if (error) {
      console.error('[Check] Error fetching profiles:', error);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      const unnormalized = profiles.filter(p => p.email !== normalizeEmail(p.email));
      
      if (unnormalized.length > 0) {
        console.log(`[Check] Found ${unnormalized.length} unnormalized emails:`);
        unnormalized.forEach(p => {
          console.log(`  - ${p.email} (should be: ${normalizeEmail(p.email)})`);
        });
        return unnormalized;
      } else {
        console.log('[Check] All emails are normalized! ✓');
        return [];
      }
    }
  } catch (error) {
    console.error('[Check] Error checking emails:', error);
  }
}
