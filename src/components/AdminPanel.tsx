import { useState, useEffect } from 'react';
import * as usersService from '../services/users';
import * as booksService from '../services/books';
import * as reviewsService from '../services/reviews';
import * as unlockRequestsService from '../services/unlock-requests';
import { UnlockRequest } from '../services/unlock-requests';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { User, UserRole } from '../App';
import { PublisherRequest } from '../services/publisher-requests';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Users, BookOpen, MessageSquare, UserCog, Lock, LockOpen, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { MigrationWarning } from './MigrationWarning';
import { Label } from './ui/label';

interface AdminPanelProps {
  currentUser: User;
  publisherRequests: PublisherRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_suspended?: boolean;
  is_locked?: boolean;
  failed_login_attempts?: number;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalReviews: number;
  pendingRequests: number;
}

export function AdminPanel({ currentUser, publisherRequests, onApproveRequest, onRejectRequest }: AdminPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'publisher' | 'unlock'>('all');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalReviews: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [unlockTableMissing, setUnlockTableMissing] = useState(false);
  const [showMigrationWarning, setShowMigrationWarning] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    // Update pending requests count when publisherRequests or users change
    const pendingPublisher = publisherRequests.filter(r => r.status === 'pending').length;
    const pendingUnlock = unlockRequests.filter(r => r.status === 'pending').length;
    
    // Also count locked users without pending requests
    const lockedWithoutRequest = users.filter(u => {
      if (!u.is_locked) return false;
      const hasPendingRequest = unlockRequests.some(r => 
        r.user_id === u.id && r.status === 'pending'
      );
      return !hasPendingRequest;
    }).length;
    
    setStats(prev => ({
      ...prev,
      pendingRequests: pendingPublisher + pendingUnlock + lockedWithoutRequest,
    }));
  }, [publisherRequests, unlockRequests, users]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load all users
      const allUsers = await usersService.getAllUsers();
      setUsers(allUsers);

      // Load unlock requests (with error handling for missing table)
      let unlockReqs: any[] = [];
      try {
        unlockReqs = await unlockRequestsService.getUnlockRequests();
        setUnlockRequests(unlockReqs);
        setUnlockTableMissing(false);
        
        // Check for locked users without pending unlock requests
        const lockedUsers = allUsers.filter(u => u.is_locked);
        const usersWithPendingRequests = new Set(
          unlockReqs.filter(r => r.status === 'pending').map(r => r.user_id)
        );
        
        // Create automatic unlock requests for locked users without one
        let newRequestsCreated = false;
        for (const lockedUser of lockedUsers) {
          if (!usersWithPendingRequests.has(lockedUser.id)) {
            await unlockRequestsService.createUnlockRequest(
              lockedUser.id,
              'Conta bloqueada automaticamente após 5 tentativas de login incorretas.'
            );
            newRequestsCreated = true;
          }
        }
        
        // Reload unlock requests if we created new ones
        if (newRequestsCreated) {
          unlockReqs = await unlockRequestsService.getUnlockRequests();
          setUnlockRequests(unlockReqs);
        }
      } catch (unlockError: any) {
        // Silently handle missing table (it's optional)
        if (unlockError?.code === 'PGRST205' || unlockError?.code === 'PGRST200' || unlockError?.message?.includes('unlock_requests')) {
          setUnlockTableMissing(true);
        }
        setUnlockRequests([]);
      }

      // Load stats
      const [totalUsers, totalBooks, totalReviews] = await Promise.all([
        usersService.getTotalUsersCount(),
        booksService.getTotalBooksCount(),
        reviewsService.getTotalReviewsCount(),
      ]);

      const pendingPublisher = publisherRequests.filter(r => r.status === 'pending').length;
      const pendingUnlock = unlockReqs.filter(r => r.status === 'pending').length;

      setStats({
        totalUsers,
        totalBooks,
        totalReviews,
        pendingRequests: pendingPublisher + pendingUnlock,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    try {
      await usersService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('Permissão de usuário atualizada!');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erro ao atualizar permissão');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      const newSuspendedState = !user?.is_suspended;
      
      await usersService.toggleUserSuspension(userId, newSuspendedState);
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_suspended: newSuspendedState } 
          : u
      ));
      
      if (newSuspendedState) {
        toast.success('Usuário suspenso com sucesso!');
      } else {
        toast.success('Usuário reativado com sucesso!');
      }
    } catch (error) {
      console.error('Error toggling user suspension:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await usersService.unlockUserAccount(userId);
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_locked: false, failed_login_attempts: 0 } 
          : u
      ));
      toast.success('Conta desbloqueada com sucesso!');
    } catch (error) {
      console.error('Error unlocking user account:', error);
      toast.error('Erro ao desbloquear conta');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuário removido do sistema!');
      
      // Reload stats
      const totalUsers = await usersService.getTotalUsersCount();
      setStats(prev => ({ ...prev, totalUsers }));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erro ao remover usuário');
    }
  };

  const handleApproveUnlockRequest = async (requestId: string, userId: string) => {
    try {
      await unlockRequestsService.approveUnlockRequest(requestId, userId);
      
      // Update unlock requests
      setUnlockRequests(unlockRequests.map(r => 
        r.id === requestId ? { ...r, status: 'approved' as const } : r
      ));
      
      // Update user in list
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, is_locked: false, failed_login_attempts: 0 } 
          : u
      ));
      
      toast.success('Conta desbloqueada com sucesso!');
    } catch (error) {
      console.error('Error approving unlock request:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  };

  const handleRejectUnlockRequest = async (requestId: string) => {
    try {
      await unlockRequestsService.rejectUnlockRequest(requestId);
      setUnlockRequests(unlockRequests.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ));
      toast.success('Solicitação de desbloqueio rejeitada');
    } catch (error) {
      console.error('Error rejecting unlock request:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-700 border-0">Admin</Badge>;
      case 'publisher':
        return <Badge className="bg-purple-100 text-purple-700 border-0">Publicador</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-0">Usuário</Badge>;
    }
  };

  const getStatusBadge = (isSuspended?: boolean) => {
    if (isSuspended) {
      return <Badge className="bg-red-100 text-red-700 border-0">Suspenso</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 border-0">Ativo</Badge>;
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-red-600" />
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8" />
          <div>
            <h1>Painel do Administrador</h1>
            <p className="text-red-100">Gerenciamento completo do sistema</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-[#348e91]" />
              <p className="text-2xl text-gray-900">{stats.totalUsers}</p>
              <p className="text-gray-600">Usuários</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl text-gray-900">{stats.totalBooks}</p>
              <p className="text-gray-600">Livros</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl text-gray-900">{stats.totalReviews}</p>
              <p className="text-gray-600">Resenhas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCog className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl text-gray-900">{stats.pendingRequests}</p>
              <p className="text-gray-600">Solicitações</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="requests">
              Solicitações
              {stats.pendingRequests > 0 && (
                <Badge className="ml-2 bg-red-500 text-white border-0 h-5 w-5 p-0 flex items-center justify-center">
                  {stats.pendingRequests}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900">Lista de Usuários</h3>
                  <Badge>{users.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <Card key={user.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-gray-900">{user.name}</p>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {getRoleBadge(user.role)}
                                  {getStatusBadge(user.is_suspended)}
                                  {user.is_locked && (
                                    <Badge className="bg-orange-100 text-orange-700 border-0">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Bloqueado
                                    </Badge>
                                  )}
                                  {user.failed_login_attempts && user.failed_login_attempts > 0 && !user.is_locked && (
                                    <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                                      {user.failed_login_attempts} tentativa(s) falha(s)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="space-y-2">
                            {/* Role Selector */}
                            <div>
                              <Label className="text-xs text-gray-600">Permissão</Label>
                              <Select
                                value={user.role}
                                onValueChange={(value: UserRole) => handleChangeUserRole(user.id, value)}
                                disabled={user.id === currentUser.id}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Usuário</SelectItem>
                                  <SelectItem value="publisher">Publicador</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                variant={user.is_suspended ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1"
                                onClick={() => handleSuspendUser(user.id)}
                                disabled={user.id === currentUser.id}
                              >
                                {user.is_suspended ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Reativar
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Suspender
                                  </>
                                )}
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive"
                                    size="sm"
                                    disabled={user.id === currentUser.id}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Excluir
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir {user.name}? Esta ação não pode ser desfeita e removerá todos os dados do usuário.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-4">
            {/* Filtro de Solicitações */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={requestFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequestFilter('all')}
                className="flex-shrink-0"
              >
                Todas
                {stats.pendingRequests > 0 && (
                  <Badge className="ml-2 bg-white text-[#1e40af] border-0 h-5 min-w-5 px-1 flex items-center justify-center">
                    {stats.pendingRequests}
                  </Badge>
                )}
              </Button>
              <Button
                variant={requestFilter === 'publisher' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequestFilter('publisher')}
                className="flex-shrink-0"
              >
                <UserCog className="h-4 w-4 mr-1" />
                Publicador
                {publisherRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge className={`ml-2 ${requestFilter === 'publisher' ? 'bg-white text-[#1e40af]' : 'bg-purple-100 text-purple-700'} border-0 h-5 min-w-5 px-1 flex items-center justify-center`}>
                    {publisherRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={requestFilter === 'unlock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRequestFilter('unlock')}
                className="flex-shrink-0"
              >
                <Lock className="h-4 w-4 mr-1" />
                Desbloqueio
                {unlockRequests.filter(r => r.status === 'pending').length > 0 && (
                  <Badge className={`ml-2 ${requestFilter === 'unlock' ? 'bg-white text-[#1e40af]' : 'bg-orange-100 text-orange-700'} border-0 h-5 min-w-5 px-1 flex items-center justify-center`}>
                    {unlockRequests.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Solicitações de Publicador */}
            {(requestFilter === 'all' || requestFilter === 'publisher') && (
              <>
                <Card>
                  <CardHeader>
                    <h3 className="text-gray-900">Solicitações de Publicador</h3>
                  </CardHeader>
                  <CardContent>
                    {publisherRequests.filter(r => r.status === 'pending').length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        <UserCog className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma solicitação pendente</p>
                        {publisherRequests.length > 0 && (
                          <p className="text-xs mt-2">
                            Você tem {publisherRequests.length} solicitação(ões) no histórico
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {publisherRequests.filter(r => r.status === 'pending').map((request) => (
                          <Card key={request.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        {(request.userName || request.profile?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-gray-900">{request.userName || request.profile?.name || 'Usuário'}</p>
                                      <p className="text-gray-600">{request.userEmail || request.profile?.email || 'Email não disponível'}</p>
                                    </div>
                                  </div>
                                  <p className="text-gray-700 mb-2">{request.reason}</p>
                                  <p className="text-gray-500">
                                    {new Date(request.created_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  className="flex-1" 
                                  onClick={() => onApproveRequest(request.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1" 
                                  onClick={() => onRejectRequest(request.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Histórico de Solicitações */}
                {publisherRequests.filter(r => r.status !== 'pending').length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-gray-900">Histórico</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {publisherRequests.filter(r => r.status !== 'pending').map((request) => (
                          <div key={request.id} className="p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-900">{request.profile?.name || 'Usuário'}</p>
                                <p className="text-gray-600 text-sm">{request.profile?.email || 'Email não disponível'}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <Badge className={
                                request.status === 'approved' 
                                  ? 'bg-green-100 text-green-700 border-0'
                                  : 'bg-red-100 text-red-700 border-0'
                              }>
                                {request.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Solicitações de Desbloqueio */}
            {(requestFilter === 'all' || requestFilter === 'unlock') && (
              <>
                {/* Migration Warning */}
                {unlockTableMissing && showMigrationWarning && (
                  <div className="mb-4">
                    <MigrationWarning
                      missingFeature="Solicitações de Desbloqueio"
                      migrationFile="MIGRATION_UNLOCK_REQUESTS.sql"
                      onDismiss={() => setShowMigrationWarning(false)}
                    />
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-orange-600" />
                      <h3 className="text-gray-900">Contas Bloqueadas</h3>
                      {(unlockRequests.filter(r => r.status === 'pending').length > 0 || users.filter(u => u.is_locked).length > 0) && (
                        <Badge className="bg-orange-100 text-orange-700 border-0">
                          {Math.max(unlockRequests.filter(r => r.status === 'pending').length, users.filter(u => u.is_locked).length)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">Contas que foram bloqueadas após 5 tentativas de login incorretas</p>
                  </CardHeader>
                  <CardContent>
                    {unlockRequests.filter(r => r.status === 'pending').length === 0 && users.filter(u => u.is_locked).length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <LockOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p>Nenhuma conta bloqueada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Show pending unlock requests */}
                        {unlockRequests.filter(r => r.status === 'pending').map((request) => (
                          <Card key={request.id} className="bg-orange-50 border-orange-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-orange-200 text-orange-700">
                                        {(request.userName || request.profile?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-gray-900">{request.userName || request.profile?.name || 'Usuário'}</p>
                                      <p className="text-gray-600">{request.userEmail || request.profile?.email || 'Email não disponível'}</p>
                                    </div>
                                  </div>
                                  <div className="mb-2 flex gap-2">
                                    <Badge className="bg-red-100 text-red-700 border-0">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Conta bloqueada
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-700 border-0">
                                      Solicitação pendente
                                    </Badge>
                                  </div>
                                  <p className="text-gray-700 mb-2">{request.reason}</p>
                                  <p className="text-gray-500 text-sm">
                                    {new Date(request.created_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-orange-600 hover:bg-orange-700" 
                                  onClick={() => handleApproveUnlockRequest(request.id, request.user_id)}
                                >
                                  <LockOpen className="h-4 w-4 mr-1" />
                                  Desbloquear
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1" 
                                  onClick={() => handleRejectUnlockRequest(request.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {/* Show locked users without pending requests */}
                        {users.filter(u => {
                          if (!u.is_locked) return false;
                          // Check if user has a pending unlock request
                          const hasPendingRequest = unlockRequests.some(r => 
                            r.user_id === u.id && r.status === 'pending'
                          );
                          return !hasPendingRequest;
                        }).map((user) => (
                          <Card key={user.id} className="bg-orange-50 border-orange-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-orange-200 text-orange-700">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-gray-900">{user.name}</p>
                                      <p className="text-gray-600">{user.email}</p>
                                    </div>
                                  </div>
                                  <div className="mb-2 flex gap-2">
                                    <Badge className="bg-red-100 text-red-700 border-0">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Conta bloqueada
                                    </Badge>
                                    {user.failed_login_attempts && user.failed_login_attempts > 0 && (
                                      <Badge className="bg-yellow-100 text-yellow-700 border-0">
                                        {user.failed_login_attempts} tentativas falhas
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-700 mb-2">Conta bloqueada automaticamente por múltiplas tentativas de login incorretas</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  className="flex-1 bg-orange-600 hover:bg-orange-700" 
                                  onClick={() => handleUnlockUser(user.id)}
                                >
                                  <LockOpen className="h-4 w-4 mr-1" />
                                  Desbloquear
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Histórico de Desbloqueios */}
                {unlockRequests.filter(r => r.status !== 'pending').length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-gray-900">Histórico de Desbloqueios</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {unlockRequests.filter(r => r.status !== 'pending').map((request) => (
                          <div key={request.id} className="p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-900">{request.profile?.name || 'Usuário'}</p>
                                <p className="text-gray-600 text-sm">{request.profile?.email || 'Email não disponível'}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <Badge className={
                                request.status === 'approved' 
                                  ? 'bg-green-100 text-green-700 border-0'
                                  : 'bg-red-100 text-red-700 border-0'
                              }>
                                {request.status === 'approved' ? 'Desbloqueado' : 'Rejeitado'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}