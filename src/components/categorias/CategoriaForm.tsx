import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { CategoriaItem, CrearCategoriaDto, ActualizarCategoriaDto } from '../../types/categoria.types';
import { ModalShell } from '../ui/ModalShell';

interface FormState {
  nombre: string;
}

function buildInitialForm(categoria?: CategoriaItem): FormState {
  return { nombre: categoria?.nombre ?? '' };
}

const CONTAINS_LETTER = /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/;

function validateForm(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
  } else if (!CONTAINS_LETTER.test(form.nombre)) {
    errors.nombre = 'El nombre debe contener al menos una letra';
  }
  return errors;
}

interface CategoriaFormProps {
  categoria?: CategoriaItem;
  onCreate: (dto: CrearCategoriaDto) => Promise<CategoriaItem>;
  onUpdate: (id: number, dto: ActualizarCategoriaDto) => Promise<CategoriaItem>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoriaForm({ categoria, onCreate, onUpdate, onSuccess, onCancel }: CategoriaFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(categoria));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (value: string) => {
    setForm({ nombre: value });
    if (errors.nombre) setErrors({});
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    try {
      setLoading(true);
      setSubmitError('');
      const dto = { nombre: form.nombre.trim() };
      if (categoria) {
        await onUpdate(categoria.id_categoria, dto);
      } else {
        await onCreate(dto);
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title={categoria ? 'Editar Categoría' : 'Nueva Categoría'}
      onClose={onCancel}
      maxWidthClass="max-w-md"
      panelClassName="max-h-[90vh] overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 max-h-[calc(90vh-73px)]">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej. Bebidas"
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {categoria ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
