import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Power, PowerOff, Loader2, AlertTriangle, MoreVertical } from 'lucide-react';
import type { IngredienteItem, EnUsoIngrediente } from '../../types/ingrediente.types';
import { ModalShell } from '../ui/ModalShell';
import { TableErrorState } from '../ui/TableErrorState';
import { TableEmptyState } from '../ui/TableEmptyState';
import { TableLoadingState } from '../ui/TableLoadingState';

interface IngredientesListProps {
  ingredientes: IngredienteItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (i: IngredienteItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
  onCheckEnUso: (id: number) => Promise<EnUsoIngrediente>;
}

interface MenuPos { top: number; left: number }

function ActionMenu({ item, onEdit, onDesactivar, onActivar, loadingId }: {
  item: IngredienteItem;
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
    setPos({ top: r.bottom + 4, left: r.right - 176 });
    setOpen(o => !o);
  };

  return (
    <>
      <button ref={btnRef} onClick={handleOpen} disabled={loadingId}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors">
        {loadingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open && createPortal(
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 176 }}
          className="bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
          <button onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <Edit className="w-4 h-4 shrink-0" /> Editar
          </button>
          <div className="border-t border-gray-100 mx-2" />
          {item.activo ? (
            <button onClick={() => { setOpen(false); onDesactivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors">
              <Power className="w-4 h-4 shrink-0" /> Desactivar
            </button>
          ) : (
            <button onClick={() => { setOpen(false); onActivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors">
              <PowerOff className="w-4 h-4 shrink-0" /> Activar
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export function IngredientesList({ ingredientes, loading, error, onRefetch, onCreate, onEdit, onDeactivate, onActivate, onCheckEnUso }: IngredientesListProps) {
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [confirmando, setConfirmando] = useState<{ item: IngredienteItem; enUso: EnUsoIngrediente } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const handleDesactivar = async (item: IngredienteItem) => {
    try {
      setCheckingId(item.id_ingrediente);
      setGenericError(null);
      const enUso = await onCheckEnUso(item.id_ingrediente);
      if (!enUso.en_uso) {
        setBusyId(item.id_ingrediente);
        await onDeactivate(item.id_ingrediente);
        setBusyId(null);
      } else {
        setConfirmando({ item, enUso });
        setConfirmError(null);
      }
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : 'Error al verificar uso');
    } finally {
      setCheckingId(null);
    }
  };

  const handleActivar = async (item: IngredienteItem) => {
    try {
      setActivatingId(item.id_ingrediente);
      setGenericError(null);
      await onActivate(item.id_ingrediente);
    } catch (err) {
      setGenericError(err instanceof Error ? err.message : 'Error al activar');
    } finally {
      setActivatingId(null);
    }
  };

  const handleConfirmar = async () => {
    if (!confirmando) return;
    try {
      setBusyId(confirmando.item.id_ingrediente);
      setConfirmError(null);
      await onDeactivate(confirmando.item.id_ingrediente);
      setConfirmando(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  if (error) return (
    <TableErrorState message={`Error al cargar ingredientes: ${error}`} onRetry={onRefetch} />
  );

  return (
    <>
      {genericError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{genericError}</span>
          <button onClick={() => setGenericError(null)} className="ml-4">×</button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Ingredientes</h2>
          <button onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Ingrediente
          </button>
        </div>

        {loading ? (
          <TableLoadingState message="Cargando ingredientes..." />
        ) : ingredientes.length === 0 ? (
          <TableEmptyState message="No hay ingredientes registrados" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad de medida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredientes.map(i => (
                  <tr key={i.id_ingrediente} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{i.unidad_medida}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${i.activo ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {i.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <ActionMenu
                        item={i}
                        onEdit={() => onEdit(i)}
                        onDesactivar={() => handleDesactivar(i)}
                        onActivar={() => handleActivar(i)}
                        loadingId={checkingId === i.id_ingrediente || busyId === i.id_ingrediente || activatingId === i.id_ingrediente}
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
        <ModalShell title="Desactivar ingrediente" onClose={() => { setConfirmando(null); setConfirmError(null); }} maxWidthClass="max-w-md">
          <div className="px-6 py-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar ingrediente</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Este ingrediente está en uso en los siguientes productos:</p>
                <ul className="mt-1 list-disc list-inside text-amber-700">
                  {confirmando.enUso.productos.map(p => <li key={p}>{p}</li>)}
                </ul>
                <p className="mt-2">¿Desea desactivarlo de todas formas?</p>
              </div>
            </div>
            {confirmError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">{confirmError}</div>
            )}
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setConfirmando(null); setConfirmError(null); }} disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleConfirmar} disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 flex items-center">
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
