import { supabase } from '../utils/supabase/client';

export interface Quote {
  id: string;
  book_id: string;
  user_id: string;
  text: string;
  page: string | null;
  percentage: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export async function getQuotes(bookId: string, userId?: string): Promise<Quote[]> {
  try {
    let query = supabase
      .from('quotes')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url,
          is_private
        )
      `)
      .eq('book_id', bookId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Get quotes error:', error);
      throw error;
    }

    // Filter out private quotes from other users
    return (data || []).filter(quote => 
      !quote.profile?.is_private || quote.user_id === userId
    );
  } catch (error) {
    console.error('Error in getQuotes:', error);
    throw error;
  }
}

export async function getAllBookQuotes(bookId: string): Promise<Quote[]> {
  try {
    const { data, error } = await supabase
      .from('quotes')
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
      console.error('Get all book quotes error:', error);
      throw error;
    }

    // Filter out private quotes
    return (data || []).filter(quote => !quote.profile?.is_private);
  } catch (error) {
    console.error('Error in getAllBookQuotes:', error);
    return [];
  }
}

export async function getUserQuotes(userId: string): Promise<Quote[]> {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user quotes error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserQuotes:', error);
    throw error;
  }
}

export async function createQuote(quote: {
  book_id: string;
  user_id: string;
  text: string;
  page?: string;
  percentage?: string;
}): Promise<Quote | null> {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .insert(quote)
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Create quote error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createQuote:', error);
    throw error;
  }
}

export async function updateQuote(
  quoteId: string,
  updates: { text?: string; page?: string; percentage?: string }
): Promise<Quote | null> {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Update quote error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateQuote:', error);
    throw error;
  }
}

export async function deleteQuote(quoteId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId);

    if (error) {
      console.error('Delete quote error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteQuote:', error);
    throw error;
  }
}
