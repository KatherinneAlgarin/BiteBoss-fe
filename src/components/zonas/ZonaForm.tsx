import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type {
  ZonaItem,
  CrearZonaDto,
  ActualizarZonaDto,
} from '../../types/zona.types';

interface FormState {
  nombre: string;
  descripcion: string;
}

interface FormErrors {
  nombre?: string;
}

const emptyForm: FormState = { nombre: '', descripcion: '' };

interface ZonaFormProps {
  zona?: ZonaItem;
  id_sucursal: number;
  onCreate: (dto: CrearZonaDto) => Promise<ZonaItem>;
  onUpdate: (id: number, dto: ActualizarZonaDto) => Promise<ZonaItem>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ZonaForm({
  zona,
  id_sucursal,
  onCreate,
  onUpdate,
  onSuccess,
  onCancel,
}: ZonaFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    zona
      ? { nombre: zona.nombre, descripcion: zona.descripcion ?? '' }
      : emptyForm,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(
      zona
        ? { nombre: zona.nombre, descripcion: zona.descripcion ?? '' }
        : emptyForm,
    );
    setErrors({});
    setSubmitError('');
  }, [zona]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es requerido';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');

      if (zona) {
        await onUpdate(zona.id_zona, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
        });
      } else {
        await onCreate({
          id_sucursal,
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || null,
        });
      }

      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {zona ? 'Editar Zona' : 'Nueva Zona'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej. Terraza, Salón principal"
            />
            {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Información opcional sobre la zona"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {zona ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
