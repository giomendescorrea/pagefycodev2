import { supabase } from '../utils/supabase/client';

export interface PublisherRequest {
  id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profile?: {
    name: string;
    email: string;
  };
  // Add helper properties for compatibility
  userName?: string;
  userEmail?: string;
}

export async function getPublisherRequests(): Promise<PublisherRequest[]> {
  try {
    const { data, error } = await supabase
      .from('publisher_requests')
      .select(`
        *,
        profile:profiles!publisher_requests_user_id_fkey (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get publisher requests error:', error);
      throw error;
    }

    // Map data to include helper properties
    const requests = (data || []).map(request => ({
      ...request,
      userName: request.profile?.name || 'Usuário',
      userEmail: request.profile?.email || 'Email não disponível',
    }));

    return requests;
  } catch (error) {
    console.error('Error in getPublisherRequests:', error);
    throw error;
  }
}

export async function getUserPublisherRequest(userId: string): Promise<PublisherRequest | null> {
  try {
    const { data, error } = await supabase
      .from('publisher_requests')
      .select(`
        *,
        profile:profiles!publisher_requests_user_id_fkey (
          name,
          email
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Get user publisher request error:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getUserPublisherRequest:', error);
    return null;
  }
}

export async function createPublisherRequest(userId: string, reason: string): Promise<PublisherRequest | null> {
  try {
    const { data, error } = await supabase
      .from('publisher_requests')
      .insert({
        user_id: userId,
        reason,
        status: 'pending',
      })
      .select(`
        *,
        profile:profiles!publisher_requests_user_id_fkey (
          name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Create publisher request error:', error);
      throw error;
    }

    console.log('[PublisherRequest] Created request:', data);

    // Notify all admins about the new request
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
          description: `${data.profile?.name || 'Um usuário'} solicitou acesso como publicador.`,
          related_entity_id: data.id,
        }));

        await supabase
          .from('notifications')
          .insert(notifications);
        
        console.log(`[PublisherRequest] Notified ${admins.length} admin(s) about new request`);
      }
    } catch (notifError) {
      console.error('Error notifying admins about publisher request:', notifError);
      // Don't fail the request creation if notification fails
    }

    return {
      ...data,
      userName: data.profile?.name || 'Usuário',
      userEmail: data.profile?.email || 'Email não disponível',
    };
  } catch (error) {
    console.error('Error in createPublisherRequest:', error);
    throw error;
  }
}

export async function approvePublisherRequest(
  requestId: string,
  reviewedBy: string
): Promise<void> {
  try {
    // Get the request to find user_id
    const { data: request, error: getError } = await supabase
      .from('publisher_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (getError) {
      console.error('Get request error:', getError);
      throw getError;
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from('publisher_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Update request error:', updateError);
      throw updateError;
    }

    // Update user role to publisher
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'publisher' })
      .eq('id', request.user_id);

    if (roleError) {
      console.error('Update role error:', roleError);
      throw roleError;
    }
  } catch (error) {
    console.error('Error in approvePublisherRequest:', error);
    throw error;
  }
}

export async function rejectPublisherRequest(
  requestId: string,
  reviewedBy: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('publisher_requests')
      .update({
        status: 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      console.error('Reject request error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in rejectPublisherRequest:', error);
    throw error;
  }
}