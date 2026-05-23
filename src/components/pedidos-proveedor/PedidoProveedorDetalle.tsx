import type { PedidoProveedorItem } from '../../types/pedido-proveedor.types';
import { ModalShell } from '../ui/ModalShell';

interface Props {
  pedido: PedidoProveedorItem;
  onClose: () => void;
}

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  RECIBIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function PedidoProveedorDetalle({ pedido, onClose }: Props) {
  return (
    <ModalShell
      title={`Detalle de orden #${pedido.id_pedido_proveedor}`}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[90vh] flex flex-col overflow-hidden"
    >
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Encabezado */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Proveedor</p>
              <p className="font-semibold text-gray-900">{pedido.nombre_proveedor}</p>
            </div>
            <div>
              <p className="text-gray-500">Sucursal destino</p>
              <p className="font-semibold text-gray-900">{pedido.nombre_sucursal}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha pedido</p>
              <p className="font-medium text-gray-800">{formatFecha(pedido.fecha_pedido)}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha entrega esperada</p>
              <p className="font-medium text-gray-800">{formatFecha(pedido.fecha_entrega)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Estado</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[pedido.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                {pedido.estado}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Monto total</p>
              <p className="font-semibold text-gray-900 text-base">${Number(pedido.monto_total).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Creado por</p>
              <p className="font-medium text-gray-800">{pedido.nombre_creador || '—'}</p>
            </div>
          </div>

          {/* Detalles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Ingredientes solicitados</h3>
            {!pedido.detalles || pedido.detalles.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sin detalles</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Ingrediente</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Unidad</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-gray-700">Cantidad pedida</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-gray-700">Precio unitario</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pedido.detalles.map(d => (
                      <tr key={d.id_pedido_proveedor_detalle}>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{d.nombre_ingrediente}</td>
                        <td className="px-4 py-2.5 text-gray-600">{d.unidad_medida}</td>
                        <td className="px-4 py-2.5 text-right text-gray-900 font-semibold">{d.cantidad}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">
                          ${Number(d.precio_unitario).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
            Cerrar
          </button>
        </div>
    </ModalShell>
  );
}
