import { useEffect, useMemo, useState } from 'react';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { Button } from '../../../components/ui/Button';
import { ModalShell } from '../../../components/ui/ModalShell';
import {
  autorizarCierreCaja,
  listarCierresCaja,
  rechazarCierreCaja,
} from '../../../services/caja-cierre.service';
import type { CajaCierreListadoItem, EstadoCajaSesion } from '../../../types/caja-cierre.types';

const ESTADOS: EstadoCajaSesion[] = ['ABIERTA', 'PENDIENTE', 'AUTORIZADA', 'RECHAZADA'];

export function CortesCajaPage() {
  const [estado, setEstado] = useState<EstadoCajaSesion | ''>('PENDIENTE');
  const [items, setItems] = useState<CajaCierreListadoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedDetalle, setSelectedDetalle] = useState<CajaCierreListadoItem | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarCierresCaja(estado || undefined);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los cortes de caja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [estado]);

  const pendientes = useMemo(() => items.filter(item => item.estado === 'PENDIENTE').length, [items]);

  const aprobar = async (id: number) => {
    setActionLoadingId(id);
    try {
      await autorizarCierreCaja(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo autorizar el corte');
    } finally {
      setActionLoadingId(null);
    }
  };

  const rechazar = async (id: number) => {
    const motivo = window.prompt('Motivo de rechazo');
    if (!motivo?.trim()) return;

    setActionLoadingId(id);
    try {
      await rechazarCierreCaja(id, motivo.trim());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar el corte');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Cortes de caja</h1>
            <p className="text-sm text-gray-600">Revisa solicitudes de cierre de cajeros y autoriza o rechaza.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Pendientes: {pendientes}</span>
            <select
              value={estado}
              onChange={e => setEstado((e.target.value as EstadoCajaSesion) || '')}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {ESTADOS.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Cargando cortes...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500">No hay cortes para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Sucursal</th>
                  <th className="py-2 pr-3">Cajero</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3">Apertura</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Declarado</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id_caja_sesion} className="border-t border-gray-100 text-gray-700">
                    <td className="py-2 pr-3">#{item.id_caja_sesion}</td>
                    <td className="py-2 pr-3">{item.sucursal_nombre ?? item.id_sucursal}</td>
                    <td className="py-2 pr-3">{item.cajero_nombre ?? item.id_usuario_cajero}</td>
                    <td className="py-2 pr-3">{item.estado}</td>
                    <td className="py-2 pr-3">{new Date(item.fecha_apertura).toLocaleString('es-ES')}</td>
                    <td className="py-2 pr-3">${Number(item.total_monto ?? 0).toFixed(2)}</td>
                    <td className="py-2 pr-3">{item.monto_declarado != null ? `$${Number(item.monto_declarado).toFixed(2)}` : '—'}</td>
                    <td className="py-2">
                      {item.estado === 'PENDIENTE' ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSelectedDetalle(item)}
                            disabled={actionLoadingId === item.id_caja_sesion}
                          >
                            Ver detalle
                          </Button>
                          <Button
                            type="button"
                            onClick={() => void aprobar(item.id_caja_sesion)}
                            disabled={actionLoadingId === item.id_caja_sesion}
                          >
                            Autorizar
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void rechazar(item.id_caja_sesion)}
                            disabled={actionLoadingId === item.id_caja_sesion}
                          >
                            Rechazar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="secondary" onClick={() => setSelectedDetalle(item)}>
                            Ver detalle
                          </Button>
                          <span className="text-xs text-gray-500">{item.revisor_nombre ? `Revisó: ${item.revisor_nombre}` : 'Sin acción'}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDetalle && (
        <ModalShell
          title={`Detalle corte #${selectedDetalle.id_caja_sesion}`}
          onClose={() => setSelectedDetalle(null)}
          maxWidthClass="max-w-5xl"
          panelClassName="max-h-[90vh] overflow-hidden"
        >
          <div className="max-h-[calc(90vh-72px)] space-y-4 overflow-y-auto p-6">
            <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 lg:grid-cols-3">
              <p><span className="font-semibold">Sucursal:</span> {selectedDetalle.sucursal_nombre ?? selectedDetalle.id_sucursal}</p>
              <p><span className="font-semibold">Cajero:</span> {selectedDetalle.cajero_nombre ?? selectedDetalle.id_usuario_cajero}</p>
              <p><span className="font-semibold">Estado:</span> {selectedDetalle.estado}</p>
              <p><span className="font-semibold">Apertura:</span> {new Date(selectedDetalle.fecha_apertura).toLocaleString('es-ES')}</p>
              <p><span className="font-semibold">Total:</span> ${Number(selectedDetalle.total_monto ?? 0).toFixed(2)}</p>
              <p><span className="font-semibold">Declarado:</span> {selectedDetalle.monto_declarado != null ? `$${Number(selectedDetalle.monto_declarado).toFixed(2)}` : '—'}</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Ventas por método</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  {(selectedDetalle.resumen?.por_metodo ?? []).length === 0 ? (
                    <p className="text-gray-500">Sin datos</p>
                  ) : (
                    (selectedDetalle.resumen?.por_metodo ?? []).map(item => (
                      <p key={item.metodo}>{item.metodo}: ${item.total.toFixed(2)} ({item.cantidad})</p>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Productos vendidos</h3>
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-gray-700">
                  {(selectedDetalle.resumen?.productos ?? []).length === 0 ? (
                    <p className="text-gray-500">Sin datos</p>
                  ) : (
                    (selectedDetalle.resumen?.productos ?? []).map(item => (
                      <p key={item.id_producto}>{item.cantidad_total}x {item.nombre_producto} · ${item.total_vendido.toFixed(2)}</p>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Transacciones</h3>
              <div className="mt-2 max-h-56 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-1 pr-3">Pedido</th>
                      <th className="py-1 pr-3">Método</th>
                      <th className="py-1 pr-3">Monto</th>
                      <th className="py-1">Propina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedDetalle.resumen?.transacciones ?? []).map(tx => (
                      <tr key={tx.id_pago_pedido} className="border-t border-gray-100 text-gray-700">
                        <td className="py-1 pr-3">#{tx.id_pedido}</td>
                        <td className="py-1 pr-3">{tx.metodo}</td>
                        <td className="py-1 pr-3">${tx.monto.toFixed(2)}</td>
                        <td className="py-1">${tx.propina.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(selectedDetalle.resumen?.transacciones ?? []).length === 0 && (
                  <p className="text-sm text-gray-500">Sin transacciones para mostrar.</p>
                )}
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
