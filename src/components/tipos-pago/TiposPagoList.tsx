import { useState } from 'react';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle } from 'lucide-react';
import type { TipoPagoItem, DependenciasDesactivacionTipoPago } from '../../types/tipo-pago.types';

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

      {confirmError && !confirming && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{confirmError}</span>
          <button onClick={() => setConfirmError(null)} className="text-red-700 hover:text-red-900 ml-4">×</button>
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
          <div className="px-6 py-3 text-sm text-gray-600 border-b border-gray-100 flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Validando impacto de desactivación...
          </div>
        )}

        {tipos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay métodos de pago registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tipos.map((tipo) => (
                  <tr key={tipo.id_tipo_pago} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tipo.nombre}
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
                          onClick={() => handleOpenConfirm(tipo)}
                          disabled={busyId === tipo.id_tipo_pago || loadingDependencias}
                          className="text-amber-700 hover:text-amber-900 inline-flex items-center disabled:opacity-50"
                        >
                          <Power className="w-4 h-4 mr-1" />
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(tipo)}
                          disabled={activatingId === tipo.id_tipo_pago}
                          className="text-green-600 hover:text-green-800 inline-flex items-center disabled:opacity-50"
                        >
                          {activatingId === tipo.id_tipo_pago
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
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar método de pago</h2>
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
          </div>
        </div>
      )}
    </>
  );
}
