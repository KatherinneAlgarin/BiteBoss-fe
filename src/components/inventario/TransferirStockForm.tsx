import { useState } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import type { InventarioIngredienteItem, TransferirStockDto } from '../../types/inventario.types';
import type { BodegaItem } from '../../types/bodega.types';

interface TransferirStockFormProps {
  item: InventarioIngredienteItem;
  bodegas: BodegaItem[];
  loadingBodegas: boolean;
  onSubmit: (dto: TransferirStockDto) => Promise<void>;
  onCancel: () => void;
}

export function TransferirStockForm({ item, bodegas, loadingBodegas, onSubmit, onCancel }: TransferirStockFormProps) {
  const [idBodegaDestino, setIdBodegaDestino] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [errors, setErrors] = useState<{ bodega?: string; cantidad?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Excluir la bodega origen de las opciones
  const bodegasDestino = bodegas.filter(b => b.activo && b.id_bodega !== item.id_bodega);

  const validate = () => {
    const errs: typeof errors = {};
    if (!idBodegaDestino) errs.bodega = 'Selecciona una bodega destino.';
    const cant = parseFloat(cantidad);
    if (!cantidad || isNaN(cant) || cant <= 0) errs.cantidad = 'La cantidad debe ser mayor a 0.';
    else if (cant > item.stock_actual) errs.cantidad = `No puedes transferir más del stock disponible (${item.stock_actual} ${item.unidad_medida}).`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({ id_bodega_destino: Number(idBodegaDestino), cantidad: parseFloat(cantidad) });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al transferir stock');
    } finally {
      setSubmitting(false);
    }
  };

  const bodegaDestino = bodegas.find(b => b.id_bodega === Number(idBodegaDestino));
  const cantidadNum = parseFloat(cantidad);
  const stockRestante = !isNaN(cantidadNum) && cantidadNum > 0 ? item.stock_actual - cantidadNum : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transferir stock</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resumen del origen */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{item.nombre_ingrediente}</p>
            <p className="text-gray-500 mt-0.5">
              Origen: <span className="font-medium text-gray-700">{item.nombre_bodega}</span>
              {' · '}Stock disponible: <span className="font-semibold text-gray-800">{item.stock_actual} {item.unidad_medida}</span>
            </p>
          </div>

          {/* Bodega destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bodega destino</label>
            <select value={idBodegaDestino} onChange={e => setIdBodegaDestino(e.target.value)}
              disabled={loadingBodegas}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100">
              <option value="">{loadingBodegas ? 'Cargando...' : 'Selecciona una bodega'}</option>
              {bodegasDestino.map(b => (
                <option key={b.id_bodega} value={b.id_bodega}>{b.nombre} {b.sucursal ? `(${b.sucursal})` : ''}</option>
              ))}
            </select>
            {errors.bodega && <p className="mt-1 text-xs text-red-600">{errors.bodega}</p>}
            {bodegasDestino.length === 0 && !loadingBodegas && (
              <p className="mt-1 text-xs text-amber-600">No hay otras bodegas disponibles para transferir.</p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a transferir ({item.unidad_medida})</label>
            <input type="number" min="0.01" step="0.01" max={item.stock_actual} value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="0" />
            {errors.cantidad && <p className="mt-1 text-xs text-red-600">{errors.cantidad}</p>}
          </div>

          {/* Vista previa del movimiento */}
          {stockRestante !== null && stockRestante >= 0 && bodegaDestino && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                <span>{item.nombre_bodega}</span>
                <ArrowRight className="w-4 h-4" />
                <span>{bodegaDestino.nombre}</span>
              </div>
              <p className="text-blue-600">
                Stock restante en origen: <span className="font-semibold">{stockRestante.toFixed(2)} {item.unidad_medida}</span>
              </p>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{submitError}</div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onCancel} disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting || bodegasDestino.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 flex items-center">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
