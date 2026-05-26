import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle, MoreVertical, UtensilsCrossed } from 'lucide-react';
import type { TipoOrdenItem } from '../../types/tipo-orden.types';
import { ModalShell } from '../ui/ModalShell';

interface TiposOrdenListProps {
  tipos: TipoOrdenItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (tipo: TipoOrdenItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
}

interface TipoOrdenNode extends TipoOrdenItem {
  hijos: TipoOrdenNode[];
}

function buildTipoOrdenTree(tipos: TipoOrdenItem[]): TipoOrdenNode[] {
  const map = new Map<number, TipoOrdenNode>();
  const roots: TipoOrdenNode[] = [];

  tipos.forEach(tipo => map.set(tipo.id_tipo_orden, { ...tipo, hijos: [] }));
  tipos.forEach(tipo => {
    const node = map.get(tipo.id_tipo_orden)!;
    if (tipo.id_tipo_orden_padre) {
      map.get(tipo.id_tipo_orden_padre)?.hijos.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

interface MenuPos { top: number; left: number }

function ActionMenu({
  tipo,
  onEdit,
  onDesactivar,
  onActivar,
  loadingId,
}: {
  tipo: TipoOrdenItem;
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
          {tipo.activo ? (
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

function TipoOrdenCard({
  tipo,
  onEdit,
  onDesactivar,
  onActivar,
  busyId,
  activatingId,
}: {
  tipo: TipoOrdenNode;
  onEdit: (t: TipoOrdenItem) => void;
  onDesactivar: (t: TipoOrdenItem) => void;
  onActivar: (t: TipoOrdenItem) => void;
  busyId: number | null;
  activatingId: number | null;
}) {
  const isParent = !tipo.id_tipo_orden_padre;
  const hasHijos = tipo.hijos.length > 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Card padre */}
      <div className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
        tipo.activo ? 'bg-white' : 'bg-gray-50'
      } ${isParent
        ? 'border-l-4 border-l-orange-400 border-t border-r border-b border-gray-200'
        : 'border border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            {isParent && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-500">
                Tipo principal
              </span>
            )}
            <span className={`text-base font-semibold leading-snug truncate ${tipo.activo ? 'text-gray-900' : 'text-gray-400'}`}>
              {tipo.nombre}
            </span>
          </div>
          <ActionMenu
            tipo={tipo}
            onEdit={() => onEdit(tipo)}
            onDesactivar={() => onDesactivar(tipo)}
            onActivar={() => onActivar(tipo)}
            loadingId={busyId === tipo.id_tipo_orden || activatingId === tipo.id_tipo_orden}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {tipo.requiere_mesa && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              <UtensilsCrossed className="w-3 h-3" />
              Requiere mesa
            </span>
          )}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            tipo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
          }`}>
            {tipo.activo ? 'Activo' : 'Inactivo'}
          </span>
          {hasHijos && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
              {tipo.hijos.length} subtipo{tipo.hijos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Subtipos anidados */}
      {hasHijos && (
        <div className="ml-5 pl-3 border-l-2 border-slate-200 flex flex-col gap-2">
          {tipo.hijos.map(hijo => (
            <TipoOrdenCard
              key={hijo.id_tipo_orden}
              tipo={hijo}
              onEdit={onEdit}
              onDesactivar={onDesactivar}
              onActivar={onActivar}
              busyId={busyId}
              activatingId={activatingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TiposOrdenList({
  tipos,
  loading,
  error,
  onRefetch,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
}: TiposOrdenListProps) {
  const [confirming, setConfirming] = useState<TipoOrdenItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [parentError, setParentError] = useState<{ child: TipoOrdenItem; parent: TipoOrdenItem } | null>(null);
  const [activatingParent, setActivatingParent] = useState(false);

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.id_tipo_orden);
      setConfirmError(null);
      await onDeactivate(confirming.id_tipo_orden);
      setConfirming(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (t: TipoOrdenItem) => {
    try {
      setActivatingId(t.id_tipo_orden);
      setActivateError(null);
      await onActivate(t.id_tipo_orden);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      if (errorMsg.includes('padre') && t.id_tipo_orden_padre && t.nombre_padre) {
        setParentError({
          child: t,
          parent: { id_tipo_orden: t.id_tipo_orden_padre, nombre: t.nombre_padre, id_tipo_orden_padre: null, nombre_padre: null, requiere_mesa: false, activo: false },
        });
      } else {
        setActivateError(errorMsg);
      }
    } finally {
      setActivatingId(null);
    }
  };

  const handleActivateParent = async () => {
    if (!parentError) return;
    try {
      setActivatingParent(true);
      await onActivate(parentError.parent.id_tipo_orden);
      setParentError(null);
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActivatingParent(false);
    }
  };

  const tipoTree = buildTipoOrdenTree(tipos);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Cargando tipos de orden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar tipos de orden: {error}</span>
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

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tipos de Orden</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Orden
          </button>
        </div>

        {tipos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No hay tipos de orden registrados</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tipoTree.map((tipo) => (
              <TipoOrdenCard
                key={tipo.id_tipo_orden}
                tipo={tipo}
                onEdit={onEdit}
                onDesactivar={(t) => { setConfirming(t); setConfirmError(null); }}
                onActivar={handleActivate}
                busyId={busyId}
                activatingId={activatingId}
              />
            ))}
          </div>
        )}
      </div>

      {confirming && (
        <ModalShell
          title="Desactivar tipo de orden"
          onClose={() => { setConfirming(null); setConfirmError(null); }}
          maxWidthClass="max-w-md"
        >
          <div className="px-6 py-5">
            <p className="text-sm text-gray-700">
              ¿Seguro que quieres desactivar <span className="font-semibold">"{confirming.nombre}"</span>?
              Podrás volver a activarlo más adelante.
            </p>

            {confirmError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {confirmError}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => { setConfirming(null); setConfirmError(null); }}
                disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 flex items-center"
              >
                {busyId !== null && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Desactivar
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {parentError && (
        <ModalShell
          title="Tipo de orden padre inactivo"
          onClose={() => setParentError(null)}
          maxWidthClass="max-w-md"
        >
          <div className="px-6 py-5">
            <p className="text-sm text-gray-700 mb-2">
              No puedes activar <span className="font-semibold">"{parentError.child.nombre}"</span> porque su tipo padre{' '}
              <span className="font-semibold">"{parentError.parent.nombre}"</span> está inactivo.
            </p>
            <p className="text-sm text-gray-600">
              ¿Deseas activar también el tipo padre? Esto activará automáticamente todos sus subtipos.
            </p>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setParentError(null)}
                disabled={activatingParent}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActivateParent}
                disabled={activatingParent}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 flex items-center"
              >
                {activatingParent && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Activar padre
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}
