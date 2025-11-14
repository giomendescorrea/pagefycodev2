import { supabase } from '../utils/supabase/client';

export interface BookStats {
  book_id: string;
  book_title: string;
  book_cover_url?: string;
  average_rating: number;
  total_reviews: number;
  total_readers: number;
  status_to_read: number;
  status_reading: number;
  status_read: number;
}

export interface ReadingStatusStats {
  status: 'to_read' | 'reading' | 'read';
  count: number;
}

export interface PublisherStatsData {
  total_books: number;
  total_readers: number;
  total_views: number;
  average_rating: number;
  books_ranking: BookStats[];
  overall_status_stats: ReadingStatusStats[];
}

/**
 * Get comprehensive statistics for a publisher's books
 */
export async function getPublisherStats(publisherId: string): Promise<PublisherStatsData> {
  try {
    // Get all books published by this publisher
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, cover_url, publisher_id')
      .eq('publisher_id', publisherId);

    if (booksError) throw booksError;
    if (!books || books.length === 0) {
      return {
        total_books: 0,
        total_readers: 0,
        total_views: 0,
        average_rating: 0,
        books_ranking: [],
        overall_status_stats: [],
      };
    }

    const bookIds = books.map(b => b.id);

    // Get reviews with ratings for these books
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('book_id, rating')
      .in('book_id', bookIds);

    if (reviewsError) throw reviewsError;

    // Get reading status for these books
    const { data: readingStatus, error: statusError } = await supabase
      .from('user_books')
      .select('book_id, status, user_id')
      .in('book_id', bookIds);

    if (statusError) throw statusError;

    // Calculate stats per book
    const booksRanking: BookStats[] = books.map(book => {
      const bookReviews = reviews?.filter(r => r.book_id === book.id) || [];
      const bookReadingStatus = readingStatus?.filter(s => s.book_id === book.id) || [];
      
      const totalReviews = bookReviews.length;
      const averageRating = totalReviews > 0
        ? bookReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        : 0;
      
      // Map Portuguese status to counts
      const statusToRead = bookReadingStatus.filter(s => s.status === 'para ler').length;
      const statusReading = bookReadingStatus.filter(s => s.status === 'lendo').length;
      const statusRead = bookReadingStatus.filter(s => s.status === 'lido').length;
      
      const totalReaders = bookReadingStatus.length;

      return {
        book_id: book.id,
        book_title: book.title,
        book_cover_url: book.cover_url,
        average_rating: averageRating,
        total_reviews: totalReviews,
        total_readers: totalReaders,
        status_to_read: statusToRead,
        status_reading: statusReading,
        status_read: statusRead,
      };
    });

    // Sort by average rating (descending)
    booksRanking.sort((a, b) => {
      // If ratings are equal, sort by number of reviews
      if (b.average_rating === a.average_rating) {
        return b.total_reviews - a.total_reviews;
      }
      return b.average_rating - a.average_rating;
    });

    // Calculate overall stats
    const totalReaders = new Set(readingStatus?.map(s => s.user_id) || []).size;
    const allRatings = reviews?.map(r => r.rating || 0) || [];
    const overallAverageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    // Calculate total views (sum of all reading statuses across all books)
    const totalViews = readingStatus?.length || 0;

    // Calculate overall status stats
    const overallStatusStats: ReadingStatusStats[] = [
      {
        status: 'to_read',
        count: readingStatus?.filter(s => s.status === 'para ler').length || 0,
      },
      {
        status: 'reading',
        count: readingStatus?.filter(s => s.status === 'lendo').length || 0,
      },
      {
        status: 'read',
        count: readingStatus?.filter(s => s.status === 'lido').length || 0,
      },
    ];

    return {
      total_books: books.length,
      total_readers: totalReaders,
      total_views: totalViews,
      average_rating: overallAverageRating,
      books_ranking: booksRanking,
      overall_status_stats: overallStatusStats,
    };
  } catch (error) {
    console.error('[PublisherStats] Error getting publisher stats:', error);
    throw error;
  }
}

/**
 * Get reading status statistics for a specific book
 */
export async function getBookStatusStats(bookId: string): Promise<ReadingStatusStats[]> {
  try {
    const { data, error } = await supabase
      .from('user_books')
      .select('status')
      .eq('book_id', bookId);

    if (error) throw error;

    const stats: ReadingStatusStats[] = [
      {
        status: 'to_read',
        count: data?.filter(s => s.status === 'para ler').length || 0,
      },
      {
        status: 'reading',
        count: data?.filter(s => s.status === 'lendo').length || 0,
      },
      {
        status: 'read',
        count: data?.filter(s => s.status === 'lido').length || 0,
      },
    ];

    return stats;
  } catch (error) {
    console.error('[PublisherStats] Error getting book status stats:', error);
    throw error;
  }
}