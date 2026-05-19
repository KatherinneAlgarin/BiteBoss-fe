import { useState } from 'react';
import { X, Loader2, PlusCircle, MinusCircle } from 'lucide-react';
import type { InventarioIngredienteItem, AjusteStockDto } from '../../types/inventario.types';

interface AjusteStockFormProps {
  item: InventarioIngredienteItem;
  onSubmit: (dto: AjusteStockDto) => Promise<void>;
  onCancel: () => void;
}

export function AjusteStockForm({ item, onSubmit, onCancel }: AjusteStockFormProps) {
  const [tipo, setTipo] = useState<'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'>('AJUSTE_POSITIVO');
  const [cantidad, setCantidad] = useState('');
  const [lote, setLote] = useState(item.lote ?? '');
  const [fechaVencimiento, setFechaVencimiento] = useState(item.fecha_vencimiento ?? '');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stockResultante = () => {
    const cant = parseFloat(cantidad);
    if (isNaN(cant) || cant <= 0) return item.stock_actual;
    return tipo === 'AJUSTE_POSITIVO' ? item.stock_actual + cant : item.stock_actual - cant;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cant = parseFloat(cantidad);
    if (!cantidad || isNaN(cant) || cant <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    if (tipo === 'AJUSTE_NEGATIVO' && cant > item.stock_actual) {
      setError(`No puedes restar más del stock actual (${item.stock_actual} ${item.unidad_medida}).`);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        tipo,
        cantidad: cant,
        lote: tipo === 'AJUSTE_POSITIVO' ? (lote.trim() || undefined) : undefined,
        fecha_vencimiento: tipo === 'AJUSTE_POSITIVO' ? (fechaVencimiento || undefined) : undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al ajustar stock');
    } finally {
      setSubmitting(false);
    }
  };

  const resultante = stockResultante();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Ajustar stock</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{item.nombre_ingrediente}</p>
            <p className="text-gray-500">{item.nombre_bodega} · Stock actual: <span className="font-semibold text-gray-800">{item.stock_actual} {item.unidad_medida}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ajuste</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setTipo('AJUSTE_POSITIVO')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                  tipo === 'AJUSTE_POSITIVO' ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}>
                <PlusCircle className="w-4 h-4" /> Entrada
              </button>
              <button type="button" onClick={() => setTipo('AJUSTE_NEGATIVO')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                  tipo === 'AJUSTE_NEGATIVO' ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}>
                <MinusCircle className="w-4 h-4" /> Salida
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad ({item.unidad_medida})</label>
            <input type="number" min="0.01" step="0.01" value={cantidad}
              onChange={e => { setCantidad(e.target.value); setError(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="0" />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          {tipo === 'AJUSTE_POSITIVO' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lote <span className="text-gray-400">(opcional)</span></label>
                <input type="text" value={lote} onChange={e => setLote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Ej. LOTE-2026-001" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vencimiento <span className="text-gray-400">(opcional)</span></label>
                <input type="date" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
              </div>
            </div>
          )}

          {cantidad && !isNaN(parseFloat(cantidad)) && parseFloat(cantidad) > 0 && (
            <div className={`rounded-md px-3 py-2 text-sm ${resultante < 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              Stock resultante: <span className="font-semibold">{resultante.toFixed(2)} {item.unidad_medida}</span>
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
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 flex items-center">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Aplicar ajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
