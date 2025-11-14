import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { ShelfScreen } from './components/ShelfScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MenuScreen } from './components/MenuScreen';
import { BookDetail } from './components/BookDetail';
import { AdminPanel } from './components/AdminPanel';
import { PublisherPanel } from './components/PublisherPanel';
import { UserProfileView } from './components/UserProfileView';
import { NotificationPanel } from './components/NotificationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { User } from './App';

// Mock data for previews
const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  bio: 'Amante de livros e café ☕📚',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  role: 'user',
  isPrivate: false,
};

const mockAdminUser: User = {
  ...mockUser,
  role: 'admin',
};

const mockPublisherUser: User = {
  ...mockUser,
  role: 'publisher',
};

const mockBook = {
  id: '1',
  title: '1984',
  author: 'George Orwell',
  cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
  description: 'Um romance distópico que explora os perigos do totalitarismo.',
  genre: 'Ficção Científica',
  year: 1949,
};

const mockReviews = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    userName: 'João Silva',
    rating: 5,
    text: 'Obra-prima absoluta! Um dos melhores livros que já li.',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    bookId: '1',
    userId: '2',
    userName: 'Maria Santos',
    rating: 4,
    text: 'Muito bom, mas pesado em alguns momentos.',
    createdAt: new Date().toISOString(),
  },
];

const mockComments = [
  {
    id: '1',
    reviewId: '1',
    userId: '2',
    userName: 'Maria Santos',
    text: 'Concordo totalmente!',
    createdAt: new Date().toISOString(),
  },
];

const mockNotes = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    userName: 'João Silva',
    text: 'A parte sobre a duplipensar é fascinante.',
    createdAt: new Date().toISOString(),
  },
];

const mockQuotes = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    userName: 'João Silva',
    text: 'Guerra é paz. Liberdade é escravidão. Ignorância é força.',
    page: '4',
    createdAt: new Date().toISOString(),
  },
];

const mockNotifications = [
  {
    id: '1',
    type: 'follow' as const,
    title: 'Novo seguidor',
    description: 'Maria Santos começou a seguir você',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'comment' as const,
    title: 'Novo comentário',
    description: 'Pedro comentou na sua resenha',
    timestamp: new Date().toISOString(),
    read: true,
  },
];

const mockPosts = [
  {
    id: '1',
    user_id: '1',
    type: 'review' as const,
    book_id: '1',
    content: 'Acabei de ler 1984 e estou impressionado!',
    rating: 5,
    created_at: new Date().toISOString(),
    profile: mockUser,
    book: mockBook,
  },
];

const mockPublisherRequests = [
  {
    id: '1',
    user_id: '2',
    company_name: 'Editora Exemplo',
    cnpj: '12.345.678/0001-90',
    reason: 'Gostaria de publicar livros na plataforma',
    status: 'pending' as const,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
    profile: {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      bio: null,
      avatar_url: null,
      role: 'user' as const,
      is_private: false,
      is_pending_approval: false,
      created_at: new Date().toISOString(),
    },
  },
];

const mockFollowers = [
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
  },
];

const mockFollowing = [
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
  },
];

