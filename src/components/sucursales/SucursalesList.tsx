import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle, AlertTriangle, MoreVertical, MapPin } from 'lucide-react';
import type { SucursalItem, DependenciasSucursal } from '../../types/sucursal.types';
import { ModalShell } from '../ui/ModalShell';

interface SucursalesListProps {
  sucursales: SucursalItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (sucursal: SucursalItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
  onFetchDependencias: (id: number) => Promise<DependenciasSucursal>;
}

interface ConfirmState {
  sucursal: SucursalItem;
  dependencias: DependenciasSucursal;
}

interface MenuPos { top: number; left: number }

function ActionMenu({
  sucursal,
  onEdit,
  onDesactivar,
  onActivar,
  loadingId,
}: {
  sucursal: SucursalItem;
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
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
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
          {sucursal.activo ? (
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

export function SucursalesList({
  sucursales,
  loading,
  error,
  onRefetch,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
  onFetchDependencias,
}: SucursalesListProps) {
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<ConfirmState | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const handleDeactivateClick = async (s: SucursalItem) => {
    try {
      setCheckingId(s.id_sucursal);
      setGenericError(null);
      const dependencias = await onFetchDependencias(s.id_sucursal);
      setConfirming({ sucursal: s, dependencias });
      setConfirmError(null);
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : 'Error al consultar dependencias');
    } finally {
      setCheckingId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.sucursal.id_sucursal);
      setConfirmError(null);
      await onDeactivate(confirming.sucursal.id_sucursal);
      setConfirming(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (s: SucursalItem) => {
    try {
      setActivatingId(s.id_sucursal);
      setActivateError(null);
      await onActivate(s.id_sucursal);
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Cargando sucursales...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar sucursales: {error}</span>
        </div>
        <button onClick={onRefetch} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {(activateError || genericError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{activateError ?? genericError}</span>
          <button
            onClick={() => { setActivateError(null); setGenericError(null); }}
            className="ml-4 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Sucursales</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sucursal
          </button>
        </div>

        {sucursales.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No hay sucursales registradas</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sucursales.map((s) => (
              <div
                key={s.id_sucursal}
                className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
                  s.activo ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-base font-semibold leading-snug ${s.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.nombre}
                  </span>
                  <ActionMenu
                    sucursal={s}
                    onEdit={() => onEdit(s)}
                    onDesactivar={() => handleDeactivateClick(s)}
                    onActivar={() => handleActivate(s)}
                    loadingId={checkingId === s.id_sucursal || busyId === s.id_sucursal || activatingId === s.id_sucursal}
                  />
                </div>

                {s.direccion && (
                  <p className="flex items-start gap-1.5 text-xs text-gray-500 leading-snug">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-400" />
                    {s.direccion}
                  </p>
                )}

                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    s.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirming && (
        <DeactivateDialog
          state={confirming}
          loading={busyId === confirming.sucursal.id_sucursal}
          error={confirmError}
          onConfirm={handleConfirm}
          onCancel={() => { setConfirming(null); setConfirmError(null); }}
        />
      )}
    </>
  );
}

interface DeactivateDialogProps {
  state: ConfirmState;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeactivateDialog({ state, loading, error, onConfirm, onCancel }: DeactivateDialogProps) {
  const { sucursal, dependencias } = state;
  const bloqueado = !dependencias.puede_desactivar;
  const requiereEliminar = dependencias.requiere_eliminar_zonas;

  return (
    <ModalShell
      title={bloqueado ? 'No se puede desactivar' : 'Desactivar sucursal'}
      onClose={onCancel}
      maxWidthClass="max-w-md"
    >
      <div className="px-6 py-5">
        {bloqueado ? (
          <p className="text-sm text-gray-700">
            La sucursal <span className="font-semibold">"{sucursal.nombre}"</span> tiene
            información activa asociada y no puede desactivarse en este momento.
          </p>
        ) : requiereEliminar ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Las zonas y mesas asociadas se eliminarán</p>
                <p className="mt-1 text-amber-700 text-xs">
                  Si reactivas la sucursal después, deberás crear nuevamente sus zonas y mesas.
                </p>
              </div>
            </div>
            <p>¿Confirmas desactivar <span className="font-semibold">"{sucursal.nombre}"</span>?</p>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            ¿Seguro que quieres desactivar <span className="font-semibold">"{sucursal.nombre}"</span>?
            Podrás volver a activarla más adelante.
          </p>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            {bloqueado ? 'Entendido' : 'Cancelar'}
          </button>
          {!bloqueado && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Desactivar
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
