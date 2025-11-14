import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint - creates user with admin API
app.post("/signup", async (c) => {
  try {
    const { name, email, password, accountType = 'reader', cnpj, birthDate } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

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
      email,
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
      email: email.toLowerCase(),
      role: 'user',
      is_private: false,
      is_locked: false,
      failed_login_attempts: 0,
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
      email,
      password,
    });

    if (sessionError || !sessionData.session) {
      console.error('Session error during signup:', sessionError);
      return c.json({ error: 'Failed to create session' }, 500);
    }

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

// Reset password endpoint - updates user password with admin API
app.post("/reset-password", async (c) => {
  try {
    const { email, newPassword } = await c.req.json();

    console.log('[reset-password] Iniciando reset para email:', email);

    if (!email || !newPassword) {
      console.error('[reset-password] Campos obrigatórios ausentes');
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (newPassword.length < 6) {
      console.error('[reset-password] Senha muito curta');
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Get user by email using getUserByEmail method
    console.log('[reset-password] Buscando usuário por email...');
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (getUserError) {
      console.error('[reset-password] Erro ao buscar usuário:', getUserError);
      return c.json({ error: 'Failed to find user: ' + getUserError.message }, 500);
    }

    if (!userData || !userData.user) {
      console.error('[reset-password] Usuário não encontrado');
      return c.json({ error: 'User not found' }, 404);
    }

    console.log('[reset-password] Usuário encontrado:', userData.user.id);

    // Update user password with admin API
    console.log('[reset-password] Atualizando senha...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('[reset-password] Erro ao atualizar senha:', updateError);
      return c.json({ error: 'Failed to update password: ' + updateError.message }, 500);
    }

    console.log('[reset-password] Senha atualizada com sucesso');
    return c.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('[reset-password] Erro não tratado:', error);
    return c.json({ error: 'Internal server error during password reset: ' + error.message }, 500);
  }
});

Deno.serve(app.fetch);