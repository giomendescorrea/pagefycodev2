import { supabase } from '../utils/supabase/client';
import { normalizeEmail } from '../utils/emailUtils';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import * as unlockRequestsService from './unlock-requests';

// Custom error class for authentication errors with additional data
class AuthError extends Error {
  remainingAttempts?: number;
  
  constructor(message: string, remainingAttempts?: number) {
    super(message);
    this.name = 'AuthError';
    this.remainingAttempts = remainingAttempts;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  access_token: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  birth_date?: string;
  cnpj?: string;
  role: 'user' | 'publisher' | 'admin';
  is_private: boolean;
  is_locked?: boolean;
  failed_login_attempts?: number;
  locked_at?: string;
  created_at: string;
  updated_at: string;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server`;

export async function signUp(name: string, email: string, password: string, accountType: 'reader' | 'publisher' = 'reader', cnpj?: string, birthDate?: string): Promise<{ user: AuthUser; profile: Profile; isPendingApproval?: boolean } | null> {
  try {
    // Normalize email before sending to server
    const normalizedEmail = normalizeEmail(email);
    
    console.log('[Auth Service] signUp called with:', { name, email: normalizedEmail, accountType, cnpj, birthDate });
    
    // Try to call server first
    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ name, email: normalizedEmail, password, accountType, cnpj, birthDate }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      // If server returns error, parse it
      let errorMessage = 'Erro ao criar conta';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    } catch (fetchError: any) {
      console.warn('[Auth] Server signup failed, using fallback method:', fetchError.message);
      
      // Fallback: Use Supabase client directly
      console.log('[Auth] Using direct Supabase signup...');
      
      // Check if email already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
      
      if (existingProfile) {
        throw new Error('Este email já está cadastrado. Por favor, use outro email.');
      }
      
      // Additional validation for publishers
      if (accountType === 'publisher') {
        if (!cnpj) {
          throw new Error('CNPJ é obrigatório para contas corporativas.');
        }
        
        // Check for duplicate company name
        const { data: existingCompany } = await supabase
          .from('profiles')
          .select('id')
          .eq('name', name)
          .maybeSingle();
        
        if (existingCompany) {
          throw new Error('Uma empresa com este nome já está cadastrada. Por favor, use outro nome.');
        }
      }
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name,
            account_type: accountType,
          },
          emailRedirectTo: undefined,
          // Don't send confirmation email
        }
      });
      
      if (authError) {
        console.error('[Auth] Supabase auth signup error:', authError);
        let errorMessage = authError.message;
        if (authError.message.includes('already been registered') || authError.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Por favor, use outro email.';
        } else if (authError.message.includes('password')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        }
        throw new Error(errorMessage);
      }
      
      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      // Auto-confirm email using Admin API (if available)
      try {
        console.log('[Auth] Attempting to auto-confirm email...');
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          authData.user.id,
          { email_confirm: true }
        );
        if (confirmError) {
          console.warn('[Auth] Could not auto-confirm email (admin API not available):', confirmError.message);
        } else {
          console.log('[Auth] Email auto-confirmed successfully');
        }
      } catch (confirmErr) {
        console.warn('[Auth] Email auto-confirm not available (expected in client-side mode)');
      }
      
      // Create profile manually
      const profileInsert: any = {
        id: authData.user.id,
        name,
        email: normalizedEmail,
        role: 'user',
        is_private: false,
        is_locked: false,
        failed_login_attempts: 0,
      };
      
      if (birthDate) {
        profileInsert.birth_date = birthDate;
        console.log('[Auth] Adding birth_date to profile:', birthDate);
      } else {
        console.warn('[Auth] No birthDate provided!');;
      }
      
      if (cnpj) {
        profileInsert.cnpj = cnpj;
        console.log('[Auth] Adding CNPJ to profile:', cnpj);
      }
      
      console.log('[Auth] Profile insert data:', profileInsert);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert(profileInsert)
        .select()
        .single();
      
      if (profileError) {
        console.error('[Auth] Profile creation error:', profileError);
        throw new Error('Falha ao criar perfil');
      }
      
      console.log('[Auth] Profile created successfully:', profileData);
      
      // If publisher type is requested, create a publisher request
      let isPendingApproval = false;
      if (accountType === 'publisher') {
        const { data: requestData, error: requestError } = await supabase
          .from('publisher_requests')
          .insert({
            user_id: authData.user.id,
            reason: `Solicitação de cadastro corporativo\nCNPJ: ${cnpj}\nEmpresa: ${name}`,
            status: 'pending',
          })
          .select()
          .single();
        
        if (!requestError && requestData) {
          isPendingApproval = true;
          
          // Notify admins
          try {
            const { data: admins } = await supabase
              .from('profiles')
              .select('id')
              .eq('role', 'admin');
            
            if (admins && admins.length > 0) {
              const notifications = admins.map(admin => ({
                user_id: admin.id,
                type: 'system',
                title: 'Nova solicitação de publicador',
                description: `${name} solicitou acesso como publicador durante o cadastro.`,
                related_entity_id: requestData.id,
              }));
              
              await supabase
                .from('notifications')
                .insert(notifications);
            }
          } catch (notifError) {
            console.error('[Auth] Error notifying admins:', notifError);
          }
        }
      }
      
      // Return user data
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          access_token: authData.session?.access_token || '',
        },
        profile: profileData,
        isPendingApproval,
      };
    }
  } catch (error: any) {
    console.error('[Auth] Signup error:', error);
    throw new Error(error.message || 'Erro ao criar conta');
  }
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; profile: Profile; isPendingApproval?: boolean } | null> {
  try {
    // Normalize email using utility function
    const normalizedEmail = normalizeEmail(email);
    
    // First, check if the profile exists and if it's locked
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error('[Auth] Error fetching profile:', profileError);
      throw new Error('Erro ao buscar perfil');
    }

    if (!profile) {
      throw new Error('EMAIL_NOT_FOUND');
    }

    // Check if account is locked
    if (profile.is_locked) {
      throw new Error('ACCOUNT_LOCKED');
    }
    
    // Try to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Ignore email confirmation errors (we don't require email confirmation)
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        console.log('[Auth] Ignoring email confirmation requirement');
        // Continue with the login process - we'll try to get the session anyway
      } else {
        // Silently handle login errors (expected behavior)
        
        // Increment failed login attempts
        const failedAttempts = (profile.failed_login_attempts || 0) + 1;
        const remainingAttempts = 5 - failedAttempts;

        // Update failed attempts
        const updateData: any = {
          failed_login_attempts: failedAttempts,
          updated_at: new Date().toISOString(),
        };

        // Lock account if 5 attempts reached
        if (failedAttempts >= 5) {
          updateData.is_locked = true;
          updateData.locked_at = new Date().toISOString();
        }

        await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        if (failedAttempts >= 5) {
          // Automatically create unlock request for the admin
          try {
            await unlockRequestsService.createUnlockRequest(
              profile.id,
              'Conta bloqueada automaticamente após 5 tentativas de login incorretas.'
            );
            console.log('[Auth] Unlock request created automatically for:', profile.email);
          } catch (unlockError) {
            console.warn('[Auth] Failed to create unlock request (table may not exist):', unlockError);
            // Don't fail the whole operation if unlock request creation fails
          }
          
          // Notify all admins about the locked account
          try {
            const { data: admins } = await supabase
              .from('profiles')
              .select('id')
              .eq('role', 'admin');
            
            if (admins && admins.length > 0) {
              const notificationsService = await import('./notifications');
              for (const admin of admins) {
                await notificationsService.createNotification({
                  user_id: admin.id,
                  type: 'system',
                  title: 'Conta bloqueada',
                  description: `${profile.name} teve a conta bloqueada após 5 tentativas de login incorretas.`,
                  related_entity_id: profile.id,
                });
              }
              console.log(`[Auth] Notified ${admins.length} admin(s) about locked account: ${profile.email}`);
            }
          } catch (notifError) {
            console.error('[Auth] Error notifying admins:', notifError);
            // Don't fail the whole operation if notification fails
          }
          
          throw new Error('ACCOUNT_LOCKED_NOW');
        }

        // Check if it's an invalid credentials error
        if (error.message.includes('Invalid login credentials')) {
          const errorObj: any = new AuthError('WRONG_PASSWORD', remainingAttempts);
          throw errorObj;
        }
        
        // Other auth errors
        throw error;
      }
    }

    if (!data.session) {
      throw new Error('No session returned');
    }

    // Login successful - reset failed attempts if there were any
    if (profile.failed_login_attempts && profile.failed_login_attempts > 0) {
      await supabase
        .from('profiles')
        .update({
          failed_login_attempts: 0,
          is_locked: false,
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      
      profile.failed_login_attempts = 0;
      profile.is_locked = false;
    }

    // Fetch fresh user profile
    const updatedProfile = await getProfile(data.user.id);
    if (!updatedProfile) {
      throw new Error('Profile not found');
    }

    // Check if user has a pending publisher request
    const { data: pendingRequest } = await supabase
      .from('publisher_requests')
      .select('status')
      .eq('user_id', data.user.id)
      .eq('status', 'pending')
      .maybeSingle();

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        access_token: data.session.access_token,
      },
      profile: updatedProfile,
      isPendingApproval: !!pendingRequest,
    };
  } catch (error) {
    // Re-throw the error without logging (handled by caller)
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // AuthSessionMissingError is not critical - user is already logged out
      if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
        console.log('User already logged out (no session found)');
        return;
      }
      console.error('Sign out error:', error);
      throw error;
    }
  } catch (error: any) {
    // AuthSessionMissingError is not critical - user is already logged out
    if (error?.name === 'AuthSessionMissingError' || error?.message?.includes('Auth session missing')) {
      console.log('User already logged out (no session found)');
      return;
    }
    console.error('Error in signOut:', error);
    throw error;
  }
}

export async function getSession(): Promise<{ user: AuthUser; profile: Profile; isPendingApproval?: boolean } | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    if (!data.session) {
      return null;
    }

    // Fetch user profile
    const profile = await getProfile(data.session.user.id);
    if (!profile) {
      return null;
    }

    // Check if user has a pending publisher request
    const { data: pendingRequest } = await supabase
      .from('publisher_requests')
      .select('status')
      .eq('user_id', data.session.user.id)
      .eq('status', 'pending')
      .maybeSingle();

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email!,
        access_token: data.session.access_token,
      },
      profile,
      isPendingApproval: !!pendingRequest,
    };
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    if (!data) {
      console.warn('[Auth] Profile not found for user:', userId);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
}