import { useState, useEffect } from 'react';
import { Edit2, Users, Search, Filter } from 'lucide-react';
import type { UsuarioListItem, RolItem } from '../../types/usuario.types';
import type { SucursalItem } from '../../types/sucursal.types';
import { formatRoleLabel, normalizeRole } from '../../lib/roles';
import type { UserRole } from '../../types/auth.types';
import { useAuth } from '../../hooks/useAuth';
import { TableErrorState } from '../ui/TableErrorState';
import { TableEmptyState } from '../ui/TableEmptyState';
import { TableLoadingState } from '../ui/TableLoadingState';

interface UsuariosListProps {
  usuarios: UsuarioListItem[];
  roles: RolItem[];
  sucursales: SucursalItem[];
  loading: boolean;
  error: string | null;
  onEdit: (usuario: UsuarioListItem) => void;
  onSearch: (search: string, idRol?: number, idSucursal?: number) => void;
  onRefetch: () => void;
}

const ROLE_BADGE: Record<UserRole, string> = {
  admin:   'bg-purple-100 text-purple-700',
  cajero:  'bg-green-100 text-green-700',
  mesero:  'bg-orange-100 text-orange-700',
  gerente: 'bg-blue-100 text-blue-700',
};

function roleBadgeClass(rol: string): string {
  const normalizedRole = normalizeRole(rol);
  return normalizedRole ? ROLE_BADGE[normalizedRole] : 'bg-gray-100 text-gray-700';
}

export function UsuariosList({
  usuarios,
  roles,
  sucursales,
  loading,
  error,
  onEdit,
  onSearch,
  onRefetch,
}: UsuariosListProps) {
  const { session } = useAuth();
  const currentUserEmail = session?.user?.email;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRol, setSelectedRol] = useState<number | undefined>(undefined);
  const [selectedSucursal, setSelectedSucursal] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Trigger search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm, selectedRol, selectedSucursal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedRol, selectedSucursal, onSearch]);

  if (error) {
    return <TableErrorState message={`Error al cargar usuarios: ${error}`} onRetry={onRefetch} />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
              ${showFilters
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select
                value={selectedRol ?? ''}
                onChange={(e) => setSelectedRol(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Todos los roles</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{formatRoleLabel(r.nombre)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sucursal</label>
              <select
                value={selectedSucursal ?? ''}
                onChange={(e) => setSelectedSucursal(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Todas las sucursales</option>
                {sucursales.map(s => (
                  <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <TableLoadingState message="Cargando usuarios..." />
        ) : usuarios.length === 0 ? (
          <TableEmptyState
            message="No hay usuarios que coincidan con los filtros"
            icon={<Users className="h-12 w-12" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Correo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Rol</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Sucursal</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map(u => {
                  const isCurrentUser = u.email === currentUserEmail;
                  return (
                    <tr key={u.id_usuario} className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'opacity-60 pointer-events-none' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(u.rol)}`}>
                          {formatRoleLabel(u.rol)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.sucursal}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onEdit(u)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                          disabled={isCurrentUser}
                        >
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-500">
        {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
