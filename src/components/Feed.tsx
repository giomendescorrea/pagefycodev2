import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Heart, MessageCircle, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as postsService from '../services/posts';

interface FeedProps {
  posts: postsService.Post[];
  onLike: (postId: string, authorId: string, authorName: string) => void;
  onUserClick: (userId: string) => void;
  onBookClick: (bookId: string) => void;
}

export function Feed({ posts, onLike, onUserClick, onBookClick }: FeedProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (posts.length === 0) {
    return (
      <div className="px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-gray-900 mb-2">Seu feed está vazio</h3>
            <p className="text-gray-600 text-sm">
              Siga outros usuários para ver suas resenhas e citações aqui! Ou crie suas próprias publicações adicionando resenhas e citações aos livros.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-gray-900">Feed de Atividades</h2>
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer" 
                onClick={() => onUserClick(post.user_id)}
              >
                <AvatarFallback>{getInitials(post.profile?.name || 'U')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p 
                  className="text-gray-900 cursor-pointer hover:underline" 
                  onClick={() => onUserClick(post.user_id)}
                >
                  {post.profile?.name || 'Usuário'}
                </p>
                <p className="text-gray-600 text-sm">{formatDate(post.created_at)}</p>
              </div>
            </div>

            {/* Book info */}
            {post.book && (
              <div 
                className="flex gap-3 mb-3 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
                onClick={() => onBookClick(post.book_id)}
              >
                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                  <ImageWithFallback
                    src={post.book.cover_url || ''}
                    alt={post.book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-900 line-clamp-1">{post.book.title}</h4>
                  <p className="text-gray-600 text-sm">{post.book.author}</p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="mb-3">
              {post.type === 'review' && post.rating && (
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= post.rating!
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
              {post.type === 'quote' ? (
                <blockquote className="border-l-4 border-blue-500 pl-3 italic text-gray-700">
                  {post.content}
                </blockquote>
              ) : (
                <p className="text-gray-700">{post.content}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}