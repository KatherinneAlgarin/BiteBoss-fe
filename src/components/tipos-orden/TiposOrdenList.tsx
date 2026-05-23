import { useState } from 'react';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
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

  // Crear nodos
  tipos.forEach(tipo => {
    map.set(tipo.id_tipo_orden, { ...tipo, hijos: [] });
  });

  // Construir jerarquía
  tipos.forEach(tipo => {
    const node = map.get(tipo.id_tipo_orden)!;
    if (tipo.id_tipo_orden_padre) {
      const parent = map.get(tipo.id_tipo_orden_padre);
      if (parent) {
        parent.hijos.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function TipoOrdenRow({
  tipo,
  level = 0,
  onEdit,
  onDeactivate,
  onActivate,
  busyId,
  activatingId,
  setConfirming,
  setConfirmError,
  handleActivate,
}: {
  tipo: TipoOrdenNode;
  level: number;
  onEdit: (tipo: TipoOrdenItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
  busyId: number | null;
  activatingId: number | null;
  setConfirming: (tipo: TipoOrdenItem) => void;
  setConfirmError: (error: string | null) => void;
  handleActivate: (t: TipoOrdenItem) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const hasHijos = tipo.hijos.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            {hasHijos && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mr-2 text-gray-400 hover:text-gray-600"
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasHijos && level > 0 && <ChevronRight className="w-4 h-4 mr-2 text-gray-400" />}
            {tipo.nombre}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {tipo.nombre_padre ?? '—'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            tipo.requiere_mesa
              ? 'bg-orange-100 text-orange-800'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {tipo.requiere_mesa ? 'Sí' : 'No'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            tipo.activo
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {tipo.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <button
            onClick={() => onEdit(tipo)}
            className="text-orange-600 hover:text-orange-800 inline-flex items-center"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </button>
          {tipo.activo ? (
            <button
              onClick={() => { setConfirming(tipo); setConfirmError(null); }}
              disabled={busyId === tipo.id_tipo_orden}
              className="text-amber-700 hover:text-amber-900 inline-flex items-center disabled:opacity-50"
            >
              <Power className="w-4 h-4 mr-1" />
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => handleActivate(tipo)}
              disabled={activatingId === tipo.id_tipo_orden}
              className="text-green-600 hover:text-green-800 inline-flex items-center disabled:opacity-50"
            >
              {activatingId === tipo.id_tipo_orden
                ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                : <PowerOff className="w-4 h-4 mr-1" />}
              Activar
            </button>
          )}
        </td>
      </tr>
      {hasHijos && expanded && tipo.hijos.map(hijo => (
        <TipoOrdenRow
          key={hijo.id_tipo_orden}
          tipo={hijo}
          level={level + 1}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onActivate={onActivate}
          busyId={busyId}
          activatingId={activatingId}
          setConfirming={setConfirming}
          setConfirmError={setConfirmError}
          handleActivate={handleActivate}
        />
      ))}
    </>
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
      
      // Detectar si es un error de padre inactivo
      if (errorMsg.includes('padre') && t.id_tipo_orden_padre && t.nombre_padre) {
        const parentType: TipoOrdenItem = {
          id_tipo_orden: t.id_tipo_orden_padre,
          nombre: t.nombre_padre,
          id_tipo_orden_padre: null,
          nombre_padre: null,
          requiere_mesa: false,
          activo: false,
        };
        setParentError({ child: t, parent: parentType });
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
        <button
          onClick={onRefetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
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
          <button onClick={() => setActivateError(null)} className="text-red-700 hover:text-red-900 ml-4">×</button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tipos de Orden</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Orden
          </button>
        </div>

        {tipos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay tipos de orden registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo padre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requiere mesa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tipoTree.map((tipo) => (
                  <TipoOrdenRow
                    key={tipo.id_tipo_orden}
                    tipo={tipo}
                    level={0}
                    onEdit={onEdit}
                    onDeactivate={onDeactivate}
                    onActivate={onActivate}
                    busyId={busyId}
                    activatingId={activatingId}
                    setConfirming={setConfirming}
                    setConfirmError={setConfirmError}
                    handleActivate={handleActivate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirming && (
        <ModalShell title="Desactivar tipo de orden" onClose={() => { setConfirming(null); setConfirmError(null); }} maxWidthClass="max-w-md">
            <div className="px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar tipo de orden</h2>
              <p className="text-sm text-gray-700">
                ¿Seguro que quieres desactivar <span className="font-semibold">"{confirming.nombre}"</span>? Podrás volver a activarlos más adelante desde la lista.
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
        <ModalShell title="Tipo de orden padre inactivo" onClose={() => setParentError(null)} maxWidthClass="max-w-md">
            <div className="px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipo de orden padre inactivo</h2>
              <p className="text-sm text-gray-700 mb-2">
                No puedes activar <span className="font-semibold">"{parentError.child.nombre}"</span> porque su tipo padre <span className="font-semibold">"{parentError.parent.nombre}"</span> está inactivo.
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
