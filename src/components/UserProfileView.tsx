import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User, UserPlus, UserCheck, Star, Lock } from 'lucide-react';
import * as usersService from '../services/users';
import * as postsService from '../services/posts';
import * as booksService from '../services/books';

interface UserProfileViewProps {
  userId: string;
  currentUserId: string;
  onFollow: (userId: string, userName: string) => void;
  isFollowing: (userId: string) => boolean;
  onBookSelect: (book: booksService.Book) => void;
}

export function UserProfileView({ userId, currentUserId, onFollow, isFollowing, onBookSelect }: UserProfileViewProps) {
  const [profile, setProfile] = useState<usersService.UserProfile | null>(null);
  const [stats, setStats] = useState<usersService.UserStats | null>(null);
  const [posts, setPosts] = useState<postsService.Post[]>([]);
  const [userBooks, setUserBooks] = useState<Array<{ book: booksService.Book; status: string; date_added: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      console.log('[UserProfileView] Loading profile for user:', userId);
      
      // Try to get user directly first
      const allUsers = await usersService.getAllUsers();
      const foundUser = allUsers.find(u => u.id === userId);
      
      console.log('[UserProfileView] Found user:', foundUser);
      setProfile(foundUser || null);

      // Load stats and posts
      const userStats = await usersService.getUserStats(userId);
      const userPosts = await postsService.getUserPosts(userId);
      
      console.log('[UserProfileView] User stats:', userStats);
      console.log('[UserProfileView] User posts:', userPosts.length);

      setStats(userStats);
      setPosts(userPosts);

      // Load user books
      const books = await booksService.getUserBooks(userId);
      console.log('[UserProfileView] User books:', books.length);
      setUserBooks(books);
    } catch (error) {
      console.error('[UserProfileView] Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Usuário não encontrado</p>
        </div>
      </div>
    );
  }

  const isPrivate = profile.is_private && !isFollowing(userId) && userId !== currentUserId;

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-gray-900">{profile.name}</h1>
              {profile.role === 'publisher' && (
                <Badge className="bg-purple-100 text-purple-700 border-0">
                  Publicador
                </Badge>
              )}
              {profile.role === 'admin' && (
                <Badge className="bg-red-100 text-red-700 border-0">
                  Admin
                </Badge>
              )}
            </div>
            {profile.bio && <p className="text-gray-600 text-sm mb-3">{profile.bio}</p>}
            {profile.is_private && (
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                <Lock className="h-3 w-3" />
                <span>Perfil privado</span>
              </div>
            )}
            {userId !== currentUserId && (
              <Button
                size="sm"
                variant={isFollowing(userId) ? 'outline' : 'default'}
                onClick={() => onFollow(userId, profile.name)}
              >
                {isFollowing(userId) ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Seguir
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-xl text-gray-900">{stats?.total_reviews || 0}</p>
            <p className="text-gray-600 text-sm">Resenhas</p>
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-900">{stats?.total_notes || 0}</p>
            <p className="text-gray-600 text-sm">Notas</p>
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-900">{stats?.followers_count || 0}</p>
            <p className="text-gray-600 text-sm">Seguidores</p>
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-900">{stats?.following_count || 0}</p>
            <p className="text-gray-600 text-sm">Seguindo</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isPrivate ? (
        <div className="px-4 py-12 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-gray-900 mb-2">Perfil Privado</h3>
          <p className="text-gray-600">
            Este usuário tem um perfil privado. Siga para ver suas publicações.
          </p>
        </div>
      ) : (
        <div className="px-4 py-4">
          <Tabs defaultValue="posts">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="posts">Publicações</TabsTrigger>
              <TabsTrigger value="books">Livros ({userBooks.length})</TabsTrigger>
              <TabsTrigger value="reviews">Resenhas</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-3">
              {posts.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>Nenhuma publicação ainda</p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-3">
                      {/* Book info */}
                      {post.book && (
                        <div 
                          className="flex gap-3 mb-3 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
                          onClick={async () => {
                            try {
                              const book = await booksService.getBook(post.book_id);
                              if (book) {
                                onBookSelect(book);
                              }
                            } catch (error) {
                              console.error('Error loading book:', error);
                            }
                          }}
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
                      <div className="mb-2">
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

                      <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="books" className="space-y-3">
              {userBooks.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>Nenhum livro na estante ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {userBooks.map((item) => (
                    <div 
                      key={item.book.id}
                      className="cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => onBookSelect(item.book)}
                    >
                      <div className="aspect-[2/3] rounded overflow-hidden shadow-md mb-2">
                        <ImageWithFallback
                          src={item.book.cover_url || ''}
                          alt={item.book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-sm text-gray-900 line-clamp-2 mb-1">{item.book.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1">{item.book.author}</p>
                      <Badge className="mt-1 text-xs">
                        {item.status === 'lido' && 'Lido'}
                        {item.status === 'lendo' && 'Lendo'}
                        {item.status === 'para ler' && 'Para Ler'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-3">
              {posts.filter(p => p.type === 'review').length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Nenhuma resenha ainda</p>
                </div>
              ) : (
                posts.filter(p => p.type === 'review').map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-3">
                      {post.book && (
                        <div 
                          className="flex gap-3 mb-3 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2"
                          onClick={async () => {
                            try {
                              const book = await booksService.getBook(post.book_id);
                              if (book) {
                                onBookSelect(book);
                              }
                            } catch (error) {
                              console.error('Error loading book:', error);
                            }
                          }}
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

                      {post.rating && (
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
                      <p className="text-gray-700 mb-2">{post.content}</p>
                      <p className="text-gray-500 text-xs">{formatDate(post.created_at)}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}