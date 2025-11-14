import { supabase } from '../utils/supabase/client';

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  text: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
    is_private: boolean;
  };
}

export async function getReviews(bookId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        )
      `)
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get reviews error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getReviews:', error);
    throw error;
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user reviews error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserReviews:', error);
    throw error;
  }
}

export async function createReview(review: {
  book_id: string;
  user_id: string;
  rating: number;
  text: string;
}): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...review,
        likes_count: 0,
      })
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        )
      `)
      .single();

    if (error) {
      console.error('Create review error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
}

export async function updateReview(reviewId: string, updates: { rating?: number; text?: string }): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        )
      `)
      .single();

    if (error) {
      console.error('Update review error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteReview:', error);
    throw error;
  }
}

export async function getTotalReviewsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting total reviews count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalReviewsCount:', error);
    return 0;
  }
}