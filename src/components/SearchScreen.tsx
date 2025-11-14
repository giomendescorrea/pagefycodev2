import { useState, useEffect } from 'react';
import { Search, X, Filter, UserPlus, UserCheck } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { User } from '../App';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import * as booksService from '../services/books';
import * as usersService from '../services/users';

interface SearchScreenProps {
  currentUser: User;
  onBookSelect: (book: booksService.Book) => void;
  onFollow: (userId: string, userName: string) => void;
  isFollowing: (userId: string) => boolean;
  onUserSelect?: (userId: string) => void;
}

export function SearchScreen({ currentUser, onBookSelect, onFollow, isFollowing, onUserSelect }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [filteredBooks, setFilteredBooks] = useState<booksService.Book[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<usersService.UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setFilteredBooks([]);
      setFilteredUsers([]);
      return;
    }

    setLoading(true);
    try {
      // Search books from Supabase
      let books = await booksService.searchBooks(query);

      // Apply genre filter
      if (selectedGenre !== 'all') {
        books = books.filter(book => book.genre === selectedGenre);
      }

      // Apply period filter
      if (selectedPeriod !== 'all') {
        books = books.filter(book => {
          const year = book.publication_year || 0;
          switch (selectedPeriod) {
            case '1800s':
              return year >= 1800 && year < 1900;
            case '1900-1950':
              return year >= 1900 && year <= 1950;
            case '1950-2000':
              return year >= 1950 && year <= 2000;
            case '2000+':
              return year >= 2000;
            default:
              return true;
          }
        });
      }

      setFilteredBooks(books);
      console.log('Books found:', books.length);

      // Search users from Supabase
      const users = await usersService.searchUsers(query);
      console.log('Users found before filter:', users.length);
      
      // Filter out current user
      const filteredUsersList = users.filter(u => u.id !== currentUser.id);
      console.log('Users found after filter:', filteredUsersList.length);
      
      setFilteredUsers(filteredUsersList);
    } catch (error) {
      console.error('Error searching:', error);
      // Set empty arrays on error to avoid showing stale data
      setFilteredBooks([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredBooks([]);
    setFilteredUsers([]);
    setSelectedGenre('all');
    setSelectedPeriod('all');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar livros ou pessoas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        {activeTab === 'books' && (
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedGenre} onValueChange={(value) => {
              setSelectedGenre(value);
              handleSearch(searchQuery);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os gêneros</SelectItem>
                <SelectItem value="Ficção Científica">Ficção Científica</SelectItem>
                <SelectItem value="Ficção Distópica">Ficção Distópica</SelectItem>
                <SelectItem value="Fantasia">Fantasia</SelectItem>
                <SelectItem value="Fantasia Épica">Fantasia Épica</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Realismo Mágico">Realismo Mágico</SelectItem>
                <SelectItem value="Fábula">Fábula</SelectItem>
                <SelectItem value="Sátira Política">Sátira Política</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={(value) => {
              setSelectedPeriod(value);
              handleSearch(searchQuery);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="1800s">1800-1900</SelectItem>
                <SelectItem value="1900-1950">1900-1950</SelectItem>
                <SelectItem value="1950-2000">1950-2000</SelectItem>
                <SelectItem value="2000+">2000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {searchQuery === '' ? (
          <div className="text-center text-gray-500 py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Digite para buscar livros ou pessoas</p>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a] mx-auto mb-4"></div>
            <p>Buscando...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'books' | 'users')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="books">
                Livros ({filteredBooks.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Pessoas ({filteredUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="books" className="space-y-3">
              {filteredBooks.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>Nenhum livro encontrado</p>
                </div>
              ) : (
                filteredBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onBookSelect(book)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                          <ImageWithFallback
                            src={book.cover_url || ''}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 mb-1">{book.title}</h3>
                          <p className="text-gray-600 mb-2">{book.author}</p>
                          <div className="flex flex-wrap gap-2">
                            {book.genre && (
                              <Badge className="bg-[#eff6ff] text-[#1e293b] border-0">
                                {book.genre}
                              </Badge>
                            )}
                            {book.publication_year && (
                              <Badge className="bg-gray-100 text-gray-700 border-0">
                                {book.publication_year}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card 
                    key={user.id}
                    className={onUserSelect && !user.is_private ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          className="h-12 w-12 cursor-pointer"
                          onClick={() => onUserSelect && onUserSelect(user.id)}
                        >
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 
                              className={`text-gray-900 ${onUserSelect && !user.is_private ? 'cursor-pointer hover:underline' : ''}`}
                              onClick={() => onUserSelect && !user.is_private && onUserSelect(user.id)}
                            >
                              {user.name}
                            </h3>
                            {user.role === 'publisher' && (
                              <Badge className="bg-purple-100 text-purple-700 border-0">
                                Publicador
                              </Badge>
                            )}
                            {user.role === 'admin' && (
                              <Badge className="bg-red-100 text-red-700 border-0">
                                Admin
                              </Badge>
                            )}
                          </div>
                          {user.bio && <p className="text-gray-600 text-sm line-clamp-1">{user.bio}</p>}
                          {user.is_private && (
                            <p className="text-gray-500 text-xs">Perfil privado</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isFollowing(user.id) ? 'outline' : 'default'}
                          onClick={() => onFollow(user.id, user.name)}
                        >
                          {isFollowing(user.id) ? (
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}