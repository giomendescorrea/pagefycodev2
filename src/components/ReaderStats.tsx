import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { BookOpen, Star, Quote, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import * as booksService from '../services/books';
import * as reviewsService from '../services/reviews';
import * as quotesService from '../services/quotes';
import * as notesService from '../services/notes';

interface ReaderStatsProps {
  userId: string;
}

interface ReadingStats {
  totalBooksRead: number;
  totalBooksReading: number;
  totalBooksToRead: number;
  totalReviews: number;
  totalQuotes: number;
  totalNotes: number;
  averageRating: number;
  genreDistribution: { genre: string; count: number }[];
  monthlyReading: { month: string; count: number }[];
}

const COLORS = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#1e3a8a', '#172554'];

export function ReaderStats({ userId }: ReaderStatsProps) {
  const [stats, setStats] = useState<ReadingStats>({
    totalBooksRead: 0,
    totalBooksReading: 0,
    totalBooksToRead: 0,
    totalReviews: 0,
    totalQuotes: 0,
    totalNotes: 0,
    averageRating: 0,
    genreDistribution: [],
    monthlyReading: [],
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Load user's books
      const userBooks = await booksService.getUserBooks(userId);
      
      // Count by status
      const booksRead = userBooks.filter(b => b.status === 'lido');
      const booksReading = userBooks.filter(b => b.status === 'lendo');
      const booksToRead = userBooks.filter(b => b.status === 'para ler');
      
      // Load user's reviews, quotes, and notes
      const [reviews, quotes, notes] = await Promise.all([
        reviewsService.getUserReviews(userId),
        quotesService.getUserQuotes(userId),
        notesService.getUserNotes(userId),
      ]);

      // Calculate average rating
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Genre distribution
      const genreMap: Record<string, number> = {};
      booksRead.forEach(b => {
        const genre = b.book.genre || 'Outros';
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      });
      const genreDistribution = Object.entries(genreMap)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Monthly reading (last 6 months)
      const now = new Date();
      const monthlyMap: Record<string, number> = {};
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[date.getMonth()]}`;
        monthlyMap[key] = 0;
      }

      userBooks.forEach(b => {
        const date = new Date(b.date_added);
        const monthKey = `${monthNames[date.getMonth()]}`;
        if (monthKey in monthlyMap) {
          monthlyMap[monthKey]++;
        }
      });

      const monthlyReading = Object.entries(monthlyMap).map(([month, count]) => ({
        month,
        count,
      }));

      const newStats = {
        totalBooksRead: booksRead.length,
        totalBooksReading: booksReading.length,
        totalBooksToRead: booksToRead.length,
        totalReviews: reviews.length,
        totalQuotes: quotes.length,
        totalNotes: notes.length,
        averageRating,
        genreDistribution,
        monthlyReading,
      };

      setStats(newStats);
      
      // Check if user has any reading data
      const hasAnyData = booksRead.length > 0 || 
                        booksReading.length > 0 || 
                        booksToRead.length > 0 || 
                        reviews.length > 0 || 
                        quotes.length > 0 || 
                        notes.length > 0;
      setHasData(hasAnyData);
    } catch (error) {
      console.error('Error loading reader stats:', error);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af] mx-auto"></div>
          <p className="text-gray-600 mt-2">Carregando estatísticas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-gray-900">Estatísticas de Leitura</h3>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Nenhum dado de leitura disponível ainda</p>
          <p className="text-gray-500 text-sm mt-2">
            Comece adicionando livros à sua estante para ver suas estatísticas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-700" />
            <p className="text-2xl text-gray-900">{stats.totalBooksRead}</p>
            <p className="text-gray-600">Livros Lidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl text-gray-900">{stats.totalBooksReading}</p>
            <p className="text-gray-600">Lendo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl text-gray-900">{stats.averageRating.toFixed(1)}</p>
            <p className="text-gray-600">Avaliação Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl text-gray-900">{stats.totalReviews}</p>
            <p className="text-gray-600">Resenhas</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <h3 className="text-gray-900">Atividade</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-[#348e91]" />
                <span className="text-gray-700">Citações</span>
              </div>
              <Badge>{stats.totalQuotes}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Comentários</span>
              </div>
              <Badge>{stats.totalNotes}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">Para Ler</span>
              </div>
              <Badge>{stats.totalBooksToRead}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genre Distribution */}
      {stats.genreDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Gêneros Favoritos</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.genreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ genre, percent }) => `${genre} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stats.genreDistribution.map((item, index) => (
                <div key={item.genre} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.genre}</span>
                  <span className="text-sm text-gray-500">({item.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Reading */}
      {stats.monthlyReading.some(m => m.count > 0) && (
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Leitura nos Últimos 6 Meses</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.monthlyReading}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" name="Livros" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Achievement Badge */}
      {stats.totalBooksRead >= 10 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-gray-900">Leitor Ávido!</p>
                <p className="text-gray-600 text-sm">Você já leu {stats.totalBooksRead} livros! Continue assim! 📚</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}