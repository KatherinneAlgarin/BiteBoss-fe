import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import type { TipoOrdenItem, DependenciasTipoOrden } from '../../types/tipo-orden.types';

interface TiposOrdenListProps {
  tipos: TipoOrdenItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (tipo: TipoOrdenItem) => void;
  onDelete: (id: number) => Promise<void>;
  onFetchDependencias: (id: number) => Promise<DependenciasTipoOrden>;
}

interface DeleteDialogState {
  tipo: TipoOrdenItem;
  dependencias: DependenciasTipoOrden;
}

export function TiposOrdenList({
  tipos,
  loading,
  error,
  onRefetch,
  onCreate,
  onEdit,
  onDelete,
  onFetchDependencias,
}: TiposOrdenListProps) {
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<DeleteDialogState | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const handleDeleteClick = async (tipo: TipoOrdenItem) => {
    try {
      setCheckingId(tipo.id_tipo_orden);
      setDialogError(null);
      const dependencias = await onFetchDependencias(tipo.id_tipo_orden);
      setDialog({ tipo, dependencias });
    } catch (err) {
      alert('Error al consultar dependencias: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setCheckingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!dialog) return;
    try {
      setDeletingId(dialog.tipo.id_tipo_orden);
      setDialogError(null);
      await onDelete(dialog.tipo.id_tipo_orden);
      setDialog(null);
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Error desconocido al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tipos de Orden</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Orden
          </button>
        </div>

        {tipos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay tipos de orden registrados</p>
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo padre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requiere mesa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tipos.map((tipo) => {
                  const esSubtipo = tipo.id_tipo_orden_padre !== null;
                  return (
                    <tr key={tipo.id_tipo_orden} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="inline-flex items-center">
                          {esSubtipo && <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />}
                          {tipo.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tipo.nombre_padre ?? '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tipo.requiere_mesa
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {tipo.requiere_mesa ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onEdit(tipo)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(tipo)}
                          disabled={checkingId === tipo.id_tipo_orden || deletingId === tipo.id_tipo_orden}
                          className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                        >
                          {checkingId === tipo.id_tipo_orden ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Eliminar
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

      {dialog && (
        <DeleteDialog
          state={dialog}
          loading={deletingId === dialog.tipo.id_tipo_orden}
          error={dialogError}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setDialog(null); setDialogError(null); }}
        />
      )}
    </>
  );
}

interface DeleteDialogProps {
  state: DeleteDialogState;
  loading: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteDialog({ state, loading, error, onConfirm, onCancel }: DeleteDialogProps) {
  const { tipo, dependencias } = state;
  const bloqueado = !dependencias.puede_eliminar;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {bloqueado ? 'No se puede eliminar' : 'Confirmar eliminación'}
          </h2>

          {bloqueado ? (
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                El tipo <span className="font-semibold">"{tipo.nombre}"</span> no puede eliminarse por las siguientes razones:
              </p>

              {dependencias.subtipos.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="font-medium text-yellow-800 mb-1">
                    Tiene {dependencias.subtipos.length} subtipo(s):
                  </p>
                  <ul className="list-disc list-inside text-yellow-700">
                    {dependencias.subtipos.map(s => (
                      <li key={s.id_tipo_orden}>{s.nombre}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-yellow-700">
                    Elimine primero los subtipos.
                  </p>
                </div>
              )}

              {dependencias.sucursales_asignadas.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="font-medium text-yellow-800 mb-1">
                    Está asignado a {dependencias.sucursales_asignadas.length} sucursal(es):
                  </p>
                  <ul className="list-disc list-inside text-yellow-700">
                    {dependencias.sucursales_asignadas.map(s => (
                      <li key={s.id_sucursal}>{s.nombre}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-yellow-700">
                    Quite las asignaciones desde la configuración de tipos por sucursal.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              ¿Estás seguro de eliminar el tipo <span className="font-semibold">"{tipo.nombre}"</span>?
              Esta acción no se puede deshacer.
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {bloqueado ? 'Entendido' : 'Cancelar'}
            </button>
            {!bloqueado && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
