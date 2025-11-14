import { supabase } from '../utils/supabase/client';

export interface BookStatusCounts {
  para_ler: number;
  lendo: number;
  lido: number;
  total: number;
}

/**
 * Get reading status counts for a specific book
 */
export async function getBookStatusCounts(bookId: string): Promise<BookStatusCounts> {
  try {
    const { data, error } = await supabase
      .from('user_books')
      .select('status')
      .eq('book_id', bookId);

    if (error) {
      console.error('Error fetching book status counts:', error);
      return { para_ler: 0, lendo: 0, lido: 0, total: 0 };
    }

    if (!data || data.length === 0) {
      return { para_ler: 0, lendo: 0, lido: 0, total: 0 };
    }

    const para_ler = data.filter(item => item.status === 'para ler' || item.status === 'quer-ler').length;
    const lendo = data.filter(item => item.status === 'lendo').length;
    const lido = data.filter(item => item.status === 'lido').length;
    const total = data.length;

    return {
      para_ler,
      lendo,
      lido,
      total
    };
  } catch (error) {
    console.error('Error getting book status counts:', error);
    return { para_ler: 0, lendo: 0, lido: 0, total: 0 };
  }
}
