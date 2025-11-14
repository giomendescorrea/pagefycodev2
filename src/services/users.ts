import { supabase } from '../utils/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  role: 'user' | 'publisher' | 'admin';
  is_private: boolean;
  is_suspended?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_reviews: number;
  total_notes: number;
  total_quotes: number;
  average_rating: number;
  followers_count: number;
  following_count: number;
}

export async function checkPublisherNameExists(name: string, excludeUserId?: string): Promise<boolean> {
  try {
    const query = supabase
      .from('profiles')
      .select('id, name, role')
      .ilike('name', name)
      .eq('role', 'publisher');

    if (excludeUserId) {
      query.neq('id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking publisher name:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkPublisherNameExists:', error);
    return false;
  }
}

export async function searchUsers(query: string): Promise<UserProfile[]> {
  try {
    // Trim the query to avoid issues with whitespace
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return [];
    }

    // Try to search by name or email using ilike (case-insensitive)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${trimmedQuery}%,email.ilike.%${trimmedQuery}%`)
      .order('name', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error searching users in profiles table:', error);
      // If there's an error, return empty array instead of throwing
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return [];
  }
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // Get reviews count and average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('user_id', userId);

    if (reviewsError) throw reviewsError;

    // Get notes count
    const { count: notesCount, error: notesError } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (notesError) throw notesError;

    // Get quotes count
    const { count: quotesCount, error: quotesError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (quotesError) throw quotesError;

    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followersError) throw followersError;

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) throw followingError;

    // Calculate average rating
    const totalReviews = reviews?.length || 0;
    const sumRatings = reviews?.reduce((sum, review) => sum + review.rating, 0) || 0;
    const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

    return {
      total_reviews: totalReviews,
      total_notes: notesCount || 0,
      total_quotes: quotesCount || 0,
      average_rating: averageRating,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      total_reviews: 0,
      total_notes: 0,
      total_quotes: 0,
      average_rating: 0,
      followers_count: 0,
      following_count: 0,
    };
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: 'user' | 'publisher' | 'admin'): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    throw error;
  }
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean): Promise<void> {
  try {
    // Try to update is_suspended field
    // If the column doesn't exist in the database, this might fail
    // In that case, you can use another approach like role = 'suspended' or a separate table
    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: isSuspended })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling user suspension:', error);
      // If error is about column not existing, you might want to handle it differently
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.warn('is_suspended column does not exist in profiles table. This feature requires database migration.');
        throw new Error('A funcionalidade de suspensão requer atualização do banco de dados.');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in toggleUserSuspension:', error);
    throw error;
  }
}

export async function unlockUserAccount(userId: string): Promise<void> {
  try {
    // Get user profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      throw profileError;
    }

    if (!profile) {
      console.error('Profile not found for user:', userId);
      throw new Error('Perfil não encontrado');
    }

    // Unlock the account
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_locked: false,
        failed_login_attempts: 0,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error unlocking user account:', error);
      throw error;
    }

    // Send unlock notification email
    try {
      const { sendAccountUnlockedEmail } = await import('./email');
      await sendAccountUnlockedEmail(profile.email, profile.name);
      console.log('[Users] Account unlocked email sent to:', profile.email);
    } catch (emailError) {
      console.error('[Users] Error sending unlock email:', emailError);
      // Don't fail the unlock if email fails
    }

    // Create notification for the user
    try {
      const { createNotification } = await import('./notifications');
      await createNotification({
        user_id: userId,
        type: 'system',
        title: 'Conta Desbloqueada',
        description: 'Sua conta foi desbloqueada pelo administrador. Você já pode fazer login normalmente.',
      });
      console.log('[Users] Unlock notification created for user:', userId);
    } catch (notificationError) {
      console.error('[Users] Error creating unlock notification:', notificationError);
      // Don't fail the unlock if notification fails
    }
  } catch (error) {
    console.error('Error in unlockUserAccount:', error);
    throw error;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
}

export async function getTotalUsersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting total users count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalUsersCount:', error);
    return 0;
  }
}