import { useState } from 'react';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle } from 'lucide-react';
import type { ZonaItem } from '../../types/zona.types';

interface ZonasListProps {
  zonas: ZonaItem[];
  loading: boolean;
  error: string | null;
  sucursalSeleccionada: boolean;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (zona: ZonaItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
}

export function ZonasList({
  zonas,
  loading,
  error,
  sucursalSeleccionada,
  onRefetch,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
}: ZonasListProps) {
  const [confirming, setConfirming] = useState<ZonaItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.id_zona);
      setConfirmError(null);
      await onDeactivate(confirming.id_zona);
      setConfirming(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (z: ZonaItem) => {
    try {
      setActivatingId(z.id_zona);
      setActivateError(null);
      await onActivate(z.id_zona);
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActivatingId(null);
    }
  };

  if (!sucursalSeleccionada) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <p className="text-gray-500">Selecciona una sucursal para ver sus zonas.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Cargando zonas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar zonas: {error}</span>
        </div>
        <button
          onClick={onRefetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
          <h2 className="text-xl font-semibold text-gray-900">Zonas de la sucursal</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Zona
          </button>
        </div>

        {zonas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay zonas registradas en esta sucursal</p>
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear la primera
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zonas.map((z) => (
                  <tr key={z.id_zona} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{z.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{z.descripcion ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        z.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {z.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEdit(z)}
                        className="text-orange-600 hover:text-orange-800 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      {z.activo ? (
                        <button
                          onClick={() => { setConfirming(z); setConfirmError(null); }}
                          disabled={busyId === z.id_zona}
                          className="text-amber-700 hover:text-amber-900 inline-flex items-center disabled:opacity-50"
                        >
                          <Power className="w-4 h-4 mr-1" />
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(z)}
                          disabled={activatingId === z.id_zona}
                          className="text-green-600 hover:text-green-800 inline-flex items-center disabled:opacity-50"
                        >
                          {activatingId === z.id_zona
                            ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            : <PowerOff className="w-4 h-4 mr-1" />}
                          Activar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar zona</h2>
              <p className="text-sm text-gray-700">
                ¿Seguro que quieres desactivar <span className="font-semibold">"{confirming.nombre}"</span>?
                Podrás volver a activarla más adelante desde la lista.
              </p>

              {confirmError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {confirmError}
                  {confirmError.toLowerCase().includes('informaci') && (
                    <p className="mt-2 text-xs">
                      Mueve las mesas a otra zona o desactívalas antes de desactivar la zona.
                    </p>
                  )}
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
          </div>
        </div>
      )}
    </>
  );
}
