import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { listarBodegas } from '../../services/bodega.service';
import type { BodegaItem } from '../../types/bodega.types';
import type { PedidoProveedorItem, ConfirmarRecepcionDto, RecibirDetalleDto } from '../../types/pedido-proveedor.types';
import { ModalShell } from '../ui/ModalShell';

interface DetalleRow {
  id_pedido_proveedor_detalle: number;
  id_ingrediente: number;
  nombre_ingrediente: string;
  unidad_medida: string;
  cantidad_pedida: number;
  cantidad_recibida: string;
  lote: string;
  fecha_vencimiento: string;
}

interface Props {
  pedido: PedidoProveedorItem;
  onSubmit: (dto: ConfirmarRecepcionDto) => Promise<void>;
  onCancel: () => void;
}

export function ConfirmarRecepcionForm({ pedido, onSubmit, onCancel }: Props) {
  const [bodegas, setBodegas] = useState<BodegaItem[]>([]);
  const [loadingBodegas, setLoadingBodegas] = useState(true);
  const [idBodega, setIdBodega] = useState<number | null>(null);

  const [detalles, setDetalles] = useState<DetalleRow[]>(
    (pedido.detalles ?? []).map(d => ({
      id_pedido_proveedor_detalle: d.id_pedido_proveedor_detalle,
      id_ingrediente: d.id_ingrediente,
      nombre_ingrediente: d.nombre_ingrediente,
      unidad_medida: d.unidad_medida,
      cantidad_pedida: d.cantidad,
      cantidad_recibida: String(d.cantidad),
      lote: '',
      fecha_vencimiento: '',
    }))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listarBodegas(pedido.id_sucursal)
      .then(data => setBodegas(data.filter(b => b.activo)))
      .catch(() => setBodegas([]))
      .finally(() => setLoadingBodegas(false));
  }, [pedido.id_sucursal]);

  const esParicialRecepcion = detalles.some(d => {
    const recibida = parseFloat(d.cantidad_recibida);
    return !isNaN(recibida) && recibida < d.cantidad_pedida;
  });

  const actualizarCantidad = (idx: number, valor: string) => {
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, cantidad_recibida: valor } : d));
    setErrors(prev => { const e = { ...prev }; delete e[`cantidad_${idx}`]; return e; });
  };

  const actualizarLote = (idx: number, valor: string) => {
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, lote: valor } : d));
  };

  const actualizarFechaVencimiento = (idx: number, valor: string) => {
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, fecha_vencimiento: valor } : d));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!idBodega) errs.bodega = 'Debes seleccionar una bodega receptora';
    detalles.forEach((d, i) => {
      const cant = parseFloat(d.cantidad_recibida);
      if (!d.cantidad_recibida || isNaN(cant) || cant <= 0)
        errs[`cantidad_${i}`] = 'Debe ser mayor a 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const dto: ConfirmarRecepcionDto = {
        id_bodega: idBodega!,
        detalles: detalles.map((d): RecibirDetalleDto => ({
          id_pedido_proveedor_detalle: d.id_pedido_proveedor_detalle,
          id_ingrediente: d.id_ingrediente,
          cantidad: parseFloat(d.cantidad_recibida),
          ...(d.lote.trim() && { lote: d.lote.trim() }),
          ...(d.fecha_vencimiento && { fecha_vencimiento: d.fecha_vencimiento }),
        })),
      };
      await onSubmit(dto);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al confirmar la recepción');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={`Confirmar recepción #${pedido.id_pedido_proveedor}`}
      onClose={onCancel}
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[90vh] flex flex-col overflow-hidden"
      headerContent={
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Confirmar recepción #{pedido.id_pedido_proveedor}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {pedido.nombre_proveedor} · {pedido.nombre_sucursal}
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Selector de bodega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bodega receptora <span className="text-red-500">*</span>
            </label>
            {loadingBodegas ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando bodegas...
              </div>
            ) : bodegas.length === 0 ? (
              <p className="text-sm text-red-600">No hay bodegas activas en esta sucursal.</p>
            ) : (
              <select
                value={idBodega ?? ''}
                onChange={e => {
                  setIdBodega(e.target.value ? Number(e.target.value) : null);
                  setErrors(prev => { const er = { ...prev }; delete er.bodega; return er; });
                }}
                className={`w-full px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${errors.bodega ? 'border-red-400' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar bodega...</option>
                {bodegas.map(b => (
                  <option key={b.id_bodega} value={b.id_bodega}>
                    {b.nombre} ({b.tipo})
                  </option>
                ))}
              </select>
            )}
            {errors.bodega && <p className="mt-1 text-xs text-red-600">{errors.bodega}</p>}
          </div>

          {/* Aviso recepción parcial */}
          {esParicialRecepcion && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Recepción parcial:</strong> una o más cantidades recibidas son menores a las pedidas.
                La orden pasará a estado <strong>RECIBIDO</strong> igualmente.
              </span>
            </div>
          )}

          {/* Tabla de ingredientes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidades recibidas
            </label>
            {detalles.length === 0 ? (
              <p className="text-sm text-gray-500">Esta orden no tiene ingredientes.</p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Ingrediente</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700 w-24">Cant. pedida</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 w-28">
                        Cant. recibida <span className="text-red-500">*</span>
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 w-28">
                        Lote <span className="text-gray-400 text-xs">(opc.)</span>
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 w-36">
                        Fecha venc. <span className="text-gray-400 text-xs">(opc.)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {detalles.map((d, i) => {
                      const recibida = parseFloat(d.cantidad_recibida);
                      const esParial = !isNaN(recibida) && recibida < d.cantidad_pedida;
                      return (
                        <tr key={d.id_pedido_proveedor_detalle}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-900">{d.nombre_ingrediente}</p>
                            <p className="text-xs text-gray-400">{d.unidad_medida}</p>
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {d.cantidad_pedida}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={d.cantidad_recibida}
                              onChange={e => actualizarCantidad(i, e.target.value)}
                              className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 ${
                                errors[`cantidad_${i}`]
                                  ? 'border-red-400'
                                  : esParial
                                    ? 'border-amber-400 bg-amber-50'
                                    : 'border-gray-300'
                              }`}
                            />
                            {errors[`cantidad_${i}`] && (
                              <p className="text-xs text-red-600 mt-0.5">{errors[`cantidad_${i}`]}</p>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={d.lote}
                              onChange={e => actualizarLote(i, e.target.value)}
                              placeholder="Ej: LOT-001"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="date"
                              value={d.fecha_vencimiento}
                              onChange={e => actualizarFechaVencimiento(i, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || loadingBodegas || bodegas.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirmar recepción
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
