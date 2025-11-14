import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card, CardContent } from './ui/card';
import { useState, useEffect } from 'react';
import * as booksService from '../services/books';

interface BookListProps {
  onBookSelect: (book: booksService.Book) => void;
}

export function BookList({ onBookSelect }: BookListProps) {
  const [books, setBooks] = useState<booksService.Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await booksService.getBooks();
      // Filter only books added by publishers or admins (must have publisher_id)
      const publisherBooks = data.filter(book => book.publisher_id !== null);
      setBooks(publisherBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-4">
        <h2 className="text-gray-900 mb-4">Livros em Destaque</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando livros...</p>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="px-4 py-4">
        <h2 className="text-gray-900 mb-4">Livros em Destaque</h2>
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum livro disponível no momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-gray-900 mb-4">Livros em Destaque</h2>
      <div className="grid grid-cols-3 gap-3">
        {books.map((book) => (
          <Card
            key={book.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onBookSelect(book)}
          >
            <CardContent className="p-2">
              <div className="aspect-[2/3] mb-2 rounded overflow-hidden">
                <ImageWithFallback
                  src={book.cover_url || ''}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-1">{book.author}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}