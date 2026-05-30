import { useEffect, useMemo, useState } from 'react';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { getOrdenesTiempoReal, updateOrden } from '../../../services/orden.service';
import type { OrdenResumen } from '../../../types/orden.types';

const STATUS_LABELS: Record<OrdenResumen['estado_operativo'], string> = {
  NUEVO: 'Nuevo',
  EN_PROCESO: 'En proceso',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
  OCULTO: 'Oculto',
};

export function PedidosMesaMeseroPage() {
  const { id_sucursal } = useAuth();

  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadOrdenes = async () => {
    if (!id_sucursal) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getOrdenesTiempoReal(id_sucursal);
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrdenes();
    const timer = window.setInterval(() => {
      void loadOrdenes();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [id_sucursal]);

  const pedidosMesa = useMemo(
    () =>
      ordenes
        .filter(orden => orden.mesa_numero != null)
        .filter(orden => orden.estado_operativo === 'NUEVO' || orden.estado_operativo === 'EN_PROCESO')
        .sort((a, b) => (a.fecha_apertura ?? '').localeCompare(b.fecha_apertura ?? '')),
    [ordenes]
  );

  const actualizarEstado = async (orden: OrdenResumen) => {
    const nextState = orden.estado_operativo === 'NUEVO' ? 'EN_PROCESO' : 'ENTREGADO';

    setProcessingId(orden.id_pedido);
    setError(null);
    setSuccess(null);

    try {
      await updateOrden(orden.id_pedido, { estado_operativo: nextState });
      setSuccess(`Orden ${orden.numero_orden} actualizada a ${STATUS_LABELS[nextState]}.`);
      await loadOrdenes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado del pedido.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos por llevar a mesa</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza los pedidos de mesa pendientes y avanza su estado operativo.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void loadOrdenes()} disabled={loading}>
          Actualizar
        </Button>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      <div className="card">
        {loading ? (
          <p className="text-gray-500">Cargando pedidos...</p>
        ) : pedidosMesa.length === 0 ? (
          <p className="text-gray-500">No hay pedidos pendientes para llevar a mesa.</p>
        ) : (
          <div className="space-y-3">
            {pedidosMesa.map(orden => {
              const actionLabel = orden.estado_operativo === 'NUEVO' ? 'Marcar en proceso' : 'Marcar entregado';
              return (
                <div key={orden.id_pedido} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {orden.numero_orden} · Mesa {orden.mesa_numero}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliente: {orden.nombre_cliente || 'Cliente'} {orden.apellido_cliente || ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      Estado: {STATUS_LABELS[orden.estado_operativo]} · Total: ${Number(orden.total ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <Button
                    onClick={() => void actualizarEstado(orden)}
                    disabled={processingId === orden.id_pedido}
                  >
                    {processingId === orden.id_pedido ? 'Actualizando...' : actionLabel}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
