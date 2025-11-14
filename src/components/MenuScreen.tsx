import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Calendar, TrendingUp, MessageCircle, Star, Shield, BookOpen, HelpCircle, LogOut, Info } from 'lucide-react';
import { Button } from './ui/button';
import { User } from '../App';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import * as usersService from '../services/users';
import * as reviewsService from '../services/reviews';
import * as notesService from '../services/notes';
import * as quotesService from '../services/quotes';

interface MenuScreenProps {
  currentUser?: User;
  onNavigateToAdmin?: () => void;
  onNavigateToPublisher?: () => void;
  onRequestPublisher?: (reason: string) => void;
  onLogout?: () => void;
  pendingRequestsCount?: number;
}

export function MenuScreen({ currentUser, onNavigateToAdmin, onNavigateToPublisher, onLogout, pendingRequestsCount = 0 }: MenuScreenProps) {
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [stats, setStats] = useState<usersService.UserStats | null>(null);
  const [recentReviews, setRecentReviews] = useState<reviewsService.Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Load user stats
      const userStats = await usersService.getUserStats(currentUser.id);
      setStats(userStats);

      // Load recent reviews
      const reviews = await reviewsService.getUserReviews(currentUser.id);
      setRecentReviews(reviews.slice(0, 3)); // Get only 3 most recent
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div className="pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-4">
        <h2 className="text-gray-900">Estatísticas e Menu</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Admin/Publisher Access */}
        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'publisher') && (
          <Card>
            <CardHeader>
              <h3 className="text-gray-900">Acesso Especial</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentUser.role === 'admin' && (
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={onNavigateToAdmin}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Painel do Administrador
                  {pendingRequestsCount > 0 && (
                    <Badge className="ml-2 bg-white text-red-600 border-0">
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </Button>
              )}
              {(currentUser.role === 'publisher' || currentUser.role === 'admin') && (
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={onNavigateToPublisher}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Painel do Publicador
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-gray-900">Ações Rápidas</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* About Dialog */}
            <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Info className="h-5 w-5 mr-2" />
                  Sobre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sobre o Pagefy</DialogTitle>
                  <DialogDescription>
                    Conheça a equipe e o projeto
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                      Pagefy é uma aplicação pensada para leitores que desejam registrar e organizar suas experiências de leitura de forma mais completa e significativa. Diferente de outras ferramentas do mercado, ela oferece um espaço dedicado para salvar citações favoritas separadamente dos comentários gerais, permitindo que o usuário revisite com facilidade os trechos que mais o impactaram.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      O foco está em preencher a lacuna deixada por outros logs de leitura, que geralmente misturam informações e dificultam o acesso posterior às citações.
                    </p>
                    <div className="space-y-2">
                      <p className="text-gray-900">Com o Pagefy, os usuários podem:</p>
                      <ul className="space-y-1 text-gray-700 ml-4">
                        <li>• Cadastrar livros como lidos, lendo ou para ler</li>
                        <li>• Fazer comentários personalizados por leitura</li>
                        <li>• Registrar e organizar citações marcantes</li>
                        <li>• Escrever resenhas e atribuir avaliações aos livros</li>
                      </ul>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      O diferencial do Pagefy está em tornar o conteúdo mais pessoal, destacando aquilo que realmente marcou o leitor em cada livro e em oferecer uma experiência de navegação organizada e intuitiva.
                    </p>
                    
                    <Separator className="my-4" />
                    
                    <h4 className="text-gray-900">Equipe de Desenvolvimento</h4>
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <strong>Giovanna Mendes Correa</strong><br />
                        RA: 22.123.093-1
                      </p>
                      <p>
                        <strong>Guilherme Silva Meireles</strong><br />
                        RA: 22.123.094-3
                      </p>
                      <p>
                        <strong>Ranielly Gonzaga da Silva Affonso</strong><br />
                        RA: 22.123-100-4
                      </p>
                    </div>
                    
                    <div className="p-3 bg-[#e8f5f5] rounded-lg border border-[#348e91]/30">
                      <p className="text-[#1c5052]">
                        <strong>Desenvolvido nas disciplinas de:</strong><br />
                        • Engenharia de Software<br />
                        • Banco de Dados<br />
                        <br />
                        <strong>Centro Universitário FEI - SBC</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setShowAboutDialog(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Help and Support Dialog */}
            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Ajuda e Suporte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajuda e Suporte</DialogTitle>
                  <DialogDescription>
                    Entre em contato com nossa equipe de suporte
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Para suporte técnico e assistência, entre em contato através do email abaixo:
                    </p>
                    <div className="p-4 bg-[#e8f5f5] rounded-lg border border-[#348e91]/30 text-center">
                      <p className="text-[#1c5052] mb-3">
                        <strong>Email de Suporte:</strong>
                      </p>
                      <a
                        href="mailto:suporte.pagefy@gmail.com?subject=Suporte%20Pagefy&body=Ol%C3%A1!%0A%0AObrigado%20por%20entrar%20em%20contato%20com%20o%20suporte%20do%20Pagefy%20%F0%9F%92%9B%0A%0APara%20que%20possamos%20te%20ajudar%20da%20forma%20mais%20r%C3%A1pida%20e%20eficiente%2C%20pedimos%20que%20preencha%20as%20informa%C3%A7%C3%B5es%20abaixo%3A%0A%0A%F0%9F%93%8C%20Informa%C3%A7%C3%B5es%20necess%C3%A1rias%20para%20an%C3%A1lise%0A%0A1.%20Nome%20completo%3A%0A(Preencha%20aqui)%0A%0A2.%20E-mail%20cadastrado%20no%20Pagefy%3A%0A(Preencha%20aqui)%0A%0A3.%20Descri%C3%A7%C3%A3o%20do%20problema%3A%0A(Explique%20com%20detalhes%20o%20que%20est%C3%A1%20acontecendo)%0A%0A4.%20Passo%20a%20passo%20do%20que%20voc%C3%AA%20estava%20fazendo%20quando%20o%20problema%20ocorreu%3A%0A(Ex.%3A%20abrir%20o%20app%20%E2%86%92%20acessar%20meus%20livros%20%E2%86%92%20adicionar%20livro%20%E2%86%92%20erro%20apareceu)%0A%0A5.%20Mensagem%20de%20erro%20exibida%20(se%20houver)%3A%0A(Cole%20aqui%20o%20texto%20exato%20da%20mensagem%20ou%20print)%0A%0A6.%20Tipo%20de%20dispositivo%3A%0A(%20)%20Android%0A(%20)%20iOS%0A(%20)%20Web%0AModelo%20do%20dispositivo%3A%20(ex.%3A%20Samsung%20A54%2C%20iPhone%2012%E2%80%A6)%0A%0A7.%20Vers%C3%A3o%20do%20aplicativo%20(se%20souber)%3A%0A(Preencha%20aqui)%0A%0A8.%20Prints%20ou%20v%C3%ADdeos%20mostrando%20o%20problema%3A%0A(Anexe%20ao%20e-mail)%0A%0AAssim%20que%20recebermos%20essas%20informa%C3%A7%C3%B5es%2C%20faremos%20a%20an%C3%A1lise%20e%20retornaremos%20com%20a%20solu%C3%A7%C3%A3o%20o%20mais%20r%C3%A1pido%20poss%C3%ADvel.%0A%0AConte%20sempre%20com%20a%20equipe%20Pagefy!%0A%0AAtenciosamente%2C%0ASuporte%20Pagefy%0A%F0%9F%93%98%20Transformando%20sua%20organiza%C3%A7%C3%A3o%20de%20leitura."
                        className="inline-block px-6 py-3 bg-[#348e91] text-white rounded-lg hover:bg-[#1c5052] transition-colors"
                      >
                        suporte.pagefy@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={() => setShowHelpDialog(false)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Separator />
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#348e91] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        ) : stats ? (
          <>
            <div className="mb-4">
              <h3 className="text-gray-900">Minhas Estatísticas</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center text-[#348e91] mb-2">
                    <Star className="h-8 w-8" />
                  </div>
                  <p className="text-2xl text-gray-900">{stats.total_reviews}</p>
                  <p className="text-gray-600">Resenhas</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center text-green-600 mb-2">
                    <Star className="h-8 w-8" />
                  </div>
                  <p className="text-2xl text-gray-900">{stats.average_rating.toFixed(1)}</p>
                  <p className="text-gray-600">Média de Avaliação</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center text-purple-600 mb-2">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <p className="text-2xl text-gray-900">{stats.total_notes}</p>
                  <p className="text-gray-600">Comentários</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center text-orange-600 mb-2">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <p className="text-2xl text-gray-900">{stats.total_quotes}</p>
                  <p className="text-gray-600">Citações</p>
                </CardContent>
              </Card>
            </div>

            {recentReviews.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-gray-900">Resenhas Recentes</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-gray-900">{review.book?.title || 'Livro'}</p>
                          <span className="text-gray-500">{formatDate(review.created_at)}</span>
                        </div>
                        <p className="text-gray-700 mb-2 line-clamp-2">{review.text}</p>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{review.rating} estrelas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <p>Comece a adicionar resenhas para ver suas estatísticas!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}