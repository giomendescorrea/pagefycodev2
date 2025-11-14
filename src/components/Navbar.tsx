import { BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { User } from '../App';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onBackToBooks?: () => void;
}

export function Navbar({ user, onLogout, onBackToBooks }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToBooks && (
              <Button variant="ghost" size="icon" onClick={onBackToBooks} className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#1e3a8a]" />
              <span className="text-[#1e3a8a]">Pagefy</span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onLogout} className="h-9 w-9">
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </nav>
  );
}