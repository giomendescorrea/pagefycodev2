import { Card, CardContent } from './ui/card';
import { Star, Edit2, Trash2, BookOpen, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Review, Note, Quote } from '../App';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import * as booksService from '../services/books';
import logoIcon from 'figma:asset/52156acc301f7deb215318a5ad8c77764dbb9d14.png';

interface ShelfScreenProps {
  currentUser: User;
  reviews: Review[];
  notes: Note[];
  quotes: Quote[];
  onBookSelect: (book: booksService.Book) => void;
  onEditReview: (reviewId: string, rating: number, text: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onEditNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditQuote: (quoteId: string, text: string, page?: string, percentage?: string) => void;
  onDeleteQuote: (quoteId: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  'lido': { label: 'Lido', color: 'text-green-700', bgColor: 'bg-green-100' },
  'lendo': { label: 'Lendo', color: 'text-[#1c5052]', bgColor: 'bg-[#e8f5f5]' },
  'quer-ler': { label: 'Quer Ler', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'abandonado': { label: 'Abandonado', color: 'text-gray-700', bgColor: 'bg-gray-100' }
};

function EditReviewDialog({ review, onEdit }: { review: Review; onEdit: (reviewId: string, rating: number, text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.text);

  const handleSubmit = () => {
    onEdit(review.id, rating, text);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Editar Resenha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Avaliação</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Texto da Resenha</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva sua resenha..."
              rows={4}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditNoteDialog({ note, onEdit }: { note: Note; onEdit: (noteId: string, text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(note.text);

  const handleSubmit = () => {
    onEdit(note.id, text);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Editar Comentário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Texto do Comentário</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva seu comentário..."
              rows={4}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditQuoteDialog({ quote, onEdit }: { quote: Quote; onEdit: (quoteId: string, text: string, page?: string, percentage?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(quote.text);
  const [page, setPage] = useState(quote.page || '');
  const [percentage, setPercentage] = useState(quote.percentage || '');

  const handleSubmit = () => {
    onEdit(quote.id, text, page || undefined, percentage || undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Editar Citação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Citação</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite a citação..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Página</Label>
              <Input
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="Ex: 42"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Porcentagem</Label>
              <Input
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="Ex: 35%"
                className="mt-2"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShelfScreen({
  currentUser,
  reviews,
  notes,
  quotes,
  onBookSelect,
  onEditReview,
  onDeleteReview,
  onEditNote,
  onDeleteNote,
  onEditQuote,
  onDeleteQuote
}: ShelfScreenProps) {
  const [activeTab, setActiveTab] = useState<'books' | 'notes' | 'reviews'>('books');
  const [userBooks, setUserBooks] = useState<{ book: booksService.Book; status: string }[]>([]);
  const [booksMap, setBooksMap] = useState<Map<string, booksService.Book>>(new Map());
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Review edit state
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewDialogOpen, setEditReviewDialogOpen] = useState(false);

  // Note edit state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);

  // Quote edit state
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editQuotePage, setEditQuotePage] = useState('');
  const [editQuotePercentage, setEditQuotePercentage] = useState('');
  const [editQuoteDialogOpen, setEditQuoteDialogOpen] = useState(false);

  // Load user books and create a map of book IDs to book objects
  useEffect(() => {
    loadUserBooks();
  }, [currentUser.id, reviews.length, notes.length, quotes.length]);

  const loadUserBooks = async () => {
    try {
      setLoading(true);
      console.log('[ShelfScreen] Loading user books for user:', currentUser.id);
      
      const books = await booksService.getUserBooks(currentUser.id);
      console.log('[ShelfScreen] Loaded user books:', books.length, books);
      setUserBooks(books);

      // Create a map of book IDs to book objects for quick lookup
      const map = new Map<string, booksService.Book>();
      books.forEach(({ book }) => {
        map.set(book.id, book);
      });

      // Also load books for reviews, notes, and quotes
      const reviewBookIds = [...new Set(reviews.map(r => r.bookId))];
      const noteBookIds = [...new Set(notes.map(n => n.bookId))];
      const quoteBookIds = [...new Set(quotes.map(q => q.bookId))];
      
      console.log('[ShelfScreen] Review book IDs:', reviewBookIds);
      console.log('[ShelfScreen] Note book IDs:', noteBookIds);
      console.log('[ShelfScreen] Quote book IDs:', quoteBookIds);
      
      const allBookIds = [...new Set([...reviewBookIds, ...noteBookIds, ...quoteBookIds])];
      
      for (const bookId of allBookIds) {
        if (!map.has(bookId)) {
          try {
            const book = await booksService.getBook(bookId);
            if (book) {
              map.set(bookId, book);
              console.log('[ShelfScreen] Loaded book for reviews/notes/quotes:', book.title);
            }
          } catch (error) {
            console.error(`Error loading book ${bookId}:`, error);
          }
        }
      }

      console.log('[ShelfScreen] Total books in map:', map.size);
      setBooksMap(map);
    } catch (error) {
      console.error('[ShelfScreen] Error loading user books:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookById = (bookId: string): booksService.Book | null => {
    return booksMap.get(bookId) || null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Filter books based on search query and status filter
  const filteredBooks = userBooks.filter(({ book, status }) => {
    // Filter by status
    if (statusFilter !== 'all' && status !== statusFilter) {
      return false;
    }

    // Filter by search query (title or author)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = book.title.toLowerCase().includes(query);
      const matchesAuthor = book.author.toLowerCase().includes(query);
      return matchesTitle || matchesAuthor;
    }

    return true;
  });

  return (
    <div className="pb-20">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'books' | 'notes' | 'reviews')} className="w-full">
        <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10">
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-none border-b">
            <TabsTrigger value="books" className="rounded-none">
              <BookOpen className="h-4 w-4 mr-2" />
              Livros
            </TabsTrigger>
            <TabsTrigger value="notes" className="rounded-none">
              Anotações
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none">
              Resenhas
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 py-4">
          {/* Livros Tab */}
          <TabsContent value="books" className="mt-0 space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              <Input
                placeholder="Buscar por título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'lendo' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('lendo')}
                  className={statusFilter === 'lendo' ? 'bg-[#348e91] hover:bg-[#2c7579]' : ''}
                >
                  Lendo
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'lido' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('lido')}
                  className={statusFilter === 'lido' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Lido
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'quer-ler' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('quer-ler')}
                  className={statusFilter === 'quer-ler' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  Quer Ler
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'abandonado' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('abandonado')}
                  className={statusFilter === 'abandonado' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                >
                  Abandonado
                </Button>
              </div>
              {(searchQuery || statusFilter !== 'all') && (
                <p className="text-sm text-gray-600">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'livro encontrado' : 'livros encontrados'}
                </p>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#348e91] mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando livros...</p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum livro na estante</p>
                <p className="text-sm mt-2">Adicione livros para começar a organizar sua leitura!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredBooks.map(({ book, status }) => {
                  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['lido'];
                  
                  return (
                    <Card
                      key={book.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => onBookSelect(book)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-[2/3] overflow-hidden rounded-t-lg relative">
                          <ImageWithFallback
                            src={book.cover_url || ''}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="text-gray-900 line-clamp-2 mb-1">{book.title}</h3>
                          <p className="text-gray-600 line-clamp-1">{book.author}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Anotações Tab */}
          <TabsContent value="notes" className="mt-0">
            {notes.length === 0 && quotes.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Você ainda não fez nenhuma anotação</p>
                <p className="text-sm mt-2">Adicione comentários e citações nos livros!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Comentários */}
                {notes.map((note) => {
                  const book = getBookById(note.bookId);
                  if (!book) return null;
                  
                  return (
                    <Card key={note.id}>
                      <CardContent className="p-3">
                        <div className="flex gap-3 mb-2">
                          <div 
                            className="w-12 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                            onClick={() => onBookSelect(book)}
                          >
                            <ImageWithFallback
                              src={book.cover_url || ''}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-gray-900 cursor-pointer hover:underline"
                              onClick={() => onBookSelect(book)}
                            >
                              {book.title}
                            </h4>
                            <p className="text-gray-600">{book.author}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{note.text}</p>
                        <div className="flex gap-2 justify-end">
                          <Dialog open={editNoteDialogOpen && editingNote?.id === note.id} onOpenChange={(open) => {
                            setEditNoteDialogOpen(open);
                            if (!open) setEditingNote(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingNote(note);
                                  setEditNoteText(note.text);
                                  setEditNoteDialogOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined}>
                              <DialogHeader>
                                <DialogTitle>Editar Comentário</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Comentário</Label>
                                  <Textarea
                                    value={editNoteText}
                                    onChange={(e) => setEditNoteText(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setEditNoteDialogOpen(false)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={() => {
                                    if (editingNote) {
                                      onEditNote(editingNote.id, editNoteText);
                                      setEditNoteDialogOpen(false);
                                      setEditingNote(null);
                                    }
                                  }}>
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Comentário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteNote(note.id)} className="bg-red-600 hover:bg-red-700">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Citações */}
                {quotes.map((quote) => {
                  const book = getBookById(quote.bookId);
                  if (!book) return null;
                  
                  return (
                    <Card key={quote.id}>
                      <CardContent className="p-3">
                        <div className="flex gap-3 mb-2">
                          <div 
                            className="w-12 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                            onClick={() => onBookSelect(book)}
                          >
                            <ImageWithFallback
                              src={book.cover_url || ''}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-gray-900 cursor-pointer hover:underline"
                              onClick={() => onBookSelect(book)}
                            >
                              {book.title}
                            </h4>
                            <p className="text-gray-600">{book.author}</p>
                          </div>
                        </div>
                        <blockquote className="border-l-4 border-[#348e91] pl-3 italic text-gray-700 mb-2">
                          "{quote.text}"
                        </blockquote>
                        <div className="flex gap-2 text-sm text-gray-500 mb-2">
                          {quote.page && <span>Página {quote.page}</span>}
                          {quote.percentage && <span>{quote.percentage}%</span>}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Dialog open={editQuoteDialogOpen && editingQuote?.id === quote.id} onOpenChange={(open) => {
                            setEditQuoteDialogOpen(open);
                            if (!open) setEditingQuote(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingQuote(quote);
                                  setEditQuoteText(quote.text);
                                  setEditQuotePage(quote.page || '');
                                  setEditQuotePercentage(quote.percentage || '');
                                  setEditQuoteDialogOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby={undefined}>
                              <DialogHeader>
                                <DialogTitle>Editar Citação</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Citação</Label>
                                  <Textarea
                                    value={editQuoteText}
                                    onChange={(e) => setEditQuoteText(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Página</Label>
                                    <Input
                                      value={editQuotePage}
                                      onChange={(e) => setEditQuotePage(e.target.value)}
                                      placeholder="ex: 42"
                                    />
                                  </div>
                                  <div>
                                    <Label>Porcentagem</Label>
                                    <Input
                                      value={editQuotePercentage}
                                      onChange={(e) => setEditQuotePercentage(e.target.value)}
                                      placeholder="ex: 25"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setEditQuoteDialogOpen(false)}>
                                    Cancelar
                                  </Button>
                                  <Button onClick={() => {
                                    if (editingQuote) {
                                      onEditQuote(editingQuote.id, editQuoteText, editQuotePage, editQuotePercentage);
                                      setEditQuoteDialogOpen(false);
                                      setEditingQuote(null);
                                    }
                                  }}>
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Citação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta citação? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteQuote(quote.id)} className="bg-red-600 hover:bg-red-700">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Resenhas Tab */}
          <TabsContent value="reviews" className="mt-0 space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Nenhuma resenha ainda</p>
                <p className="text-sm mt-2">Adicione resenhas nos livros que você leu!</p>
              </div>
            ) : (
              reviews.map((review) => {
                const book = getBookById(review.bookId);
                if (!book) return null;
                
                return (
                  <Card key={review.id}>
                    <CardContent className="p-3">
                      <div className="flex gap-3 mb-2">
                        <div 
                          className="w-12 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                          onClick={() => onBookSelect(book)}
                        >
                          <ImageWithFallback
                            src={book.cover_url || ''}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="text-gray-900 cursor-pointer hover:underline"
                            onClick={() => onBookSelect(book)}
                          >
                            {book.title}
                          </h4>
                          <p className="text-gray-600">{book.author}</p>
                          <div className="flex items-center gap-1 mt-1">
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
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.text}</p>
                      <div className="flex gap-2 justify-end">
                        <Dialog open={editReviewDialogOpen && editingReview?.id === review.id} onOpenChange={(open) => {
                          setEditReviewDialogOpen(open);
                          if (!open) setEditingReview(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingReview(review);
                                setEditReviewRating(review.rating);
                                setEditReviewText(review.text);
                                setEditReviewDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent aria-describedby={undefined}>
                            <DialogHeader>
                              <DialogTitle>Editar Resenha</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Avaliação</Label>
                                <div className="flex gap-2 mt-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditReviewRating(star)}
                                    >
                                      <Star
                                        className={`h-8 w-8 cursor-pointer transition-colors ${
                                          star <= editReviewRating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label>Resenha</Label>
                                <Textarea
                                  value={editReviewText}
                                  onChange={(e) => setEditReviewText(e.target.value)}
                                  rows={6}
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setEditReviewDialogOpen(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={() => {
                                  if (editingReview) {
                                    onEditReview(editingReview.id, editReviewRating, editReviewText);
                                    setEditReviewDialogOpen(false);
                                    setEditingReview(null);
                                  }
                                }}>
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Resenha</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta resenha? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteReview(review.id)} className="bg-red-600 hover:bg-red-700">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}