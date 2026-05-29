import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type {
  MesaItem,
  CrearMesaDto,
  ActualizarMesaDto,
} from '../../types/mesa.types';
import type { ZonaItem } from '../../types/zona.types';
import { ModalShell } from '../ui/ModalShell';

interface FormState {
  id_zona: number | '';
  numero: string;
  capacidad: string;
}

interface FormErrors {
  id_zona?: string;
  numero?: string;
  capacidad?: string;
}

interface MesaFormProps {
  mesa?: MesaItem;
  zonaActual: number;
  zonasDisponibles: ZonaItem[];
  onCreate: (dto: CrearMesaDto) => Promise<MesaItem>;
  onUpdate: (id: number, dto: ActualizarMesaDto) => Promise<MesaItem>;
  onSuccess: () => void;
  onCancel: () => void;
}

function buildInitialForm(mesa: MesaItem | undefined, zonaActual: number): FormState {
  if (!mesa) {
    return { id_zona: zonaActual, numero: '', capacidad: '' };
  }
  return {
    id_zona: mesa.id_zona,
    numero: String(mesa.numero),
    capacidad: String(mesa.capacidad),
  };
}

export function MesaForm({
  mesa,
  zonaActual,
  zonasDisponibles,
  onCreate,
  onUpdate,
  onSuccess,
  onCancel,
}: MesaFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(mesa, zonaActual));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(mesa, zonaActual));
    setErrors({});
    setSubmitError('');
  }, [mesa, zonaActual]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (form.id_zona === '' || typeof form.id_zona !== 'number') {
      next.id_zona = 'Selecciona una zona';
    }
    const numero = parseInt(form.numero, 10);
    if (!form.numero.trim() || isNaN(numero) || numero <= 0) {
      next.numero = 'Número entero positivo requerido';
    }
    const capacidad = parseInt(form.capacidad, 10);
    if (!form.capacidad.trim() || isNaN(capacidad) || capacidad < 1) {
      next.capacidad = 'Capacidad debe ser al menos 1';
    }
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

      const numero = parseInt(form.numero, 10);
      const capacidad = parseInt(form.capacidad, 10);
      const id_zona = form.id_zona as number;

      if (mesa) {
        await onUpdate(mesa.id_mesa, { id_zona, numero, capacidad });
      } else {
        await onCreate({ id_zona, numero, capacidad });
      }

      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title={mesa ? 'Editar Mesa' : 'Nueva Mesa'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona <span className="text-red-500">*</span></label>
            <select
              value={form.id_zona}
              onChange={(e) => handleChange('id_zona', e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                errors.id_zona ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una zona</option>
              {zonasDisponibles.map(z => (
                <option key={z.id_zona} value={z.id_zona}>{z.nombre}</option>
              ))}
            </select>
            {errors.id_zona && <p className="mt-1 text-sm text-red-600">{errors.id_zona}</p>}
            {mesa && form.id_zona !== mesa.id_zona && (
              <p className="mt-1 text-xs text-amber-700">Estás moviendo la mesa a otra zona.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              value={form.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                errors.numero ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej. 1"
            />
            {errors.numero && <p className="mt-1 text-sm text-red-600">{errors.numero}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (personas) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              value={form.capacidad}
              onChange={(e) => handleChange('capacidad', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                errors.capacidad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej. 4"
            />
            {errors.capacidad && <p className="mt-1 text-sm text-red-600">{errors.capacidad}</p>}
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
              {mesa ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
