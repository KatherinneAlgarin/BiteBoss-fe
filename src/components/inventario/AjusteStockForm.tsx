import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { InventarioIngredienteItem, AjusteStockDto } from '../../types/inventario.types';
import { ModalShell } from '../ui/ModalShell';

interface AjusteStockFormProps {
  item: InventarioIngredienteItem;
  opcionesBodega: InventarioIngredienteItem[];
  onSubmit: (idInventario: number, dto: AjusteStockDto) => Promise<void>;
  onCancel: () => void;
}

export function AjusteStockForm({ item, opcionesBodega, onSubmit, onCancel }: AjusteStockFormProps) {
  const [idInventario, setIdInventario] = useState(String(item.id_inventario));
  const [nuevaCantidad, setNuevaCantidad] = useState(String(item.stock_actual));
  const [nota, setNota] = useState('');
  const [error, setError] = useState<{ idInventario?: string; nuevaCantidad?: string; nota?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const registroSeleccionado = useMemo(
    () => opcionesBodega.find(opcion => opcion.id_inventario === Number(idInventario)) ?? null,
    [opcionesBodega, idInventario]
  );

  const stockActual = registroSeleccionado?.stock_actual ?? item.stock_actual;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: typeof error = {};
    const nuevaCantidadNum = parseFloat(nuevaCantidad);
    const idInventarioNum = Number(idInventario);

    if (!idInventario || !Number.isFinite(idInventarioNum) || idInventarioNum <= 0) {
      errs.idInventario = 'Debes seleccionar una bodega válida.';
    }

    if (!nuevaCantidad || Number.isNaN(nuevaCantidadNum) || nuevaCantidadNum < 0) {
      errs.nuevaCantidad = 'La nueva cantidad debe ser un número mayor o igual a 0.';
    }

    if (nota.trim().length < 10) {
      errs.nota = 'La nota es obligatoria y debe tener al menos 10 caracteres.';
    }

    if (Object.keys(errs).length > 0) {
      setError(errs);
      return;
    }

    if (nuevaCantidadNum === stockActual) {
      setError({ nuevaCantidad: 'La nueva cantidad debe ser diferente al stock actual.' });
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit(idInventarioNum, { nueva_cantidad: nuevaCantidadNum, nota: nota.trim() });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al ajustar stock');
    } finally {
      setSubmitting(false);
    }
  };

  const nuevaCantidadNum = parseFloat(nuevaCantidad);
  const diferencia = !Number.isNaN(nuevaCantidadNum) ? nuevaCantidadNum - stockActual : null;
  const tipoMovimiento = diferencia === null || diferencia === 0
    ? null
    : diferencia > 0
      ? 'AJUSTE_POSITIVO'
      : 'AJUSTE_NEGATIVO';

  return (
    <ModalShell title="Ajuste manual de stock" onClose={onCancel} maxWidthClass="max-w-md">
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{item.nombre_ingrediente}</p>
            <p className="text-gray-500">Selecciona bodega, define cantidad final y registra motivo del ajuste.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bodega a ajustar</label>
            <select
              value={idInventario}
              onChange={e => {
                const nextId = e.target.value;
                setIdInventario(nextId);
                const selected = opcionesBodega.find(opcion => opcion.id_inventario === Number(nextId));
                if (selected) {
                  setNuevaCantidad(String(selected.stock_actual));
                }
                setError(prev => ({ ...prev, idInventario: undefined, nuevaCantidad: undefined }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              {opcionesBodega.map(opcion => (
                <option key={opcion.id_inventario} value={opcion.id_inventario}>
                  {opcion.nombre_bodega} (Actual: {opcion.stock_actual} {opcion.unidad_medida})
                </option>
              ))}
            </select>
            {error.idInventario && <p className="mt-1 text-xs text-red-600">{error.idInventario}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock actual</label>
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              {stockActual} {item.unidad_medida}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva cantidad ({item.unidad_medida})</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={nuevaCantidad}
              onChange={e => {
                setNuevaCantidad(e.target.value);
                setError(prev => ({ ...prev, nuevaCantidad: undefined }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="0"
            />
            {error.nuevaCantidad && <p className="mt-1 text-xs text-red-600">{error.nuevaCantidad}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota de ajuste</label>
            <textarea
              value={nota}
              onChange={e => {
                setNota(e.target.value);
                setError(prev => ({ ...prev, nota: undefined }));
              }}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              placeholder="Explica por qué cambias el stock (mínimo 10 caracteres)."
            />
            <div className="mt-1 flex items-center justify-between">
              {error.nota ? <p className="text-xs text-red-600">{error.nota}</p> : <span className="text-xs text-gray-500">Mínimo 10 caracteres.</span>}
              <span className={`text-xs ${nota.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                {nota.trim().length}/10
              </span>
            </div>
          </div>

          {diferencia !== null && !Number.isNaN(diferencia) && (
            <div className={`rounded-md px-3 py-2 text-sm ${diferencia < 0 ? 'bg-red-50 text-red-700' : diferencia > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              <p>
                Movimiento: <span className="font-semibold">{tipoMovimiento ?? 'SIN CAMBIO'}</span>
              </p>
              <p>
                Diferencia: <span className="font-semibold">{diferencia.toFixed(2)} {item.unidad_medida}</span>
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
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 flex items-center">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Aplicar ajuste
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
