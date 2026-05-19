import { type ElementType, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '../../types/auth.types';
import { LogOut, ChevronDown } from 'lucide-react';
import { formatRoleLabel } from '../../lib/roles';

export interface NavItem {
  title: string;
  url: string;
  icon: ElementType;
}

export interface NavGroup {
  title: string;
  icon: ElementType;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

export interface SidebarData {
  navMain: NavEntry[];
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin:   'bg-purple-100 text-purple-700',
  cajero:  'bg-green-100 text-green-700',
  mesero:  'bg-orange-100 text-orange-700',
  gerente: 'bg-blue-100 text-blue-700',
};

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  data: SidebarData;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  userName,
  userEmail,
  userRole,
  data,
  onLogout,
  isLoggingOut = false,
}: SidebarProps) {
  const location = useLocation();

  // Inicializar grupos abiertos: abierto si algún hijo está activo
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    data.navMain.forEach((entry, idx) => {
      if (isGroup(entry)) {
        initial[idx] = entry.children.some(c => location.pathname.startsWith(c.url));
      }
    });
    return initial;
  });

  const toggleGroup = (idx: number) => {
    setOpenGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <span className="text-xl font-bold text-orange-500">BiteBoss</span>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
          <p className="text-xs text-gray-500 truncate mb-2">{userEmail}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[userRole]}`}>
            {formatRoleLabel(userRole)}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {data.navMain.map((entry, idx) => {
            if (isGroup(entry)) {
              const Icon = entry.icon;
              const anyChildActive = entry.children.some(c => location.pathname.startsWith(c.url));
              const isOpen = openGroups[idx] ?? false;

              return (
                <div key={idx}>
                  <button
                    onClick={() => toggleGroup(idx)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${anyChildActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left">{entry.title}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                      {entry.children.map(child => {
                        const ChildIcon = child.icon;
                        const isActive = location.pathname === child.url;
                        return (
                          <Link
                            key={child.url}
                            to={child.url}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                              ${isActive
                                ? 'bg-orange-50 text-orange-600'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = entry.icon;
            const isActive = location.pathname === entry.url;
            return (
              <Link
                key={entry.url}
                to={entry.url}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {entry.title}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>
    </>
  );
}
