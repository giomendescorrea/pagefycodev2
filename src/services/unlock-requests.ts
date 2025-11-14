import { supabase } from '../utils/supabase/client';

export interface UnlockRequest {
  id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  userName?: string;
  userEmail?: string;
  profile?: {
    id: string;
    name: string;
    email: string;
    is_locked?: boolean;
  };
}

export async function createUnlockRequest(userId: string, reason: string): Promise<UnlockRequest | null> {
  try {
    // Try to create the unlock request
    // This works because:
    // 1. If user is locked, Policy 1 allows anyone to create request
    // 2. If caller is admin, Policy 2 allows creation for any user
    const { data, error } = await supabase
      .from('unlock_requests')
      .insert([
        {
          user_id: userId,
          reason,
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (error) {
      // Check if table doesn't exist
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        // Silently return null - table is optional
        return null;
      }
      
      // If RLS error, it means user is not locked or caller is not admin
      if (error.code === '42501') {
        console.warn('Cannot create unlock request: User may not be locked or caller is not authorized');
        return null;
      }
      
      console.error('Error creating unlock request:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    // Gracefully handle missing table
    if (error?.code === 'PGRST204' || error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
      return null;
    }
    console.error('Error in createUnlockRequest:', error);
    return null;
  }
}

export async function getUnlockRequests(): Promise<UnlockRequest[]> {
  try {
    const { data, error } = await supabase
      .from('unlock_requests')
      .select(`
        *,
        profile:profiles!user_id (
          id,
          name,
          email,
          is_locked
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // Check if it's a "table not found" error or relationship error
      if (error.code === 'PGRST205' || error.code === 'PGRST200' || error.message?.includes('Could not find')) {
        // Silently return empty array - table is optional
        return [];
      }
      console.error('Error fetching unlock requests:', error);
      throw error;
    }

    // Add userName and userEmail for easier access
    return data.map(request => ({
      ...request,
      userName: request.profile?.name,
      userEmail: request.profile?.email,
    }));
  } catch (error: any) {
    // Gracefully handle missing table or relationship errors
    if (error?.code === 'PGRST205' || error?.code === 'PGRST200' || error?.message?.includes('Could not find')) {
      return [];
    }
    console.error('Error in getUnlockRequests:', error);
    return [];
  }
}

export async function approveUnlockRequest(requestId: string, userId: string): Promise<void> {
  try {
    // Update request status
    const { error: updateError } = await supabase
      .from('unlock_requests')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      // Check if table doesn't exist
      if (updateError.code === 'PGRST204' || updateError.code === 'PGRST205' || updateError.message?.includes('Could not find the table')) {
        // Silently return - table is optional
        return;
      }
      console.error('Error updating unlock request:', updateError);
      throw updateError;
    }

    // Unlock the user account
    const { error: unlockError } = await supabase
      .from('profiles')
      .update({ 
        is_locked: false,
        failed_login_attempts: 0,
        locked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (unlockError) {
      console.error('Error unlocking user account:', unlockError);
      throw unlockError;
    }
  } catch (error: any) {
    // Gracefully handle missing table
    if (error?.code === 'PGRST204' || error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
      return;
    }
    console.error('Error in approveUnlockRequest:', error);
    throw error;
  }
}

export async function rejectUnlockRequest(requestId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('unlock_requests')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      // Check if table doesn't exist
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        // Silently return - table is optional
        return;
      }
      console.error('Error rejecting unlock request:', error);
      throw error;
    }
  } catch (error: any) {
    // Gracefully handle missing table
    if (error?.code === 'PGRST204' || error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
      return;
    }
    console.error('Error in rejectUnlockRequest:', error);
    throw error;
  }
}

export async function getUserPendingUnlockRequest(userId: string): Promise<UnlockRequest | null> {
  try {
    const { data, error } = await supabase
      .from('unlock_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      // Check if table doesn't exist
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return null;
      }
      console.error('Error fetching pending unlock request:', error);
      return null;
    }

    return data;
  } catch (error: any) {
    // Gracefully handle missing table
    if (error?.code === 'PGRST204' || error?.code === 'PGRST205' || error?.message?.includes('Could not find the table')) {
      return null;
    }
    console.error('Error in getUserPendingUnlockRequest:', error);
    return null;
  }
}