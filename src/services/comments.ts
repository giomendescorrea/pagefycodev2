import { supabase } from '../utils/supabase/client';

export interface Comment {
  id: string;
  review_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export async function getComments(reviewId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get comments error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getComments:', error);
    throw error;
  }
}

export async function createComment(comment: {
  review_id: string;
  user_id: string;
  text: string;
}): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Create comment error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createComment:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Delete comment error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteComment:', error);
    throw error;
  }
}
