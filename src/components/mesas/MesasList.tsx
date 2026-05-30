import { useState } from 'react';
import { Plus, Edit, Power, PowerOff, Loader2 } from 'lucide-react';
import type { MesaItem } from '../../types/mesa.types';
import { ModalShell } from '../ui/ModalShell';
import { TableErrorState } from '../ui/TableErrorState';
import { TableEmptyState } from '../ui/TableEmptyState';
import { TableLoadingState } from '../ui/TableLoadingState';

interface MesasListProps {
  mesas: MesaItem[];
  loading: boolean;
  error: string | null;
  zonaSeleccionada: boolean;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (mesa: MesaItem) => void;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
}

export function MesasList({
  mesas,
  loading,
  error,
  zonaSeleccionada,
  onRefetch,
  onCreate,
  onEdit,
  onDeactivate,
  onActivate,
}: MesasListProps) {
  const [confirming, setConfirming] = useState<MesaItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.id_mesa);
      setConfirmError(null);
      await onDeactivate(confirming.id_mesa);
      setConfirming(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (m: MesaItem) => {
    try {
      setActivatingId(m.id_mesa);
      setActivateError(null);
      await onActivate(m.id_mesa);
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActivatingId(null);
    }
  };

  if (!zonaSeleccionada) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <p className="text-gray-500">Selecciona una zona para ver sus mesas.</p>
      </div>
    );
  }

  if (error) {
    return <TableErrorState message={`Error al cargar mesas: ${error}`} onRetry={onRefetch} />;
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
          <h2 className="text-xl font-semibold text-gray-900">Mesas de la zona</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Mesa
          </button>
        </div>

        {loading ? (
          <TableLoadingState message="Cargando mesas..." />
        ) : mesas.length === 0 ? (
          <TableEmptyState message="No hay mesas registradas en esta zona" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mesas.map((m) => (
                  <tr key={m.id_mesa} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Mesa {m.numero}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.capacidad} {m.capacidad === 1 ? 'persona' : 'personas'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        m.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {m.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEdit(m)}
                        className="text-orange-600 hover:text-orange-800 inline-flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      {m.activo ? (
                        <button
                          onClick={() => { setConfirming(m); setConfirmError(null); }}
                          disabled={busyId === m.id_mesa}
                          className="text-amber-700 hover:text-amber-900 inline-flex items-center disabled:opacity-50"
                        >
                          <Power className="w-4 h-4 mr-1" />
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(m)}
                          disabled={activatingId === m.id_mesa}
                          className="text-green-600 hover:text-green-800 inline-flex items-center disabled:opacity-50"
                        >
                          {activatingId === m.id_mesa
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
        <ModalShell title="Desactivar mesa" onClose={() => { setConfirming(null); setConfirmError(null); }} maxWidthClass="max-w-md">
            <div className="px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Desactivar mesa</h2>
              <p className="text-sm text-gray-700">
                ¿Seguro que quieres desactivar <span className="font-semibold">"Mesa {confirming.numero}"</span>?
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
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 flex items-center"
                >
                  {busyId !== null && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Desactivar
                </button>
              </div>
            </div>
        </ModalShell>
      )}
    </>
  );
}
