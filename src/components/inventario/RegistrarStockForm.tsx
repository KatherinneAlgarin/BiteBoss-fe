import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { IngredienteItem } from '../../types/ingrediente.types';
import type { BodegaItem } from '../../types/bodega.types';
import type { RegistrarStockIngredienteDto } from '../../types/inventario.types';
import { ModalShell } from '../ui/ModalShell';

interface FormState {
  id_ingrediente: string;
  id_bodega: string;
  cantidad: string;
  stock_minimo: string;
  stock_maximo: string;
  lote: string;
  fecha_vencimiento: string;
}

interface FormErrors {
  id_ingrediente?: string;
  id_bodega?: string;
  cantidad?: string;
  stock_minimo?: string;
  stock_maximo?: string;
}

interface RegistrarStockFormProps {
  ingredientes: IngredienteItem[];
  bodegas: BodegaItem[];
  loadingIngredientes: boolean;
  loadingBodegas: boolean;
  onSubmit: (dto: RegistrarStockIngredienteDto) => Promise<void>;
  onCancel: () => void;
}

export function RegistrarStockForm({ ingredientes, bodegas, loadingIngredientes, loadingBodegas, onSubmit, onCancel }: RegistrarStockFormProps) {
  const [form, setForm] = useState<FormState>({ id_ingrediente: '', id_bodega: '', cantidad: '', stock_minimo: '', stock_maximo: '', lote: '', fecha_vencimiento: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.id_ingrediente) errs.id_ingrediente = 'Selecciona un ingrediente.';
    if (!form.id_bodega) errs.id_bodega = 'Selecciona una bodega.';
    const cant = parseFloat(form.cantidad);
    if (!form.cantidad || isNaN(cant) || cant <= 0) errs.cantidad = 'La cantidad debe ser mayor a 0.';
    const min = parseFloat(form.stock_minimo);
    if (form.stock_minimo === '' || isNaN(min) || min < 0) errs.stock_minimo = 'El stock mínimo debe ser ≥ 0.';
    const max = parseFloat(form.stock_maximo);
    if (form.stock_maximo === '' || isNaN(max) || max < min) errs.stock_maximo = 'El stock máximo debe ser ≥ al mínimo.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        id_ingrediente: Number(form.id_ingrediente),
        id_bodega: Number(form.id_bodega),
        cantidad: parseFloat(form.cantidad),
        stock_minimo: parseFloat(form.stock_minimo),
        stock_maximo: parseFloat(form.stock_maximo),
        lote: form.lote.trim() || undefined,
        fecha_vencimiento: form.fecha_vencimiento || undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al registrar stock');
    } finally {
      setSubmitting(false);
    }
  };

  const f = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <ModalShell title="Registrar stock inicial" onClose={onCancel} maxWidthClass="max-w-md">
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingrediente</label>
            <select value={form.id_ingrediente} onChange={f('id_ingrediente')} disabled={loadingIngredientes}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100">
              <option value="">{loadingIngredientes ? 'Cargando...' : 'Selecciona un ingrediente'}</option>
              {ingredientes.filter(i => i.activo).map(i => (
                <option key={i.id_ingrediente} value={i.id_ingrediente}>{i.nombre} ({i.unidad_medida})</option>
              ))}
            </select>
            {errors.id_ingrediente && <p className="mt-1 text-xs text-red-600">{errors.id_ingrediente}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
            <select value={form.id_bodega} onChange={f('id_bodega')} disabled={loadingBodegas}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100">
              <option value="">{loadingBodegas ? 'Cargando...' : 'Selecciona una bodega'}</option>
              {bodegas.filter(b => b.activo).map(b => (
                <option key={b.id_bodega} value={b.id_bodega}>{b.nombre}</option>
              ))}
            </select>
            {errors.id_bodega && <p className="mt-1 text-xs text-red-600">{errors.id_bodega}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['cantidad', 'stock_minimo', 'stock_maximo'] as const).map((campo, i) => (
              <div key={campo}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {['Cantidad', 'Stock mín.', 'Stock máx.'][i]}
                </label>
                <input type="number" min={campo === 'cantidad' ? '0.01' : '0'} step="0.01" value={form[campo]}
                  onChange={f(campo)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="0" />
                {errors[campo] && <p className="mt-1 text-xs text-red-600">{errors[campo]}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input type="text" value={form.lote} onChange={f('lote')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="Ej. LOTE-2026-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input type="date" value={form.fecha_vencimiento} onChange={f('fecha_vencimiento')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
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
              Registrar
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
