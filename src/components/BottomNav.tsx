import { Home, Search, User, BookMarked, Menu } from 'lucide-react';

export type NavView = 'home' | 'search' | 'profile' | 'shelf' | 'menu';

interface BottomNavProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home' as NavView, icon: Home, label: 'Início' },
    { id: 'search' as NavView, icon: Search, label: 'Busca' },
    { id: 'shelf' as NavView, icon: BookMarked, label: 'Estante' },
    { id: 'profile' as NavView, icon: User, label: 'Perfil' },
    { id: 'menu' as NavView, icon: Menu, label: 'Menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 safe-area-bottom z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors active:scale-95 ${
                isActive ? 'text-[#1e3a8a]' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}