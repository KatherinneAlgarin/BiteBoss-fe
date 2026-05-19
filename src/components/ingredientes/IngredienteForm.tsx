import { useEffect, useState } from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';
import type { IngredienteItem, CrearIngredienteDto, ActualizarIngredienteDto } from '../../types/ingrediente.types';
import { UNIDADES_MEDIDA } from '../../types/ingrediente.types';
import type { BodegaItem } from '../../types/bodega.types';

interface FormState {
  nombre: string;
  unidad_medida: string;
  conStock: boolean;
  id_bodega: number | null;
  cantidad: string;
  stock_minimo: string;
  stock_maximo: string;
}

interface FormErrors {
  nombre?: string;
  unidad_medida?: string;
  id_bodega?: string;
  cantidad?: string;
  stock_minimo?: string;
  stock_maximo?: string;
}

const initialForm: FormState = {
  nombre: '', unidad_medida: '', conStock: false,
  id_bodega: null, cantidad: '', stock_minimo: '', stock_maximo: '',
};

interface IngredienteFormProps {
  ingrediente?: IngredienteItem;
  bodegas: BodegaItem[];
  loadingBodegas: boolean;
  onCreate: (dto: CrearIngredienteDto) => Promise<IngredienteItem>;
  onUpdate: (id: number, dto: ActualizarIngredienteDto) => Promise<IngredienteItem>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IngredienteForm({ ingrediente, bodegas, loadingBodegas, onCreate, onUpdate, onSuccess, onCancel }: IngredienteFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!ingrediente;

  useEffect(() => {
    if (ingrediente) {
      setForm({ ...initialForm, nombre: ingrediente.nombre, unidad_medida: ingrediente.unidad_medida });
    } else {
      setForm(initialForm);
    }
    setErrors({});
    setSubmitError('');
  }, [ingrediente]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido.';
    if (!form.unidad_medida) errs.unidad_medida = 'La unidad de medida es requerida.';
    if (!isEditing && form.conStock) {
      if (!form.id_bodega) errs.id_bodega = 'Selecciona una bodega.';
      const cant = parseFloat(form.cantidad);
      if (!form.cantidad || isNaN(cant) || cant <= 0) errs.cantidad = 'La cantidad debe ser mayor a 0.';
      const min = parseFloat(form.stock_minimo);
      if (form.stock_minimo === '' || isNaN(min) || min < 0) errs.stock_minimo = 'El stock mínimo debe ser ≥ 0.';
      const max = parseFloat(form.stock_maximo);
      if (form.stock_maximo === '' || isNaN(max) || max < min) errs.stock_maximo = 'El stock máximo debe ser ≥ al mínimo.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      if (isEditing) {
        await onUpdate(ingrediente!.id_ingrediente, { nombre: form.nombre.trim(), unidad_medida: form.unidad_medida });
      } else {
        const dto: CrearIngredienteDto = { nombre: form.nombre.trim(), unidad_medida: form.unidad_medida };
        if (form.conStock && form.id_bodega) {
          dto.stock_inicial = {
            id_bodega: form.id_bodega,
            cantidad: parseFloat(form.cantidad),
            stock_minimo: parseFloat(form.stock_minimo),
            stock_maximo: parseFloat(form.stock_maximo),
          };
        }
        await onCreate(dto);
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const bodegasActivas = bodegas.filter(b => b.activo);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="input-field w-full" placeholder="Ej. Harina de trigo" />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida</label>
            <select value={form.unidad_medida} onChange={e => setForm(f => ({ ...f, unidad_medida: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent">
              <option value="">Selecciona una unidad</option>
              {UNIDADES_MEDIDA.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.unidad_medida && <p className="mt-1 text-xs text-red-600">{errors.unidad_medida}</p>}
          </div>

          {!isEditing && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button type="button" onClick={() => setForm(f => ({ ...f, conStock: !f.conStock }))}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                <span>Registrar stock inicial <span className="text-gray-400 font-normal">(opcional)</span></span>
                <ChevronDown className={`w-4 h-4 transition-transform ${form.conStock ? 'rotate-180' : ''}`} />
              </button>

              {form.conStock && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bodega</label>
                    <select value={form.id_bodega ?? ''} onChange={e => setForm(f => ({ ...f, id_bodega: e.target.value ? Number(e.target.value) : null }))}
                      disabled={loadingBodegas}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100">
                      <option value="">{loadingBodegas ? 'Cargando...' : 'Selecciona una bodega'}</option>
                      {bodegasActivas.map(b => <option key={b.id_bodega} value={b.id_bodega}>{b.nombre} {b.sucursal ? `(${b.sucursal})` : ''}</option>)}
                    </select>
                    {errors.id_bodega && <p className="mt-1 text-xs text-red-600">{errors.id_bodega}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                      <input type="number" min="0.01" step="0.01" value={form.cantidad}
                        onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="0" />
                      {errors.cantidad && <p className="mt-1 text-xs text-red-600">{errors.cantidad}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock mín.</label>
                      <input type="number" min="0" step="0.01" value={form.stock_minimo}
                        onChange={e => setForm(f => ({ ...f, stock_minimo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="0" />
                      {errors.stock_minimo && <p className="mt-1 text-xs text-red-600">{errors.stock_minimo}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Stock máx.</label>
                      <input type="number" min="0" step="0.01" value={form.stock_maximo}
                        onChange={e => setForm(f => ({ ...f, stock_maximo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="0" />
                      {errors.stock_maximo && <p className="mt-1 text-xs text-red-600">{errors.stock_maximo}</p>}
                    </div>
                  </div>
                </div>
              )}
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
              {isEditing ? 'Guardar cambios' : 'Crear Ingrediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
