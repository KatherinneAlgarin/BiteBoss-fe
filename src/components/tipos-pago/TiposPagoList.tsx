import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle, MoreVertical } from 'lucide-react';
import type { TipoPagoItem, DependenciasDesactivacionTipoPago } from '../../types/tipo-pago.types';
import { ModalShell } from '../ui/ModalShell';

interface TiposPagoListProps {
  tipos: TipoPagoItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (tipo: TipoPagoItem) => void;
  onFetchDependenciasDesactivacion: (id: number) => Promise<DependenciasDesactivacionTipoPago>;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
}

interface MenuPos { top: number; left: number }

function ActionMenu({
  tipo,
  onEdit,
  onDesactivar,
  onActivar,
  loadingId,
}: {
  tipo: TipoPagoItem;
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
            <Edit className="w-4 h-4 shrink-0" />
            Editar
          </button>
          <div className="border-t border-gray-100 mx-2" />
          {tipo.activo ? (
            <button
              onClick={() => { setOpen(false); onDesactivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Power className="w-4 h-4 shrink-0" />
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => { setOpen(false); onActivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors"
            >
              <PowerOff className="w-4 h-4 shrink-0" />
              Activar
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export function TiposPagoList({
  tipos,
  loading,
  error,
  onRefetch,
  onCreate,
  onEdit,
  onFetchDependenciasDesactivacion,
  onDeactivate,
  onActivate,
}: TiposPagoListProps) {
  const [confirming, setConfirming] = useState<TipoPagoItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [loadingDependencias, setLoadingDependencias] = useState(false);
  const [dependencias, setDependencias] = useState<DependenciasDesactivacionTipoPago | null>(null);

  const handleOpenConfirm = async (tipo: TipoPagoItem) => {
    try {
      setConfirmError(null);
      setDependencias(null);
      setLoadingDependencias(true);
      const deps = await onFetchDependenciasDesactivacion(tipo.id_tipo_pago);
      setDependencias(deps);
      setConfirming(tipo);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingDependencias(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.id_tipo_pago);
      setConfirmError(null);
      await onDeactivate(confirming.id_tipo_pago);
      setConfirming(null);
      setDependencias(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (tipo: TipoPagoItem) => {
    try {
      setActivateError(null);
      setActivatingId(tipo.id_tipo_pago);
      await onActivate(tipo.id_tipo_pago);
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
        <span className="ml-2 text-gray-600">Cargando métodos de pago...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar métodos de pago: {error}</span>
        </div>
        <button onClick={onRefetch} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {activateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{activateError}</span>
          <button onClick={() => setActivateError(null)} className="ml-4 text-red-700 hover:text-red-900">×</button>
        </div>
      )}

      {confirmError && !confirming && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{confirmError}</span>
          <button onClick={() => setConfirmError(null)} className="ml-4 text-red-700 hover:text-red-900">×</button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Métodos de Pago</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Método de Pago
          </button>
        </div>

        {loadingDependencias && (
          <div className="px-6 py-3 text-sm text-gray-500 border-b border-gray-100 flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Validando impacto de desactivación...
          </div>
        )}

        {tipos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No hay métodos de pago registrados</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tipos.map((tipo) => (
              <div
                key={tipo.id_tipo_pago}
                className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
                  tipo.activo ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-base font-semibold leading-snug ${tipo.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                    {tipo.nombre}
                  </span>
                  <ActionMenu
                    tipo={tipo}
                    onEdit={() => onEdit(tipo)}
                    onDesactivar={() => handleOpenConfirm(tipo)}
                    onActivar={() => handleActivate(tipo)}
                    loadingId={busyId === tipo.id_tipo_pago || activatingId === tipo.id_tipo_pago}
                  />
                </div>

                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    tipo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {tipo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirming && (
        <ModalShell
          title="Desactivar método de pago"
          onClose={() => { setConfirming(null); setConfirmError(null); setDependencias(null); }}
          maxWidthClass="max-w-lg"
        >
          <div className="px-6 py-5">
            <p className="text-sm text-gray-700">
              Vas a desactivar <span className="font-semibold">"{confirming.nombre}"</span>.
            </p>

            {dependencias && (
              <div className="mt-4 space-y-3">
                <div className="text-sm text-gray-700">
                  Está activo en <span className="font-semibold">{dependencias.sucursales_activas_count}</span>{' '}
                  sucursal{dependencias.sucursales_activas_count !== 1 ? 'es' : ''}.
                </div>

                {dependencias.sucursales_sin_metodos.length > 0 ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    <p className="font-medium mb-1">No se puede desactivar.</p>
                    <p>Estas sucursales se quedarían sin métodos de pago activos:</p>
                    <ul className="list-disc list-inside mt-1">
                      {dependencias.sucursales_sin_metodos.map((s) => (
                        <li key={s.id_sucursal}>{s.nombre}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm">
                    Al confirmar, también se desactivarán automáticamente las asignaciones activas de este método
                    en todas las sucursales que lo tenían habilitado.
                  </div>
                )}
              </div>
            )}

            {confirmError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {confirmError}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => { setConfirming(null); setConfirmError(null); setDependencias(null); }}
                disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busyId !== null || (dependencias ? !dependencias.puede_desactivar : true)}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 inline-flex items-center"
              >
                {busyId !== null && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar desactivación
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}
