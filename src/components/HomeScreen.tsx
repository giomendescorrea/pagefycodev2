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
import logoIcon from 'figma:asset/52156acc301f7deb215318a5ad8c77764dbb9d14.png';

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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoIcon} alt="Pagefy" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
            <span className="text-[#1e3a8a] truncate text-sm sm:text-base">Pagefy</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowNotifications}
            className="relative flex-shrink-0"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 bg-red-500 text-white border-0 text-[10px] sm:text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="px-3 sm:px-4 py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-purple-50">
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