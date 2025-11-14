import { supabase } from '../utils/supabase/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  genre: string | null;
  publication_year: number | null;
  publisher_id: string | null;
  status: 'published' | 'draft';
  views_count: number;
  created_at: string;
  updated_at: string;
}

export async function getBooks(): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get books error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBooks:', error);
    throw error;
  }
}

export async function getBook(bookId: string): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .maybeSingle();

    if (error) {
      console.error('Get book error:', error);
      return null;
    }

    if (!data) {
      console.warn('[Books] Book not found:', bookId);
      return null;
    }

    // Increment view count
    await incrementViewCount(bookId);

    return data;
  } catch (error) {
    console.error('Error in getBook:', error);
    throw error;
  }
}

export async function searchBooks(query: string): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Search books error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchBooks:', error);
    throw error;
  }
}

export async function checkBookDuplicates(title: string, author: string, edition?: string): Promise<{ exists: boolean; message?: string }> {
  try {
    // Check if a book with the same title and author exists
    const { data, error } = await supabase
      .from('books')
      .select('title, author, genre')
      .ilike('title', title)
      .ilike('author', author);

    if (error) {
      console.error('Check duplicates error:', error);
      throw error;
    }

    if (data && data.length > 0) {
      // If there's an exact match without edition info, it's a duplicate
      return { 
        exists: true, 
        message: 'Já existe um livro cadastrado com este título e autor. Se for uma edição diferente, por favor especifique no título (ex: "Nome do Livro - 2ª Edição")' 
      };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error in checkBookDuplicates:', error);
    throw error;
  }
}

export async function createBook(book: Partial<Book>): Promise<Book | null> {
  try {
    // Check for duplicates before creating
    const duplicateCheck = await checkBookDuplicates(book.title || '', book.author || '');
    if (duplicateCheck.exists) {
      throw new Error(duplicateCheck.message || 'Livro já cadastrado');
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        ...book,
        status: book.status || 'published',
        views_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create book error:', error);
      throw new Error('Erro ao salvar o livro no banco de dados. Por favor, tente novamente.');
    }

    return data;
  } catch (error: any) {
    console.error('Error in createBook:', error);
    throw new Error(error.message || 'Erro ao criar livro. Por favor, tente novamente.');
  }
}

export async function updateBook(bookId: string, updates: Partial<Book>): Promise<Book | null> {
  try {
    const { data, error } = await supabase
      .from('books')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookId)
      .select()
      .single();

    if (error) {
      console.error('Update book error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBook:', error);
    throw error;
  }
}

export async function deleteBook(bookId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (error) {
      console.error('Delete book error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteBook:', error);
    throw error;
  }
}

async function incrementViewCount(bookId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_book_views', {
      book_id: bookId,
    });

    // If the function doesn't exist, fallback to manual increment
    if (error && error.message.includes('function')) {
      const book = await getBook(bookId);
      if (book) {
        await supabase
          .from('books')
          .update({ views_count: (book.views_count || 0) + 1 })
          .eq('id', bookId);
      }
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

export async function getUserBooks(userId: string): Promise<{ book: Book; status: string; date_added: string }[]> {
  try {
    const { data, error } = await supabase
      .from('user_books')
      .select(`
        status,
        date_added,
        book:books (*)
      `)
      .eq('user_id', userId)
      .order('date_added', { ascending: false });

    if (error) {
      console.error('Get user books error:', error);
      throw error;
    }

    return (data || []).map(item => ({
      book: item.book as unknown as Book,
      status: item.status,
      date_added: item.date_added,
    }));
  } catch (error) {
    console.error('Error in getUserBooks:', error);
    throw error;
  }
}

export async function addUserBook(userId: string, bookId: string, status: string): Promise<void> {
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (existing) {
      // Update existing status
      const { error } = await supabase
        .from('user_books')
        .update({ status })
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('Update user book error:', error);
        throw error;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('user_books')
        .insert({
          user_id: userId,
          book_id: bookId,
          status,
        });

      if (error) {
        console.error('Add user book error:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in addUserBook:', error);
    throw error;
  }
}

export async function removeUserBook(userId: string, bookId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      console.error('Remove user book error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeUserBook:', error);
    throw error;
  }
}

export async function getTotalBooksCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (error) {
      console.error('Error getting total books count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalBooksCount:', error);
    return 0;
  }
}

export async function getPublisherBooks(publisherId: string): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('publisher_id', publisherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get publisher books error:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPublisherBooks:', error);
    throw error;
  }
}

export interface PublisherStats {
  totalBooks: number;
  publishedBooks: number;
  draftBooks: number;
  totalViews: number;
  totalReviews: number;
  averageRating: number;
}

export async function getPublisherStats(publisherId: string): Promise<PublisherStats> {
  try {
    // Get all books by publisher
    const books = await getPublisherBooks(publisherId);
    
    const publishedBooks = books.filter(b => b.status === 'published');
    const draftBooks = books.filter(b => b.status === 'draft');
    
    // Calculate total views
    const totalViews = books.reduce((sum, book) => sum + (book.views_count || 0), 0);
    
    // Get reviews for all published books
    let totalReviews = 0;
    let totalRating = 0;
    
    for (const book of publishedBooks) {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('book_id', book.id);
      
      if (!error && reviews) {
        totalReviews += reviews.length;
        totalRating += reviews.reduce((sum, r) => sum + r.rating, 0);
      }
    }
    
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    
    return {
      totalBooks: books.length,
      publishedBooks: publishedBooks.length,
      draftBooks: draftBooks.length,
      totalViews,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };
  } catch (error) {
    console.error('Error in getPublisherStats:', error);
    return {
      totalBooks: 0,
      publishedBooks: 0,
      draftBooks: 0,
      totalViews: 0,
      totalReviews: 0,
      averageRating: 0,
    };
  }
}