import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar, type SidebarData } from './Sidebar';
import type { UserRole } from '../../types/auth.types';

export interface DashboardUser {
  name: string;
  email: string;
  role: UserRole;
}

interface DashboardLayoutProps {
  user: DashboardUser;
  data: SidebarData;
  onLogout: () => Promise<void>;
  children: ReactNode;
}

export function DashboardLayout({ user, data, onLogout, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
      // ProtectedRoute redirige automáticamente al detectar !isAuthenticated
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
        data={data}
        onLogout={handleLogout}
        isLoggingOut={loggingOut}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🍽️</span>
            <span className="font-bold text-orange-500">BiteBoss</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
