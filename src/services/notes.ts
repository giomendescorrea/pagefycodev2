import { supabase } from '../utils/supabase/client';

export interface Note {
  id: string;
  book_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export async function getNotes(bookId: string, userId?: string): Promise<Note[]> {
  try {
    let query = supabase
      .from('notes')
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
      console.error('Get notes error:', error);
      throw error;
    }

    // Filter out private notes from other users
    return (data || []).filter(note => 
      !note.profile?.is_private || note.user_id === userId
    );
  } catch (error) {
    console.error('Error in getNotes:', error);
    throw error;
  }
}

export async function getAllBookNotes(bookId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
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
      console.error('Get all book notes error:', error);
      throw error;
    }

    // Filter out private notes
    return (data || []).filter(note => !note.profile?.is_private);
  } catch (error) {
    console.error('Error in getAllBookNotes:', error);
    return [];
  }
}

export async function getUserNotes(userId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
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
      console.error('Get user notes error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserNotes:', error);
    throw error;
  }
}

export async function createNote(note: {
  book_id: string;
  user_id: string;
  text: string;
}): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert(note)
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Create note error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createNote:', error);
    throw error;
  }
}

export async function updateNote(noteId: string, text: string): Promise<Note | null> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({
        text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select(`
        *,
        profile:profiles (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Update note error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateNote:', error);
    throw error;
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Delete note error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteNote:', error);
    throw error;
  }
}
