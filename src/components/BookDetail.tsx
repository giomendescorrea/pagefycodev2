import { ImageWithFallback } from './figma/ImageWithFallback';
import { Book, Review, Comment, Note, Quote, User } from '../App';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Star, MessageCircle, Edit, FileText, Quote as QuoteIcon, Pencil, Trash2, BookmarkPlus, BookmarkCheck, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as bookViewsService from '../services/book-views';

interface BookDetailProps {
  book: Book;
  reviews: Review[];
  comments: Comment[];
  notes: Note[];
  quotes: Quote[];
  currentUser: User;
  onAddReview: (bookId: string, rating: number, text: string, startDate?: string, endDate?: string) => void;
  onAddComment: (reviewId: string, text: string) => void;
  onAddNote: (bookId: string, text: string) => void;
  onAddQuote: (bookId: string, text: string, page?: string, percentage?: string) => void;
  onEditReview: (reviewId: string, rating: number, text: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onEditNote: (noteId: string, text: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditQuote: (quoteId: string, text: string, page?: string, percentage?: string) => void;
  onDeleteQuote: (quoteId: string) => void;
  onAddToShelf?: (bookId: string, status: string) => void;
  userBookStatus?: string | null;
  statusCounts?: {
    para_ler: number;
    lendo: number;
    lido: number;
    total: number;
  };
}

export function BookDetail({
  book,
  reviews,
  comments,
  notes,
  quotes,
  currentUser,
  onAddReview,
  onAddComment,
  onAddNote,
  onAddQuote,
  onEditReview,
  onDeleteReview,
  onEditNote,
  onDeleteNote,
  onEditQuote,
  onDeleteQuote,
  onAddToShelf,
  userBookStatus,
  statusCounts
}: BookDetailProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [showCommentForm, setShowCommentForm] = useState<Record<string, boolean>>({});
  
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quotePage, setQuotePage] = useState('');
  const [quotePercentage, setQuotePercentage] = useState('');

  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [showShelfDialog, setShowShelfDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(userBookStatus || 'quer-ler');
  const [editQuotePage, setEditQuotePage] = useState('');
  const [editQuotePercentage, setEditQuotePercentage] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if book is marked as "lido"
    if (userBookStatus !== 'lido') {
      alert('Você só pode adicionar uma resenha após marcar o livro como "Lido".');
      return;
    }
    
    if (reviewText.trim()) {
      onAddReview(book.id, rating, reviewText, startDate, endDate);
      setReviewText('');
      setRating(5);
      setStartDate('');
      setEndDate('');
      setShowReviewForm(false);
    }
  };

  const canAddReview = userBookStatus === 'lido';

  const handleSubmitComment = (reviewId: string) => {
    const text = commentTexts[reviewId];
    if (text && text.trim()) {
      onAddComment(reviewId, text);
      setCommentTexts({ ...commentTexts, [reviewId]: '' });
      setShowCommentForm({ ...showCommentForm, [reviewId]: false });
    }
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      onAddNote(book.id, noteText);
      setNoteText('');
      setShowNoteForm(false);
    }
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteText.trim()) {
      onAddQuote(book.id, quoteText, quotePage || undefined, quotePercentage || undefined);
      setQuoteText('');
      setQuotePage('');
      setQuotePercentage('');
      setShowQuoteForm(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditReviewRating(review.rating);
    setEditReviewText(review.text);
  };

  const handleSaveEditReview = () => {
    if (editingReview && editReviewText.trim()) {
      onEditReview(editingReview.id, editReviewRating, editReviewText);
      setEditingReview(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditNoteText(note.text);
  };

  const handleSaveEditNote = () => {
    if (editingNote && editNoteText.trim()) {
      onEditNote(editingNote.id, editNoteText);
      setEditingNote(null);
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setEditQuoteText(quote.text);
    setEditQuotePage(quote.page || '');
    setEditQuotePercentage(quote.percentage || '');
  };

  const handleSaveEditQuote = () => {
    if (editingQuote && editQuoteText.trim()) {
      onEditQuote(editingQuote.id, editQuoteText, editQuotePage || undefined, editQuotePercentage || undefined);
      setEditingQuote(null);
    }
  };

  const toggleCommentForm = (reviewId: string) => {
    setShowCommentForm({
      ...showCommentForm,
      [reviewId]: !showCommentForm[reviewId]
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const recordBookView = async () => {
      await bookViewsService.recordView(book.id, currentUser.id);
    };

    recordBookView();
  }, [book.id, currentUser.id]);

  return (
    <div className="pb-6">
      {/* Book Header */}
      <div className="bg-white">
        <div className="px-4 py-6">
          <div className="flex gap-4 mb-4">
            <div className="w-28 flex-shrink-0">
              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                <ImageWithFallback
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-gray-900 mb-1 line-clamp-2">{book.title}</h1>
              <p className="text-gray-600 mb-3">por {book.author}</p>
              
              {/* Book Stats */}
              {statusCounts && statusCounts.total > 0 && (
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm">
                      {reviews.length > 0 
                        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                        : '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{statusCounts.total}</span>
                  </div>
                </div>
              )}
              
              <p className="text-gray-700 line-clamp-3">{book.description}</p>
            </div>
          </div>
          
          {/* Add to Shelf Button */}
          {onAddToShelf && (
            <div className="mb-3">
              {userBookStatus ? (
                <Dialog open={showShelfDialog} onOpenChange={setShowShelfDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-11">
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Na Estante
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Atualizar Status do Livro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lendo">Lendo</SelectItem>
                            <SelectItem value="lido">Lido</SelectItem>
                            <SelectItem value="quer-ler">Quer Ler</SelectItem>
                            <SelectItem value="abandonado">Abandonado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowShelfDialog(false)}>Cancelar</Button>
                      <Button onClick={() => {
                        onAddToShelf(book.id, selectedStatus);
                        setShowShelfDialog(false);
                      }}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={showShelfDialog} onOpenChange={setShowShelfDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-11">
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Adicionar à Estante
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Adicionar à Estante</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lendo">Lendo</SelectItem>
                            <SelectItem value="lido">Lido</SelectItem>
                            <SelectItem value="quer-ler">Quer Ler</SelectItem>
                            <SelectItem value="abandonado">Abandonado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowShelfDialog(false)}>Cancelar</Button>
                      <Button onClick={() => {
                        onAddToShelf(book.id, selectedStatus);
                        setShowShelfDialog(false);
                      }}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Button 
              onClick={() => {
                if (!canAddReview) {
                  alert('Você só pode adicionar uma resenha após marcar o livro como "Lido".');
                  return;
                }
                // Set default dates to today
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
                setShowReviewForm(true);
              }} 
              className="h-11"
              disabled={showReviewForm || !canAddReview}
              variant="default"
            >
              <Star className="h-4 w-4 mr-1" />
              Resenha
            </Button>
            <Button 
              onClick={() => setShowNoteForm(true)} 
              className="h-11"
              disabled={showNoteForm}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-1" />
              Nota
            </Button>
            <Button 
              onClick={() => setShowQuoteForm(true)} 
              className="h-11"
              disabled={showQuoteForm}
              variant="outline"
            >
              <QuoteIcon className="h-4 w-4 mr-1" />
              Citação
            </Button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border-t border-gray-200 px-4 py-6">
          <h3 className="text-gray-900 mb-4">Nova Resenha</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-2">
              <Label>Avaliação</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none active:scale-90 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Sua Resenha</Label>
              <Textarea
                id="review"
                placeholder="Compartilhe suas impressões..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Publicar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReviewForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Note Form */}
      {showNoteForm && (
        <div className="bg-white border-t border-gray-200 px-4 py-6">
          <h3 className="text-gray-900 mb-4">Novo Comentário</h3>
          <form onSubmit={handleSubmitNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Seu Comentário</Label>
              <Textarea
                id="note"
                placeholder="Adicione seus pensamentos sobre o livro..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Salvar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNoteForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Quote Form */}
      {showQuoteForm && (
        <div className="bg-white border-t border-gray-200 px-4 py-6">
          <h3 className="text-gray-900 mb-4">Nova Citação</h3>
          <form onSubmit={handleSubmitQuote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Citação</Label>
              <Textarea
                id="quote"
                placeholder="Digite a citação do livro..."
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page">Página (opcional)</Label>
                <Input
                  id="page"
                  placeholder="Ex: 42"
                  value={quotePage}
                  onChange={(e) => setQuotePage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentage">Porcentagem (opcional)</Label>
                <Input
                  id="percentage"
                  placeholder="Ex: 35%"
                  value={quotePercentage}
                  onChange={(e) => setQuotePercentage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Salvar</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowQuoteForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Content Tabs */}
      <div className="px-4 py-6">
        <Tabs defaultValue="resenhas" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="resenhas">
              Resenhas ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="notas">
              Notas ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="citacoes">
              Citações ({quotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="resenhas" className="mt-0">
            {reviews.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Nenhuma resenha ainda. Seja o primeiro!
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {reviews.map((review) => {
                const reviewComments = comments.filter(c => c.reviewId === review.id);
                const isOwnReview = review.userId === currentUser.id;
                
                return (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-900">{review.userName}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{formatDate(review.createdAt)}</span>
                              {isOwnReview && (
                                <div className="flex gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => handleEditReview(review)}>
                                        <Pencil className="h-4 w-4" />
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
                                                onClick={() => setEditReviewRating(star)}
                                                className="focus:outline-none"
                                              >
                                                <Star
                                                  className={`h-6 w-6 ${
                                                    star <= editReviewRating
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
                                            value={editReviewText}
                                            onChange={(e) => setEditReviewText(e.target.value)}
                                            rows={4}
                                            className="mt-2"
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingReview(null)}>Cancelar</Button>
                                        <Button onClick={handleSaveEditReview}>Salvar</Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir resenha?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esta ação não pode ser desfeita. A resenha será permanentemente excluída.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDeleteReview(review.id)}>Excluir</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          
                          <p className="text-gray-700">{review.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notas" className="mt-0">
            {notes.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Nenhum comentário ainda. Adicione suas anotações!
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {notes.map((note) => {
                const isOwnNote = note.userId === currentUser.id;
                
                return (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-[#348e91] mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{note.userName}</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-500">{formatDate(note.createdAt)}</span>
                            </div>
                            {isOwnNote && (
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditNote(note)}>
                                      <Pencil className="h-4 w-4" />
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
                                          value={editNoteText}
                                          onChange={(e) => setEditNoteText(e.target.value)}
                                          rows={4}
                                          className="mt-2"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setEditingNote(null)}>Cancelar</Button>
                                      <Button onClick={handleSaveEditNote}>Salvar</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. O comentário será permanentemente excluído.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onDeleteNote(note.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700">{note.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="citacoes" className="mt-0">
            {quotes.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Nenhuma citação ainda. Compartilhe suas favoritas!
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {quotes.map((quote) => {
                const isOwnQuote = quote.userId === currentUser.id;
                
                return (
                  <Card key={quote.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <QuoteIcon className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-900">{quote.userName}</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-500">{formatDate(quote.createdAt)}</span>
                              {quote.page && (
                                <>
                                  <span className="text-gray-500">·</span>
                                  <Badge variant="outline" className="text-gray-600">p. {quote.page}</Badge>
                                </>
                              )}
                              {quote.percentage && (
                                <>
                                  <span className="text-gray-500">·</span>
                                  <Badge variant="outline" className="text-gray-600">{quote.percentage}</Badge>
                                </>
                              )}
                            </div>
                            {isOwnQuote && (
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditQuote(quote)}>
                                      <Pencil className="h-4 w-4" />
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
                                          rows={3}
                                          className="mt-2"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Página</Label>
                                          <Input
                                            value={editQuotePage}
                                            onChange={(e) => setEditQuotePage(e.target.value)}
                                            placeholder="Ex: 42"
                                            className="mt-2"
                                          />
                                        </div>
                                        <div>
                                          <Label>Porcentagem</Label>
                                          <Input
                                            value={editQuotePercentage}
                                            onChange={(e) => setEditQuotePercentage(e.target.value)}
                                            placeholder="Ex: 35%"
                                            className="mt-2"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setEditingQuote(null)}>Cancelar</Button>
                                      <Button onClick={handleSaveEditQuote}>Salvar</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir citação?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. A citação será permanentemente excluída.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onDeleteQuote(quote.id)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                          <blockquote className="border-l-4 border-purple-300 pl-4 py-2 italic text-gray-900">
                            "{quote.text}"
                          </blockquote>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}