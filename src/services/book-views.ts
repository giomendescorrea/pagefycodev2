import Dexie from 'dexie';

export interface BookView {
  id?: number;
  book_id: string;
  user_id: string;
  viewed_at: string;
}

class BookViewsDB extends Dexie {
  bookViews!: Dexie.Table<BookView, number>;

  constructor() {
    super('BookViewsDB');
    this.version(1).stores({
      bookViews: '++id, book_id, user_id, [book_id+user_id]'
    });
  }
}

const db = new BookViewsDB();

export async function recordView(bookId: string, userId: string): Promise<void> {
  try {
    // Check if user already viewed this book
    const existingView = await db.bookViews
      .where(['book_id', 'user_id'])
      .equals([bookId, userId])
      .first();

    // Only record if user hasn't viewed before
    if (!existingView) {
      await db.bookViews.add({
        book_id: bookId,
        user_id: userId,
        viewed_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error recording book view:', error);
  }
}

export async function getBookViewCount(bookId: string): Promise<number> {
  try {
    return await db.bookViews
      .where('book_id')
      .equals(bookId)
      .count();
  } catch (error) {
    console.error('Error getting book view count:', error);
    return 0;
  }
}

export async function hasUserViewedBook(bookId: string, userId: string): Promise<boolean> {
  try {
    const view = await db.bookViews
      .where(['book_id', 'user_id'])
      .equals([bookId, userId])
      .first();
    return !!view;
  } catch (error) {
    console.error('Error checking user view:', error);
    return false;
  }
}

export async function getTotalViewsForPublisher(publisherId: string, bookIds: string[]): Promise<number> {
  try {
    if (bookIds.length === 0) return 0;
    
    const views = await db.bookViews
      .where('book_id')
      .anyOf(bookIds)
      .toArray();
    
    return views.length;
  } catch (error) {
    console.error('Error getting total views for publisher:', error);
    return 0;
  }
}

export async function getViewsForBooks(bookIds: string[]): Promise<Map<string, number>> {
  try {
    const viewsMap = new Map<string, number>();
    
    if (bookIds.length === 0) return viewsMap;
    
    const views = await db.bookViews
      .where('book_id')
      .anyOf(bookIds)
      .toArray();
    
    // Count views per book
    views.forEach(view => {
      const count = viewsMap.get(view.book_id) || 0;
      viewsMap.set(view.book_id, count + 1);
    });
    
    return viewsMap;
  } catch (error) {
    console.error('Error getting views for books:', error);
    return new Map();
  }
}
