import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { InventarioIngredienteItem, ActualizarLimitesDto } from '../../types/inventario.types';

interface EditarLimitesFormProps {
  item: InventarioIngredienteItem;
  onSubmit: (dto: ActualizarLimitesDto) => Promise<void>;
  onCancel: () => void;
}

export function EditarLimitesForm({ item, onSubmit, onCancel }: EditarLimitesFormProps) {
  const [stockMinimo, setStockMinimo] = useState(String(item.stock_minimo));
  const [stockMaximo, setStockMaximo] = useState(String(item.stock_maximo));
  const [errors, setErrors] = useState<{ stock_minimo?: string; stock_maximo?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    const min = parseFloat(stockMinimo);
    const max = parseFloat(stockMaximo);
    if (stockMinimo === '' || isNaN(min) || min < 0) errs.stock_minimo = 'El stock mínimo debe ser ≥ 0.';
    if (stockMaximo === '' || isNaN(max) || max < min) errs.stock_maximo = 'El stock máximo debe ser ≥ al mínimo.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({ stock_minimo: parseFloat(stockMinimo), stock_maximo: parseFloat(stockMaximo) });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al actualizar límites');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar límites de stock</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{item.nombre_ingrediente}</p>
            <p className="text-gray-500">{item.nombre_bodega} · Stock actual: <span className="font-semibold text-gray-800">{item.stock_actual} {item.unidad_medida}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input type="number" min="0" step="0.01" value={stockMinimo}
                onChange={e => setStockMinimo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
              {errors.stock_minimo && <p className="mt-1 text-xs text-red-600">{errors.stock_minimo}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock máximo</label>
              <input type="number" min="0" step="0.01" value={stockMaximo}
                onChange={e => setStockMaximo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
              {errors.stock_maximo && <p className="mt-1 text-xs text-red-600">{errors.stock_maximo}</p>}
            </div>
          </div>

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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
