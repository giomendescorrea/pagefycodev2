import { useState, useEffect } from 'react';
import * as booksService from '../services/books';

export function useBooks() {
  const [books, setBooks] = useState<booksService.Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await booksService.getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Erro ao carregar livros');
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await booksService.searchBooks(query);
      setBooks(data);
    } catch (err) {
      console.error('Error searching books:', err);
      setError('Erro ao buscar livros');
    } finally {
      setLoading(false);
    }
  };

  const getBook = async (bookId: string) => {
    try {
      return await booksService.getBook(bookId);
    } catch (err) {
      console.error('Error getting book:', err);
      throw err;
    }
  };

  const createBook = async (book: Partial<booksService.Book>) => {
    try {
      const newBook = await booksService.createBook(book);
      if (newBook) {
        setBooks([newBook, ...books]);
      }
      return newBook;
    } catch (err) {
      console.error('Error creating book:', err);
      throw err;
    }
  };

  const updateBook = async (bookId: string, updates: Partial<booksService.Book>) => {
    try {
      const updatedBook = await booksService.updateBook(bookId, updates);
      if (updatedBook) {
        setBooks(books.map(b => b.id === bookId ? updatedBook : b));
      }
      return updatedBook;
    } catch (err) {
      console.error('Error updating book:', err);
      throw err;
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      await booksService.deleteBook(bookId);
      setBooks(books.filter(b => b.id !== bookId));
    } catch (err) {
      console.error('Error deleting book:', err);
      throw err;
    }
  };

  return {
    books,
    loading,
    error,
    loadBooks,
    searchBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
  };
}

export function useUserBooks(userId: string | undefined) {
  const [userBooks, setUserBooks] = useState<{ book: booksService.Book; status: string; date_added: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserBooks();
    }
  }, [userId]);

  const loadUserBooks = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await booksService.getUserBooks(userId);
      setUserBooks(data);
    } catch (err) {
      console.error('Error loading user books:', err);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookId: string, status: string) => {
    if (!userId) return;
    try {
      await booksService.addUserBook(userId, bookId, status);
      await loadUserBooks();
    } catch (err) {
      console.error('Error adding book:', err);
      throw err;
    }
  };

  const removeBook = async (bookId: string) => {
    if (!userId) return;
    try {
      await booksService.removeUserBook(userId, bookId);
      setUserBooks(userBooks.filter(ub => ub.book.id !== bookId));
    } catch (err) {
      console.error('Error removing book:', err);
      throw err;
    }
  };

  return {
    userBooks,
    loading,
    loadUserBooks,
    addBook,
    removeBook,
  };
}
