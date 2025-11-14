import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5ed9d16e/health", (c) => {
  return c.json({ status: "ok" });
});

// Check if email exists endpoint
app.post("/make-server-5ed9d16e/check-email", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('[CheckEmail] Checking if email exists:', normalizedEmail);

    // Check if user exists in Supabase Auth using admin API
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing users:', authError);
      return c.json({ error: 'Error checking email' }, 500);
    }

    // Find user with matching email
    const userExists = users.users.some(user => 
      user.email && user.email.toLowerCase().trim() === normalizedEmail
    );

    console.log('[CheckEmail] Email exists in Auth:', userExists);

    return c.json({ exists: userExists });
  } catch (error) {
    console.error('Error in check-email endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login endpoint with attempt tracking
app.post("/make-server-5ed9d16e/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('[Login] Login attempt for:', normalizedEmail);

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileError) {
      console.error('[Login] Error fetching profile:', profileError);
      return c.json({ error: 'Erro ao buscar perfil' }, 500);
    }

    if (!profile) {
      console.log('[Login] Profile not found');
      return c.json({ error: 'EMAIL_NOT_FOUND' }, 404);
    }

    // Check if account is locked
    if (profile.is_locked) {
      console.log('[Login] Account is locked');
      return c.json({ 
        error: 'ACCOUNT_LOCKED',
        message: 'Sua conta foi bloqueada devido a múltiplas tentativas de login. Entre em contato com o administrador para desbloquear.' 
      }, 403);
    }

    // Try to authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError) {
      console.log('[Login] Authentication failed:', authError.message);
      
      // Increment failed login attempts
      const failedAttempts = (profile.failed_login_attempts || 0) + 1;
      const remainingAttempts = 5 - failedAttempts;
      
      console.log(`[Login] Failed attempt ${failedAttempts}/5 for user ${profile.id}`);

      // Update failed attempts
      const updateData: any = {
        failed_login_attempts: failedAttempts,
        updated_at: new Date().toISOString(),
      };

      // Lock account if 5 attempts reached
      if (failedAttempts >= 5) {
        updateData.is_locked = true;
        updateData.locked_at = new Date().toISOString();
        console.log('[Login] Locking account due to too many failed attempts');
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (failedAttempts >= 5) {
        return c.json({ 
          error: 'ACCOUNT_LOCKED',
          message: 'Sua conta foi bloqueada devido a múltiplas tentativas de login. Entre em contato com o administrador para desbloquear.',
          failedAttempts,
          remainingAttempts: 0
        }, 403);
      }

      return c.json({ 
        error: 'WRONG_PASSWORD',
        message: 'Senha incorreta',
        failedAttempts,
        remainingAttempts
      }, 401);
    }

    // Login successful - reset failed attempts
    if (profile.failed_login_attempts > 0 || profile.is_locked) {
      await supabase
        .from('profiles')
        .update({
          failed_login_attempts: 0,
          is_locked: false,
          locked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (updatedProfile) {
        profile.failed_login_attempts = 0;
        profile.is_locked = false;
        profile.locked_at = null;
      }
    }

    console.log('[Login] Login successful for:', normalizedEmail);

    // Check if user has a pending publisher request
    const { data: pendingRequest } = await supabase
      .from('publisher_requests')
      .select('status')
      .eq('user_id', profile.id)
      .eq('status', 'pending')
      .maybeSingle();

    return c.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        access_token: authData.session.access_token,
      },
      profile,
      isPendingApproval: !!pendingRequest,
    });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Signup endpoint - creates user with admin API
app.post("/make-server-5ed9d16e/signup", async (c) => {
  try {
    const { name, email, password, accountType = 'reader', cnpj, birthDate } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('[Signup] Creating account for:', normalizedEmail);

    // Validate CNPJ for publisher accounts
    if (accountType === 'publisher' && !cnpj) {
      return c.json({ error: 'CNPJ is required for publisher accounts' }, 400);
    }

    // Additional validation for publishers (before creating user)
    if (accountType === 'publisher') {
      // Check for duplicate company name
      const { data: existingCompany } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('name', name)
        .maybeSingle();

      if (existingCompany) {
        return c.json({ error: 'Uma empresa com este nome já está cadastrada. Por favor, use outro nome.' }, 400);
      }

      // Check for duplicate CNPJ in publisher_requests
      const { data: allRequests } = await supabase
        .from('publisher_requests')
        .select('reason')
        .ilike('reason', `%${cnpj}%`);

      if (allRequests && allRequests.length > 0) {
        return c.json({ error: 'Este CNPJ já está cadastrado. Por favor, use outro CNPJ.' }, 400);
      }
    }

    // Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true, // Automatically confirm the user's email since an email server hasn't been configured
    });

    if (authError) {
      console.error('Auth error during signup:', authError);
      
      // Provide user-friendly error messages
      let errorMessage = authError.message;
      if (authError.message.includes('already been registered') || authError.code === 'email_exists' || authError.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Por favor, use outro email.';
      } else if (authError.message.includes('password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      
      return c.json({ error: errorMessage }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'User creation failed' }, 500);
    }

    // Create profile - always start as 'user', even if publisher is requested
    const profileInsert: any = {
      id: authData.user.id,
      name,
      email: normalizedEmail,
      role: 'user',
      is_private: false,
    };
    
    if (birthDate) {
      profileInsert.birth_date = birthDate;
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert(profileInsert)
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error during signup:', profileError);
      // Attempt to delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: 'Failed to create profile' }, 500);
    }

    // If publisher type is requested, create a publisher request automatically
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

      if (requestError) {
        console.error('Publisher request error:', requestError);
        // Don't fail signup if publisher request fails
      } else {
        isPendingApproval = true;
        
        // Notify all admins about the new publisher request
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
              related_entity_id: requestData?.id,
            }));

            await supabase
              .from('notifications')
              .insert(notifications);
            
            console.log(`Notified ${admins.length} admin(s) about new publisher signup request`);
          }
        } catch (notifError) {
          console.error('Error notifying admins:', notifError);
        }
      }
    }

    // Sign in to get session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (sessionError || !sessionData.session) {
      console.error('Session error during signup:', sessionError);
      return c.json({ error: 'Failed to create session' }, 500);
    }

    console.log('[Signup] Account created successfully for:', normalizedEmail);

    return c.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        access_token: sessionData.session.access_token,
      },
      profile: profileData,
      isPendingApproval,
    });
  } catch (error) {
    console.error('Error in signup endpoint:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

Deno.serve(app.fetch);