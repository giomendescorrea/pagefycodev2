import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { X, Heart, MessageCircle, UserPlus, Star, CheckCheck } from 'lucide-react';
import { Notification } from '../App';
import { ScrollArea } from './ui/scroll-area';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({ 
  notifications, 
  onClose, 
  onMarkAsRead,
  onMarkAllAsRead 
}: NotificationPanelProps) {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-[#348e91]" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 max-w-md mx-auto" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-gray-900">Notificações</h2>
            {notifications.filter(n => !n.read).length > 0 && (
              <p className="text-gray-600">
                {notifications.filter(n => !n.read).length} não lida(s)
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.filter(n => !n.read).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
              >
                <CheckCheck className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    notification.read ? 'bg-white' : 'bg-[#e8f5f5]'
                  }`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(notification.userName || 'Sistema')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-gray-900">{notification.title}</p>
                          {getIcon(notification.type)}
                        </div>
                        <p className="text-gray-600">{notification.description}</p>
                        <p className="text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}