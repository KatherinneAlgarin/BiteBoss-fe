import { useState } from 'react';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle } from 'lucide-react';
import type { SucursalItem } from '../../types/sucursal.types';

interface SucursalesListProps {
  sucursales: SucursalItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (sucursal: SucursalItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
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
}: SucursalesListProps) {
  const [confirming, setConfirming] = useState<SucursalItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.id_sucursal);
      setConfirmError(null);
      await onDeactivate(confirming.id_sucursal);
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between">
          <span>{activateError}</span>
          <button onClick={() => setActivateError(null)} className="text-red-700 hover:text-red-900 ml-4">×</button>
        </div>
      )}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Sucursales</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sucursal
          </button>
        </div>

        {sucursales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay sucursales registradas</p>
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sucursales.map((s) => (
                  <tr key={s.id_sucursal} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.direccion ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        s.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {s.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEdit(s)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      {s.activo ? (
                        <button
                          onClick={() => { setConfirming(s); setConfirmError(null); }}
                          disabled={busyId === s.id_sucursal}
                          className="text-orange-600 hover:text-orange-900 inline-flex items-center disabled:opacity-50"
                        >
                          <Power className="w-4 h-4 mr-1" />
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(s)}
                          disabled={activatingId === s.id_sucursal}
                          className="text-green-600 hover:text-green-900 inline-flex items-center disabled:opacity-50"
                        >
                          {activatingId === s.id_sucursal
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar sucursal</h2>
              <p className="text-sm text-gray-700">
                ¿Seguro que quieres desactivar <span className="font-semibold">"{confirming.nombre}"</span>?
                Podrás volver a activarla más adelante desde la lista.
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
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md disabled:opacity-50 flex items-center"
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
