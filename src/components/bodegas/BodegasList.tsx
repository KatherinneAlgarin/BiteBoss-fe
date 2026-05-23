import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle, AlertTriangle, MoreVertical } from 'lucide-react';
import type { BodegaItem } from '../../types/bodega.types';
import { TIPOS_BODEGA } from '../../types/bodega.types';
import { ModalShell } from '../ui/ModalShell';

interface BodegasListProps {
  bodegas: BodegaItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (bodega: BodegaItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
  onCheckStock: (id: number) => Promise<{ tiene_stock: boolean }>;
}

function labelTipo(tipo: string): string {
  return TIPOS_BODEGA.find(t => t.value === tipo)?.label ?? tipo;
}

interface MenuPos { top: number; left: number }

function ActionMenu({
  bodega,
  onEdit,
  onDesactivar,
  onActivar,
  loadingId,
}: {
  bodega: BodegaItem;
  onEdit: () => void;
  onDesactivar: () => void;
  onActivar: () => void;
  loadingId: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideBtn = btnRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideBtn && !insideMenu) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.right - 176 });
    setOpen(o => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loadingId}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors"
      >
        {loadingId
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 176 }}
          className="bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden"
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <Edit className="w-4 h-4 flex-shrink-0" />
            Editar
          </button>

          <div className="border-t border-gray-100 mx-2" />

          {bodega.activo ? (
            <button
              onClick={() => { setOpen(false); onDesactivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Power className="w-4 h-4 flex-shrink-0" />
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => { setOpen(false); onActivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors"
            >
              <PowerOff className="w-4 h-4 flex-shrink-0" />
              Activar
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export function BodegasList({
  bodegas,
  loading,
  error,
  onRefetch,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
  onCheckStock,
}: BodegasListProps) {
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [confirmando, setConfirmando] = useState<{ bodega: BodegaItem } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const handleDesactivarClick = async (b: BodegaItem) => {
    try {
      setCheckingId(b.id_bodega);
      setGenericError(null);
      const { tiene_stock } = await onCheckStock(b.id_bodega);
      if (!tiene_stock) {
        setBusyId(b.id_bodega);
        await onDeactivate(b.id_bodega);
        setBusyId(null);
      } else {
        setConfirmando({ bodega: b });
        setConfirmError(null);
      }
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : 'Error al verificar stock');
    } finally {
      setCheckingId(null);
    }
  };

  const handleActivarClick = async (b: BodegaItem) => {
    try {
      setActivatingId(b.id_bodega);
      setGenericError(null);
      await onActivate(b.id_bodega);
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : 'Error al activar bodega');
    } finally {
      setActivatingId(null);
    }
  };

  const handleConfirmar = async () => {
    if (!confirmando) return;
    try {
      setBusyId(confirmando.bodega.id_bodega);
      setConfirmError(null);
      await onDeactivate(confirmando.bodega.id_bodega);
      setConfirmando(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Cargando bodegas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar bodegas: {error}</span>
        </div>
        <button onClick={onRefetch} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {genericError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{genericError}</span>
          <button onClick={() => setGenericError(null)} className="text-red-700 hover:text-red-900 ml-4">×</button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Bodegas</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Bodega
          </button>
        </div>

        {bodegas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay bodegas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bodegas.map((b) => (
                  <tr key={b.id_bodega} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{labelTipo(b.tipo)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{b.descripcion ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{b.sucursal ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        b.activo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {b.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <ActionMenu
                        bodega={b}
                        onEdit={() => onEdit(b)}
                        onDesactivar={() => handleDesactivarClick(b)}
                        onActivar={() => handleActivarClick(b)}
                        loadingId={checkingId === b.id_bodega || busyId === b.id_bodega || activatingId === b.id_bodega}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmando && (
        <ModalShell title="Desactivar bodega" onClose={() => { setConfirmando(null); setConfirmError(null); }} maxWidthClass="max-w-md">
            <div className="px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar bodega</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Esta bodega tiene productos con stock activo.</p>
                  <p className="mt-1 text-amber-700">¿Desea desactivarla de todas formas?</p>
                </div>
              </div>
              {confirmError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                  {confirmError}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setConfirmando(null); setConfirmError(null); }}
                  disabled={busyId !== null}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmar}
                  disabled={busyId !== null}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 flex items-center"
                >
                  {busyId !== null && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Desactivar de todas formas
                </button>
              </div>
            </div>
        </ModalShell>
      )}
    </>
  );
}
