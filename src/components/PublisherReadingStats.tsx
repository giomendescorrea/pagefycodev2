import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Users, TrendingUp, Eye, Loader2 } from 'lucide-react';
import { User } from '../App';
import * as publisherStatsService from '../services/publisher-stats';
import * as booksService from '../services/books';
import { toast } from 'sonner@2.0.3';

interface PublisherReadingStatsProps {
  currentUser: User;
}

const STATUS_COLORS = {
  to_read: '#fbbf24', // yellow
  reading: '#3b82f6', // blue
  read: '#10b981', // green
};

const STATUS_LABELS = {
  to_read: 'Para Ler',
  reading: 'Lendo',
  read: 'Lido',
};

export function PublisherReadingStats({ currentUser }: PublisherReadingStatsProps) {
  const [stats, setStats] = useState<publisherStatsService.PublisherStatsData | null>(null);
  const [books, setBooks] = useState<booksService.Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [publisherStats, publisherBooks] = await Promise.all([
        publisherStatsService.getPublisherStats(currentUser.id),
        booksService.getPublisherBooks(currentUser.id),
      ]);
      setStats(publisherStats);
      setBooks(publisherBooks.filter(b => b.status === 'published'));
    } catch (error) {
      console.error('Error loading publisher stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="pb-20 px-4 py-6">
        <div className="text-center text-gray-500 py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma estatística disponível</p>
        </div>
      </div>
    );
  }

  // Get filtered data based on selected book
  const getFilteredData = () => {
    if (selectedBookId === 'all') {
      return {
        statusStats: stats.overall_status_stats,
        bookStats: stats.books_ranking,
      };
    }

    const book = stats.books_ranking.find(b => b.book_id === selectedBookId);
    if (!book) {
      return {
        statusStats: [],
        bookStats: [],
      };
    }

    return {
      statusStats: [
        { status: 'to_read' as const, count: book.status_to_read },
        { status: 'reading' as const, count: book.status_reading },
        { status: 'read' as const, count: book.status_read },
      ],
      bookStats: [book],
    };
  };

  const { statusStats, bookStats } = getFilteredData();

  // Prepare data for ranking chart (top 10 books by total readers)
  const rankingData = [...stats.books_ranking]
    .sort((a, b) => b.total_readers - a.total_readers)
    .slice(0, 10)
    .map((book, index) => ({
      name: book.book_title.length > 20 ? book.book_title.substring(0, 20) + '...' : book.book_title,
      fullName: book.book_title,
      leitores: book.total_readers,
      ranking: index + 1,
      percentage: stats.total_readers > 0 ? ((book.total_readers / stats.total_readers) * 100).toFixed(1) : '0',
    }));

  // Prepare data for status pie chart
  const statusBarChartData = statusStats.map(stat => ({
    name: STATUS_LABELS[stat.status],
    value: stat.count,
    quantidade: stat.count,
    color: STATUS_COLORS[stat.status],
  }));

  // Prepare data for status bar chart (comparing books)
  const statusBarData = bookStats.map(book => ({
    name: book.book_title.length > 15 ? book.book_title.substring(0, 15) + '...' : book.book_title,
    fullName: book.book_title,
    'Para Ler': book.status_to_read,
    'Lendo': book.status_reading,
    'Lido': book.status_read,
  }));

  const totalStatusCount = statusStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8" />
          <div>
            <h1>Estatísticas de Leitura</h1>
            <p className="text-purple-100">Acompanhe o desempenho dos seus livros</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl text-gray-900">{stats.total_books}</p>
              <p className="text-gray-600 text-sm">Livros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl text-gray-900">{stats.total_readers}</p>
              <p className="text-gray-600 text-sm">Leitores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl text-gray-900">{stats.total_views}</p>
              <p className="text-gray-600 text-sm">Visualizações</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter by Book */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">Filtrar por Livro</h3>
              <Badge>{selectedBookId === 'all' ? 'Todos' : '1 livro'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um livro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os livros</SelectItem>
                {books.map(book => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Ranking de Livros Mais Lidos (only show if "all" is selected) */}
        {selectedBookId === 'all' && rankingData.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-gray-900">Ranking: Livros Mais Lidos</h3>
              <p className="text-gray-600 text-sm mt-1">Top 10 livros com mais leitores</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {rankingData.slice(0, 5).map((book) => {
                  const bookData = stats.books_ranking.find(b => b.book_title === book.fullName);
                  return (
                    <div key={book.fullName} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex-shrink-0">
                        <span className="font-bold">#{book.ranking}</span>
                      </div>
                      {bookData?.book_cover_url && (
                        <div className="w-10 h-14 flex-shrink-0">
                          <ImageWithFallback
                            src={bookData.book_cover_url}
                            alt={book.fullName}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">{book.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-green-100 text-green-700 border-0">
                            {book.leitores} leitores
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-0">
                            {book.percentage}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {rankingData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rankingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis label={{ value: 'Leitores', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold text-gray-900">{data.fullName}</p>
                              <p className="text-purple-600">{data.leitores} leitores ({data.percentage}%)</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="leitores" fill="#9333ea" name="Leitores" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status de Leitura */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Status de Leitura</h3>
            <p className="text-gray-600 text-sm mt-1">
              {selectedBookId === 'all' 
                ? 'Distribuição de status em todos os livros'
                : `Status do livro: ${books.find(b => b.id === selectedBookId)?.title}`
              }
            </p>
          </CardHeader>
          <CardContent>
            {totalStatusCount === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhum leitor ainda</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  {statusStats.map(stat => {
                    const percentage = totalStatusCount > 0 
                      ? ((stat.count / totalStatusCount) * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <div key={stat.status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: STATUS_COLORS[stat.status] }}
                          />
                          <span className="text-gray-900">{STATUS_LABELS[stat.status]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gray-200 text-gray-700 border-0">
                            {stat.count} leitores
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 border-0">
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pie Chart for Status */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusBarChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusBarChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold text-gray-900">{data.name}</p>
                              <p style={{ color: data.color }}>
                                {data.quantidade} leitores
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Comparison (only show if "all" is selected and there are multiple books) */}
        {selectedBookId === 'all' && statusBarData.length > 1 && (
          <Card>
            <CardHeader>
              <h3 className="text-gray-900">Comparação de Status por Livro</h3>
              <p className="text-gray-600 text-sm mt-1">Status de leitura de cada livro</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.max(300, statusBarData.length * 60)}>
                <BarChart data={statusBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow-lg">
                            <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
                            <div className="space-y-1">
                              <p className="text-yellow-600">Para Ler: {data['Para Ler']}</p>
                              <p className="text-blue-600">Lendo: {data['Lendo']}</p>
                              <p className="text-green-600">Lido: {data['Lido']}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Para Ler" stackId="a" fill={STATUS_COLORS.to_read} />
                  <Bar dataKey="Lendo" stackId="a" fill={STATUS_COLORS.reading} />
                  <Bar dataKey="Lido" stackId="a" fill={STATUS_COLORS.read} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}