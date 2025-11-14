import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  BookPlus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Save,
  X,
  Upload,
  Star,
  TrendingUp,
  Eye,
  MessageCircle,
  Quote as QuoteIcon,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import { User } from '../App';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import * as booksService from '../services/books';
import * as reviewsService from '../services/reviews';
import * as quotesService from '../services/quotes';
import * as commentsService from '../services/comments';
import * as bookViewsService from '../services/book-views';
import { PublisherReadingStats } from './PublisherReadingStats';

interface PublisherPanelProps {
  currentUser: User;
  onAddBook?: (book: booksService.Book) => void;
}

export function PublisherPanel({ currentUser, onAddBook }: PublisherPanelProps) {
  const [books, setBooks] = useState<booksService.Book[]>([]);
  const [stats, setStats] = useState<booksService.PublisherStats>({
    totalBooks: 0,
    publishedBooks: 0,
    draftBooks: 0,
    totalViews: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<booksService.Book | null>(null);
  const [bookDetails, setBookDetails] = useState<{
    reviews: any[];
    quotes: any[];
    comments: any[];
  }>({ reviews: [], quotes: [], comments: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'books' | 'stats'>('books');

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('2024');
  const [coverUrl, setCoverUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load publisher books and stats
  useEffect(() => {
    loadPublisherData();
  }, [currentUser.id]);

  // Load book details when a book is selected
  useEffect(() => {
    if (selectedBook) {
      loadBookDetails(selectedBook.id);
    }
  }, [selectedBook]);

  const loadPublisherData = async () => {
    try {
      setLoading(true);
      const [publisherBooks, publisherStats] = await Promise.all([
        booksService.getPublisherBooks(currentUser.id),
        booksService.getPublisherStats(currentUser.id),
      ]);
      setBooks(publisherBooks);
      setStats(publisherStats);
    } catch (error) {
      console.error('Error loading publisher data:', error);
      toast.error('Erro ao carregar dados do publicador');
    } finally {
      setLoading(false);
    }
  };

  const loadBookDetails = async (bookId: string) => {
    try {
      setLoadingDetails(true);
      const [reviews, quotes] = await Promise.all([
        reviewsService.getReviews(bookId),
        quotesService.getAllBookQuotes(bookId),
      ]);

      // Get comments for all reviews
      const allComments = [];
      for (const review of reviews) {
        const reviewComments = await commentsService.getComments(review.id);
        allComments.push(...reviewComments.map(c => ({ ...c, reviewId: review.id })));
      }

      setBookDetails({
        reviews,
        quotes,
        comments: allComments,
      });
    } catch (error) {
      console.error('Error loading book details:', error);
      toast.error('Erro ao carregar detalhes do livro');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddBook = async () => {
    if (!title || !author || !description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSubmitting(true);
      
      // Check for duplicates
      const duplicateCheck = await booksService.checkBookDuplicates(title, author);
      if (duplicateCheck.exists) {
        toast.error(duplicateCheck.message || 'Livro já cadastrado');
        setSubmitting(false);
        return;
      }

      const newBook = await booksService.createBook({
        title,
        author,
        description,
        cover_url: coverUrl || 'https://images.unsplash.com/photo-1679180174039-c84e26f1a78d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBjbGFzc2ljfGVufDF8fHx8MTc1OTk2OTUwN3ww&ixlib=rb-4.1.0&q=80&w=1080',
        genre,
        publication_year: parseInt(year),
        publisher_id: currentUser.id,
        status: 'draft',
      });

      if (newBook) {
        toast.success('Livro adicionado com sucesso!');
        handleClearForm();
        setIsAddingBook(false);
        await loadPublisherData();
        if (onAddBook) {
          onAddBook(newBook);
        }
      }
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast.error(error.message || 'Erro ao adicionar livro. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishBook = async (bookId: string) => {
    try {
      await booksService.updateBook(bookId, { status: 'published' });
      toast.success('Livro publicado com sucesso!');
      await loadPublisherData();
    } catch (error) {
      console.error('Error publishing book:', error);
      toast.error('Erro ao publicar livro');
    }
  };

  const handleUnpublishBook = async (bookId: string) => {
    try {
      await booksService.updateBook(bookId, { status: 'draft' });
      toast.info('Livro despublicado');
      await loadPublisherData();
    } catch (error) {
      console.error('Error unpublishing book:', error);
      toast.error('Erro ao despublicar livro');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Tem certeza que deseja remover este livro? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await booksService.deleteBook(bookId);
      toast.success('Livro removido');
      await loadPublisherData();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Erro ao remover livro');
    }
  };

  const handleClearForm = () => {
    setTitle('');
    setAuthor('');
    setDescription('');
    setGenre('');
    setYear('2024');
    setCoverUrl('');
  };

  const handleBookClick = (book: booksService.Book) => {
    setSelectedBook(book);
  };

  const handleBackToList = () => {
    setSelectedBook(null);
    setBookDetails({ reviews: [], quotes: [], comments: [] });
  };

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Book detail view
  if (selectedBook) {
    const avgRating = bookDetails.reviews.length > 0
      ? bookDetails.reviews.reduce((sum, r) => sum + r.rating, 0) / bookDetails.reviews.length
      : 0;

    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-6 text-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="text-white hover:bg-purple-800 mb-3"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar aos Livros
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <div>
              <h1>Detalhes do Livro</h1>
              <p className="text-purple-100">{selectedBook.title}</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Book Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-36 flex-shrink-0 rounded overflow-hidden">
                  <ImageWithFallback
                    src={selectedBook.cover_url || ''}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900 mb-1">{selectedBook.title}</h2>
                  <p className="text-gray-600 mb-3">{selectedBook.author}</p>
                  <div className="flex gap-2 mb-2">
                    <Badge className="bg-purple-100 text-purple-700 border-0">
                      {selectedBook.genre || 'Sem gênero'}
                    </Badge>
                    <Badge className={
                      selectedBook.status === 'published'
                        ? 'bg-green-100 text-green-700 border-0'
                        : 'bg-gray-100 text-gray-700 border-0'
                    }>
                      {selectedBook.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedBook.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <MessageCircle className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xl text-gray-900">{bookDetails.reviews.length}</p>
                <p className="text-gray-600">Resenhas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <QuoteIcon className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-xl text-gray-900">{bookDetails.quotes.length}</p>
                <p className="text-gray-600">Citações</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <MessageCircle className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-xl text-gray-900">{bookDetails.comments.length}</p>
                <p className="text-gray-600">Comentários</p>
              </CardContent>
            </Card>
          </div>

          {loadingDetails ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando detalhes...</p>
            </div>
          ) : (
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reviews">Resenhas</TabsTrigger>
                <TabsTrigger value="quotes">Citações</TabsTrigger>
                <TabsTrigger value="comments">Comentários</TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="space-y-3 mt-4">
                {bookDetails.reviews.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma resenha ainda</p>
                  </div>
                ) : (
                  bookDetails.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {review.profile?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-gray-900">{review.profile?.name || 'Usuário'}</p>
                            <div className="flex gap-1 my-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.text}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(review.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="quotes" className="space-y-3 mt-4">
                {bookDetails.quotes.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <QuoteIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma citação ainda</p>
                  </div>
                ) : (
                  bookDetails.quotes.map((quote) => (
                    <Card key={quote.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {quote.profile?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-gray-900 mb-1">{quote.profile?.name || 'Usuário'}</p>
                            <div className="bg-gray-50 border-l-4 border-purple-600 p-3 rounded">
                              <p className="text-gray-700 italic">"{quote.text}"</p>
                              {(quote.page || quote.percentage) && (
                                <p className="text-gray-500 text-xs mt-2">
                                  {quote.page && `Página ${quote.page}`}
                                  {quote.page && quote.percentage && ' • '}
                                  {quote.percentage && `${quote.percentage}%`}
                                </p>
                              )}
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-3 mt-4">
                {bookDetails.comments.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum comentário ainda</p>
                  </div>
                ) : (
                  bookDetails.comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.profile?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-gray-900">{comment.profile?.name || 'Usuário'}</p>
                            <p className="text-gray-700">{comment.text}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
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

  // Main publisher panel view
  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8" />
          <div>
            <h1>Painel do Publicador</h1>
            <p className="text-purple-100">Gerencie seus livros e publicações</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Main Tabs - Livros and Estatísticas */}
        <Tabs value={activeMainTab} onValueChange={(value) => setActiveMainTab(value as 'books' | 'stats')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="books">
              <BookOpen className="h-4 w-4 mr-2" />
              Meus Livros
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4 mt-4">
            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xl text-gray-900">{stats.totalBooks}</p>
                  <p className="text-gray-600">Livros</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-[#348e91]" />
                  <p className="text-xl text-gray-900">{stats.totalViews}</p>
                  <p className="text-gray-600">Visualiz.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-xl text-gray-900">{stats.averageRating}</p>
                  <p className="text-gray-600">Média</p>
                </CardContent>
              </Card>
            </div>

            {/* Add Book Button */}
            <Button 
              className="w-full" 
              onClick={() => setIsAddingBook(true)}
            >
              <BookPlus className="h-5 w-5 mr-2" />
              Adicionar Novo Livro
            </Button>

            {/* Add/Edit Book Dialog */}
            <Dialog open={isAddingBook} onOpenChange={setIsAddingBook}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Livro</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do livro para publicá-lo
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nome do livro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Autor *</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Nome do autor"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Sinopse do livro"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="genre">Gênero</Label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger id="genre">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ficção">Ficção</SelectItem>
                          <SelectItem value="Romance">Romance</SelectItem>
                          <SelectItem value="Suspense">Suspense</SelectItem>
                          <SelectItem value="Fantasia">Fantasia</SelectItem>
                          <SelectItem value="Aventura">Aventura</SelectItem>
                          <SelectItem value="Biografia">Biografia</SelectItem>
                          <SelectItem value="Ficção Científica">Ficção Científica</SelectItem>
                          <SelectItem value="Ficção Distópica">Ficção Distópica</SelectItem>
                          <SelectItem value="Fantasia Épica">Fantasia Épica</SelectItem>
                          <SelectItem value="Realismo Mágico">Realismo Mágico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover">URL da Capa</Label>
                    <Input
                      id="cover"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddingBook(false);
                    handleClearForm();
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddBook} disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Rascunho
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Books List */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todos ({books.length})</TabsTrigger>
                <TabsTrigger value="published">Publicados ({stats.publishedBooks})</TabsTrigger>
                <TabsTrigger value="draft">Rascunhos ({stats.draftBooks})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {books.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum livro cadastrado</p>
                    <p className="text-sm">Clique em "Adicionar Novo Livro" para começar</p>
                  </div>
                ) : (
                  books.map((book) => (
                    <Card key={book.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBookClick(book)}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                            <ImageWithFallback
                              src={book.cover_url || ''}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-gray-900 line-clamp-1">{book.title}</h3>
                                <p className="text-gray-600">{book.author}</p>
                              </div>
                              <Badge className={
                                book.status === 'published' 
                                  ? 'bg-green-100 text-green-700 border-0' 
                                  : 'bg-gray-100 text-gray-700 border-0'
                              }>
                                {book.status === 'published' ? 'Publicado' : 'Rascunho'}
                              </Badge>
                            </div>

                            {book.status === 'published' && (
                              <div className="flex gap-4 mb-2">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {book.views_count || 0}
                                </span>
                              </div>
                            )}

                            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              {book.status === 'draft' ? (
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishBook(book.id);
                                  }}
                                >
                                  Publicar
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpublishBook(book.id);
                                  }}
                                >
                                  Despublicar
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBook(book.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="published" className="space-y-3 mt-4">
                {books.filter(b => b.status === 'published').length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum livro publicado</p>
                  </div>
                ) : (
                  books.filter(b => b.status === 'published').map((book) => (
                    <Card key={book.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBookClick(book)}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                            <ImageWithFallback
                              src={book.cover_url || ''}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 line-clamp-1">{book.title}</h3>
                            <p className="text-gray-600 mb-2">{book.author}</p>
                            <div className="flex gap-3">
                              <span className="text-gray-600 flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {book.views_count || 0} visualizações
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUnpublishBook(book.id);
                                }}
                              >
                                Despublicar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBook(book.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="draft" className="space-y-3 mt-4">
                {books.filter(b => b.status === 'draft').length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum rascunho</p>
                  </div>
                ) : (
                  books.filter(b => b.status === 'draft').map((book) => (
                    <Card key={book.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBookClick(book)}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden">
                            <ImageWithFallback
                              src={book.cover_url || ''}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 line-clamp-1">{book.title}</h3>
                            <p className="text-gray-600 mb-2">{book.author}</p>
                            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublishBook(book.id);
                                }}
                              >
                                Publicar Agora
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBook(book.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-4">
            <PublisherReadingStats currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}