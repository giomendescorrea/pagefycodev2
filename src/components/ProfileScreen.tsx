import { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { User as UserType } from '../App';
import { Edit2, Users, UserPlus, UserCheck, Lock, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import logoIcon from 'figma:asset/52156acc301f7deb215318a5ad8c77764dbb9d14.png';

interface ProfileScreenProps {
  user: UserType;
  onUpdateProfile: (name: string, email: string, bio?: string) => void;
  onTogglePrivacy?: () => void;
  followersCount: number;
  followingCount: number;
  followersList?: { id: string; name: string }[];
  followingList?: { id: string; name: string }[];
  onFollow?: (userId: string, userName: string) => void;
  isFollowing?: (userId: string) => boolean;
  userBooks?: { book: { id: string; title: string; author: string; cover_url?: string }; status: string; date_added: string }[];
  onBookSelect?: (book: any) => void;
}

export function ProfileScreen({ 
  user, 
  onUpdateProfile,
  onTogglePrivacy,
  followersCount, 
  followingCount,
  followersList = [],
  followingList = [],
  onFollow,
  isFollowing
}: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

  const handleSave = () => {
    onUpdateProfile(name, email, bio);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setEmail(user.email);
    setBio(user.bio || '');
    setIsEditing(false);
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
      <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                  <AvatarFallback className="text-lg sm:text-xl">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-gray-900 truncate">{user.name}</h2>
                  <p className="text-gray-600 text-sm truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-[#e8f5f5] text-[#1c5052] rounded text-xs sm:text-sm">
                      {user.role === 'admin' ? 'Administrador' : user.role === 'publisher' ? 'Publicador' : 'Leitor'}
                    </span>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="flex-shrink-0">
                  <Edit2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">Salvar</Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">Cancelar</Button>
                </div>
              </div>
            ) : (
              <>
                {bio && <p className="text-gray-700 mt-4">{bio}</p>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setShowFollowersDialog(true)}>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-[#348e91]" />
              <p className="text-gray-900">{followersCount}</p>
              <p className="text-gray-600">Seguidores</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setShowFollowingDialog(true)}>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-gray-900">{followingCount}</p>
              <p className="text-gray-600">Seguindo</p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Settings */}
        {onTogglePrivacy && (
          <Card>
            <CardHeader>
              <h3 className="text-gray-900">Configurações de Privacidade</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.isPrivate ? (
                    <Lock className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Globe className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="text-gray-900">Perfil Privado</p>
                    <p className="text-gray-600">
                      {user.isPrivate 
                        ? 'Suas resenhas e comentários são privados'
                        : 'Suas resenhas e comentários são públicos'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={user.isPrivate || false}
                  onCheckedChange={onTogglePrivacy}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Followers Dialog */}
      <Dialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seguidores ({followersCount})</DialogTitle>
            <DialogDescription>
              Pessoas que seguem você
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {followersList.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum seguidor ainda</p>
            ) : (
              followersList.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(follower.name)}</AvatarFallback>
                    </Avatar>
                    <p className="text-gray-900">{follower.name}</p>
                  </div>
                  {onFollow && isFollowing && follower.id !== user.id && (
                    <Button
                      size="sm"
                      variant={isFollowing(follower.id) ? 'outline' : 'default'}
                      onClick={() => onFollow(follower.id, follower.name)}
                    >
                      {isFollowing(follower.id) ? (
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
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seguindo ({followingCount})</DialogTitle>
            <DialogDescription>
              Pessoas que você segue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {followingList.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Você não está seguindo ninguém ainda</p>
            ) : (
              followingList.map((following) => (
                <div key={following.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(following.name)}</AvatarFallback>
                    </Avatar>
                    <p className="text-gray-900">{following.name}</p>
                  </div>
                  {onFollow && isFollowing && following.id !== user.id && (
                    <Button
                      size="sm"
                      variant={isFollowing(following.id) ? 'outline' : 'default'}
                      onClick={() => onFollow(following.id, following.name)}
                    >
                      {isFollowing(following.id) ? (
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
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}