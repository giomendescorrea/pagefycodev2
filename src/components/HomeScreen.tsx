import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Heart, MessageCircle, Bell, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../App';
import { BookList } from './BookList';
import { Feed } from './Feed';
import * as booksService from '../services/books';
import * as postsService from '../services/posts';

interface HomeScreenProps {
  currentUser: User;
  onShowNotifications: () => void;
  unreadCount: number;
  onLike: (postId: string, authorId: string, authorName: string) => void;
  onBookSelect: (book: booksService.Book) => void;
  onUserSelect: (userId: string) => void;
  posts: postsService.Post[];
}

export function HomeScreen({ currentUser, onShowNotifications, unreadCount, onLike, onBookSelect, onUserSelect, posts }: HomeScreenProps) {
  return (
    <div className="pb-20">
      {/* Header with Logo and Notification Bell */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[#1e3a8a]">Pagefy</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowNotifications}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="px-4 py-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-gray-900 mb-2">Bem-vindo, {currentUser.name}!</h2>
        <p className="text-gray-600">Explore nossa biblioteca e comece a avaliar seus livros favoritos.</p>
      </div>

      {/* Book List */}
      <BookList onBookSelect={onBookSelect} />

      {/* Feed */}
      <Feed 
        posts={posts}
        onLike={onLike}
        onUserClick={onUserSelect}
        onBookClick={async (bookId) => {
          // Load the book and select it
          try {
            const book = await booksService.getBook(bookId);
            if (book) {
              onBookSelect(book);
            }
          } catch (error) {
            console.error('Error loading book:', error);
          }
        }}
      />
    </div>
  );
}