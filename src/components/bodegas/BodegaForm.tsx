import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { BodegaItem, CrearBodegaDto, ActualizarBodegaDto, TipoBodega } from '../../types/bodega.types';
import { TIPOS_BODEGA } from '../../types/bodega.types';
import type { SucursalItem } from '../../types/sucursal.types';
import { SucursalSelect } from '../ui/SucursalSelect';

interface FormState {
  nombre: string;
  tipo: TipoBodega | '';
  descripcion: string;
  id_sucursal: number | null;
}

interface FormErrors {
  nombre?: string;
  tipo?: string;
  id_sucursal?: string;
}

const initialForm: FormState = { nombre: '', tipo: '', descripcion: '', id_sucursal: null };

interface BodegaFormProps {
  bodega?: BodegaItem;
  isAdmin: boolean;
  sucursalIdUsuario?: number;
  sucursales: SucursalItem[];
  loadingSucursales: boolean;
  onCreate: (dto: CrearBodegaDto) => Promise<BodegaItem>;
  onUpdate: (id: number, dto: ActualizarBodegaDto) => Promise<BodegaItem>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BodegaForm({
  bodega,
  isAdmin,
  sucursalIdUsuario,
  sucursales,
  loadingSucursales,
  onCreate,
  onUpdate,
  onSuccess,
  onCancel,
}: BodegaFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!bodega;

  useEffect(() => {
    if (bodega) {
      setForm({ nombre: bodega.nombre, tipo: bodega.tipo, descripcion: bodega.descripcion ?? '', id_sucursal: bodega.id_sucursal });
    } else {
      setForm({ nombre: '', tipo: '', descripcion: '', id_sucursal: isAdmin ? null : (sucursalIdUsuario ?? null) });
    }
    setErrors({});
    setSubmitError('');
  }, [bodega, isAdmin, sucursalIdUsuario]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido.';
    if (!form.tipo) errs.tipo = 'El tipo es requerido.';
    if (!form.id_sucursal) errs.id_sucursal = 'La sucursal es requerida.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const descripcion = form.descripcion.trim() || null;
      if (isEditing) {
        const dto: import('../../types/bodega.types').ActualizarBodegaDto = {
          nombre: form.nombre.trim(),
          tipo: form.tipo as TipoBodega,
          descripcion,
          ...(isAdmin && form.id_sucursal ? { id_sucursal: form.id_sucursal } : {}),
        };
        await onUpdate(bodega!.id_bodega, dto);
      } else {
        await onCreate({ nombre: form.nombre.trim(), tipo: form.tipo as TipoBodega, descripcion, id_sucursal: form.id_sucursal! });
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Bodega' : 'Nueva Bodega'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="input-field w-full"
              placeholder="Ej. Bodega Principal"
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as TipoBodega | '' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="">Selecciona un tipo</option>
              {TIPOS_BODEGA.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              placeholder="Ej. Bodega para almacenar ingredientes secos..."
            />
          </div>

          {isAdmin && (
            <div>
              <SucursalSelect
                sucursales={sucursales}
                value={form.id_sucursal}
                onChange={(id) => setForm(f => ({ ...f, id_sucursal: id }))}
                loading={loadingSucursales}
                label="Sucursal"
                placeholder="Selecciona una sucursal"
                soloActivas
              />
              {errors.id_sucursal && <p className="mt-1 text-xs text-red-600">{errors.id_sucursal}</p>}
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 flex items-center"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Crear Bodega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
