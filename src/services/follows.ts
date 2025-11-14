import { supabase } from '../utils/supabase/client';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) {
      console.error('Follow user error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in followUser:', error);
    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Unfollow user error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    throw error;
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Check following error:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isFollowing:', error);
    return false;
  }
}

export async function getFollowers(userId: string): Promise<{ id: string; name: string; avatar_url: string | null }[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        profile:profiles!follows_follower_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Get followers error:', error);
      throw error;
    }

    return (data || []).map(item => item.profile as any);
  } catch (error) {
    console.error('Error in getFollowers:', error);
    throw error;
  }
}

export async function getFollowing(userId: string): Promise<{ id: string; name: string; avatar_url: string | null }[]> {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profile:profiles!follows_following_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Get following error:', error);
      throw error;
    }

    return (data || []).map(item => item.profile as any);
  } catch (error) {
    console.error('Error in getFollowing:', error);
    throw error;
  }
}

export async function getFollowersCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) {
      console.error('Get followers count error:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getFollowersCount:', error);
    return 0;
  }
}

export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) {
      console.error('Get following count error:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getFollowingCount:', error);
    return 0;
  }
}
