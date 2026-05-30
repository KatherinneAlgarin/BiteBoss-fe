import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { InventarioIngredienteItem, DescartarInventarioDto } from '../../types/inventario.types';
import { ModalShell } from '../ui/ModalShell';

interface DescartarStockFormProps {
  item: InventarioIngredienteItem;
  onSubmit: (idInventario: number, dto: DescartarInventarioDto) => Promise<void>;
  onCancel: () => void;
}

export function DescartarStockForm({ item, onSubmit, onCancel }: DescartarStockFormProps) {
  const [nota, setNota] = useState('');
  const [errors, setErrors] = useState<{ nota?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validar = () => {
    const errs: typeof errors = {};

    if (nota.trim().length < 10) {
      errs.nota = 'El motivo es obligatorio y debe tener al menos 10 caracteres.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(item.id_inventario, { nota: nota.trim() });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al descartar stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Descartar de inventario" onClose={onCancel} maxWidthClass="max-w-md">
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <div className="bg-red-50 rounded-lg p-3 text-sm">
          <p className="font-medium text-gray-900">{item.nombre_ingrediente}</p>
          <p className="text-gray-600">
            {item.nombre_bodega} · Stock actual: <span className="font-semibold text-gray-900">{item.stock_actual} {item.unidad_medida}</span>
          </p>
          <p className="text-red-700 mt-2">
            Este registro se eliminará de la tabla de inventario y ya no se mostrará.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del descarte</label>
          <textarea
            value={nota}
            onChange={(e) => {
              setNota(e.target.value);
              setErrors((prev) => ({ ...prev, nota: undefined }));
            }}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            placeholder="Ej: producto vencido o lote dañado."
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.nota ? <p className="text-xs text-red-600">{errors.nota}</p> : <span className="text-xs text-gray-500">Mínimo 10 caracteres.</span>}
            <span className={`text-xs ${nota.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
              {nota.trim().length}/10
            </span>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{submitError}</div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
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
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 flex items-center"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Eliminar de la tabla
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
