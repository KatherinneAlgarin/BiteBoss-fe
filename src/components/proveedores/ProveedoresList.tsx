import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Loader2, AlertCircle, MoreVertical, Pencil, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import { useProveedores } from '../../hooks/useProveedores';
import { ConfirmModal } from '../ui/ConfirmModal';
import type { ProveedorListItem } from '../../types/proveedor.types';

interface ActionMenuProps {
  proveedor: ProveedorListItem;
  onEdit: () => void;
  onToggleActivo: () => void;
}

function ActionMenu({ proveedor, onEdit, onToggleActivo }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.right - 160 });
    setOpen(o => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="Acciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 160 }}
          className="bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden"
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <Pencil className="w-4 h-4 flex-shrink-0" />
            Editar
          </button>
          <div className="border-t border-gray-100 mx-2" />
          <button
            onClick={() => { setOpen(false); onToggleActivo(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
              proveedor.activo
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {proveedor.activo
              ? <ToggleLeft className="w-4 h-4 flex-shrink-0" />
              : <ToggleRight className="w-4 h-4 flex-shrink-0" />
            }
            {proveedor.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

interface ProveedoresListProps {
  onCreate: () => void;
  onEdit: (proveedor: ProveedorListItem) => void;
}

export function ProveedoresList({ onCreate, onEdit }: ProveedoresListProps) {
  const { proveedores, loading, error, refetch, updateProveedor } = useProveedores();
  const [busqueda, setBusqueda] = useState('');
  const [soloActivos, setSoloActivos] = useState(true);
  const [pendingToggle, setPendingToggle] = useState<ProveedorListItem | null>(null);

  const proveedoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return proveedores.filter(p => {
      if (soloActivos && !p.activo) return false;
      if (!q) return true;
      return (
        p.nombre.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        (p.telefono ?? '').toLowerCase().includes(q)
      );
    });
  }, [proveedores, busqueda, soloActivos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Cargando proveedores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar proveedores: {error}</span>
        </div>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900 shrink-0">Proveedores</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar proveedor..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!soloActivos}
              onChange={e => setSoloActivos(!e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
            />
            Mostrar inactivos
          </label>

          <span className="text-xs text-gray-400 ml-auto">
            {proveedoresFiltrados.length} resultado{proveedoresFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {proveedoresFiltrados.length === 0 ? (
          <div className="text-center py-12">
            {proveedores.length === 0 ? (
              <>
                <p className="text-gray-500 mb-4">No hay proveedores registrados</p>
                <button
                  onClick={onCreate}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear el primero
                </button>
              </>
            ) : (
              <p className="text-gray-500">Sin resultados para tu búsqueda</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proveedoresFiltrados.map((proveedor) => (
                  <tr key={proveedor.id_proveedor} className={`hover:bg-gray-50 ${!proveedor.activo ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proveedor.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proveedor.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proveedor.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {proveedor.direccion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        proveedor.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActionMenu
                        proveedor={proveedor}
                        onEdit={() => onEdit(proveedor)}
                        onToggleActivo={() => setPendingToggle(proveedor)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={pendingToggle !== null}
        title={pendingToggle?.activo ? 'Desactivar proveedor' : 'Activar proveedor'}
        message={
          pendingToggle?.activo
            ? `¿Estás seguro de desactivar a "${pendingToggle?.nombre}"? No aparecerá disponible para nuevos pedidos.`
            : `¿Estás seguro de activar a "${pendingToggle?.nombre}"?`
        }
        confirmLabel={pendingToggle?.activo ? 'Sí, desactivar' : 'Sí, activar'}
        variant={pendingToggle?.activo ? 'danger' : 'warning'}
        onConfirm={async () => {
          await updateProveedor(pendingToggle!.id_proveedor, { activo: !pendingToggle!.activo });
          setPendingToggle(null);
        }}
        onCancel={() => setPendingToggle(null)}
      />
    </>
  );
}
