import { supabase } from '../utils/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'review' | 'system';
  title: string;
  description: string;
  related_entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get notifications error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    throw error;
  }
}

export async function createNotification(notification: {
  user_id: string;
  type: 'like' | 'comment' | 'follow' | 'review' | 'system';
  title: string;
  description: string;
  related_entity_id?: string;
}): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Create notification error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markAsRead:', error);
    throw error;
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    throw error;
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Get unread count error:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return 0;
  }
}
