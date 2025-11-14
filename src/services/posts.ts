import { supabase } from '../utils/supabase/client';

export interface Post {
  id: string;
  user_id: string;
  type: 'review' | 'quote';
  book_id: string;
  content: string;
  rating: number | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
  book?: {
    title: string;
    author: string;
    cover_url: string | null;
  };
}

export async function getPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        ),
        book:books (
          title,
          author,
          cover_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get posts error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPosts:', error);
    throw error;
  }
}

export async function createPost(post: {
  user_id: string;
  type: 'review' | 'quote';
  book_id: string;
  content: string;
  rating?: number;
}): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...post,
        likes_count: 0,
        comments_count: 0,
      })
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        ),
        book:books (
          title,
          author,
          cover_url
        )
      `)
      .single();

    if (error) {
      console.error('Create post error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deletePost:', error);
    throw error;
  }
}

export async function getFeedPosts(userId: string): Promise<Post[]> {
  try {
    // Get list of users that the current user follows
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followsError) {
      console.error('Get follows error:', followsError);
      throw followsError;
    }

    // Include current user's posts in the feed
    const followingIds = follows?.map(f => f.following_id) || [];
    const userIds = [userId, ...followingIds];

    if (userIds.length === 0) {
      return [];
    }

    // Get posts from followed users (and current user)
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        ),
        book:books (
          title,
          author,
          cover_url
        )
      `)
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Get feed posts error:', error);
      throw error;
    }

    // Filter out posts from private users (unless it's the current user)
    const filteredData = (data || []).filter(post => 
      post.user_id === userId || !post.profile?.is_private
    );

    return filteredData;
  } catch (error) {
    console.error('Error in getFeedPosts:', error);
    return [];
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        ),
        book:books (
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user posts error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    return [];
  }
}