export default function AllScreens() {
  const [activeTab, setActiveTab] = useState('login');

  const noop = () => {};
  const noopAsync = async () => {};

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">📱 Pagefy - Todas as Telas</h1>
          <p className="text-gray-600">Visualize e edite todas as telas do aplicativo</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2 h-auto mb-6 bg-white p-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
            <TabsTrigger value="pending">Pendente</TabsTrigger>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="search">Busca</TabsTrigger>
            <TabsTrigger value="shelf">Estante</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="book">Livro</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="publisher">Publicador</TabsTrigger>
            <TabsTrigger value="userProfile">Outro Usuário</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          {/* 1. LoginForm */}
          <TabsContent value="login" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela de Login</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                <LoginForm
                  onLogin={noopAsync}
                  onSwitchToSignup={noop}
                />
              </div>
            </div>
          </TabsContent>

          {/* 2. SignupForm */}
          <TabsContent value="signup" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela de Cadastro</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                <SignupForm
                  onSignup={noopAsync as any}
                  onSwitchToLogin={noop}
                />
              </div>
            </div>
          </TabsContent>

          {/* 3. PendingApprovalScreen */}
          <TabsContent value="pending" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela de Aguardando Aprovação</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                <PendingApprovalScreen
                  userName="João Silva"
                  userEmail="joao@email.com"
                  onLogout={noopAsync}
                />
              </div>
            </div>
          </TabsContent>

          {/* 4. HomeScreen */}
          <TabsContent value="home" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela Principal (Feed)</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                <HomeScreen
                  currentUser={mockUser}
                  onShowNotifications={noop}
                  unreadCount={2}
                  onLike={noopAsync as any}
                  onBookSelect={noop as any}
                  onUserSelect={noop}
                  posts={mockPosts}
                />
              </div>
            </div>
          </TabsContent>

          {/* 5. SearchScreen */}
          <TabsContent value="search" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela de Busca</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <h3 className="text-gray-900">Buscar</h3>
                </div>
                <SearchScreen
                  currentUser={mockUser}
                  onBookSelect={noop as any}
                  onFollow={noopAsync as any}
                  isFollowing={() => false}
                  onUserSelect={noop}
                />
              </div>
            </div>
          </TabsContent>

          {/* 6. ShelfScreen */}
          <TabsContent value="shelf" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Estante (Resenhas, Comentários, Citações)</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <h3 className="text-gray-900">Estante</h3>
                </div>
                <ShelfScreen
                  currentUser={mockUser}
                  reviews={mockReviews}
                  notes={mockNotes}
                  quotes={mockQuotes}
                  onBookSelect={noop as any}
                  onEditReview={noopAsync as any}
                  onDeleteReview={noopAsync}
                  onEditNote={noopAsync as any}
                  onDeleteNote={noopAsync}
                  onEditQuote={noopAsync as any}
                  onDeleteQuote={noopAsync}
                />
              </div>
            </div>
          </TabsContent>

          {/* 7. ProfileScreen */}
          <TabsContent value="profile" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela de Perfil</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <h3 className="text-gray-900">Perfil</h3>
                </div>
                <ProfileScreen
                  user={mockUser}
                  onUpdateProfile={noopAsync as any}
                  onTogglePrivacy={noopAsync}
                  followersCount={1}
                  followingCount={1}
                  followersList={mockFollowers}
                  followingList={mockFollowing}
                  onFollow={noopAsync as any}
                  isFollowing={() => false}
                />
              </div>
            </div>
          </TabsContent>

          {/* 8. MenuScreen */}
          <TabsContent value="menu" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Tela de Menu</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <h3 className="text-gray-900">Menu</h3>
                </div>
                <MenuScreen
                  currentUser={mockAdminUser}
                  onNavigateToAdmin={noop}
                  onNavigateToPublisher={noop}
                  onRequestPublisher={noopAsync}
                  onLogout={noopAsync}
                  pendingRequestsCount={1}
                />
              </div>
            </div>
          </TabsContent>

          {/* 9. BookDetail */}
          <TabsContent value="book" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Detalhes do Livro</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <BookDetail
                  book={mockBook}
                  reviews={mockReviews}
                  comments={mockComments}
                  notes={mockNotes}
                  quotes={mockQuotes}
                  currentUser={mockUser}
                  onAddReview={noopAsync as any}
                  onAddComment={noopAsync as any}
                  onAddNote={noopAsync as any}
                  onAddQuote={noopAsync as any}
                  onEditReview={noopAsync as any}
                  onDeleteReview={noopAsync}
                  onEditNote={noopAsync as any}
                  onDeleteNote={noopAsync}
                  onEditQuote={noopAsync as any}
                  onDeleteQuote={noopAsync}
                  onAddToShelf={noopAsync as any}
                  userBookStatus="lendo"
                />
              </div>
            </div>
          </TabsContent>

          {/* 10. AdminPanel */}
          <TabsContent value="admin" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Painel Administrativo</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <AdminPanel
                  currentUser={mockAdminUser}
                  publisherRequests={mockPublisherRequests}
                  onApproveRequest={noopAsync}
                  onRejectRequest={noopAsync}
                />
              </div>
            </div>
          </TabsContent>

          {/* 11. PublisherPanel */}
          <TabsContent value="publisher" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Painel do Publicador</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <PublisherPanel
                  currentUser={mockPublisherUser}
                />
              </div>
            </div>
          </TabsContent>

          {/* 12. UserProfileView */}
          <TabsContent value="userProfile" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Visualizar Perfil de Outro Usuário</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <UserProfileView
                  userId="2"
                  currentUserId="1"
                  onBack={noop}
                  onFollow={noopAsync as any}
                  isFollowing={false}
                />
              </div>
            </div>
          </TabsContent>

          {/* 13. NotificationPanel */}
          <TabsContent value="notifications" className="mt-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-gray-900 mb-4">Painel de Notificações</h2>
              <div className="max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
                <div className="relative">
                  <NotificationPanel
                    notifications={mockNotifications}
                    onClose={noop}
                    onMarkAsRead={noopAsync}
                    onMarkAllAsRead={noopAsync}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-900 mb-4">📋 Lista de Telas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">1. Login</p>
              <p className="text-gray-600">Tela de autenticação</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">2. Cadastro</p>
              <p className="text-gray-600">Criação de conta (leitor/publicador)</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">3. Pendente</p>
              <p className="text-gray-600">Aguardando aprovação de publicador</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">4. Home</p>
              <p className="text-gray-600">Feed de posts dos seguidos</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">5. Busca</p>
              <p className="text-gray-600">Buscar livros e usuários</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">6. Estante</p>
              <p className="text-gray-600">Resenhas, comentários e citações</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">7. Perfil</p>
              <p className="text-gray-600">Dados do usuário e configurações</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">8. Menu</p>
              <p className="text-gray-600">Painéis, ajuda e logout</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">9. Livro</p>
              <p className="text-gray-600">Detalhes, resenhas e interações</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">10. Admin</p>
              <p className="text-gray-600">Aprovar/rejeitar publicadores</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">11. Publicador</p>
              <p className="text-gray-600">Adicionar e gerenciar livros</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">12. Outro Usuário</p>
              <p className="text-gray-600">Visualizar perfil de terceiros</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-900">13. Notificações</p>
              <p className="text-gray-600">Painel de avisos e alertas</p>
            </div>
          </div>
        </div>

        {/* Navigation Flow */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-900 mb-4">🔄 Fluxo de Navegação</h3>
          <div className="space-y-2 text-gray-700">
            <p>→ <span className="font-medium">Login/Cadastro</span> → Pendente (se publicador) ou Home</p>
            <p>→ <span className="font-medium">Home</span> → Feed com BottomNav (5 tabs)</p>
            <p>→ <span className="font-medium">BottomNav</span>: Home | Busca | Perfil | Estante | Menu</p>
            <p>→ <span className="font-medium">Busca</span> → Livro | Outro Usuário</p>
            <p>→ <span className="font-medium">Menu</span> → Admin (se admin) | Publicador (se publisher/admin)</p>
            <p>→ <span className="font-medium">Sino (Bell)</span> → Notificações (overlay)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
