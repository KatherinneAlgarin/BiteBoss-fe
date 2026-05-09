import { useMemo, useState } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import type {
  TipoOrdenItem,
  CrearTipoOrdenDto,
  ActualizarTipoOrdenDto,
} from '../../types/tipo-orden.types';

interface FormState {
  nombre: string;
  id_tipo_orden_padre: number | null;
  requiere_mesa: boolean;
}

function buildInitialForm(tipo?: TipoOrdenItem): FormState {
  return {
    nombre: tipo?.nombre ?? '',
    id_tipo_orden_padre: tipo?.id_tipo_orden_padre ?? null,
    requiere_mesa: tipo?.requiere_mesa ?? false,
  };
}

function validateForm(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
  }
  return errors;
}

function obtenerDescendientesIds(tipos: TipoOrdenItem[], idRaiz: number): Set<number> {
  const descendientes = new Set<number>();
  const stack = [idRaiz];
  while (stack.length > 0) {
    const actual = stack.pop()!;
    for (const t of tipos) {
      if (t.id_tipo_orden_padre === actual && !descendientes.has(t.id_tipo_orden)) {
        descendientes.add(t.id_tipo_orden);
        stack.push(t.id_tipo_orden);
      }
    }
  }
  return descendientes;
}

interface TipoOrdenFormProps {
  tipo?: TipoOrdenItem;
  tipos: TipoOrdenItem[];
  onCreate: (dto: CrearTipoOrdenDto) => Promise<TipoOrdenItem>;
  onUpdate: (id: number, dto: ActualizarTipoOrdenDto) => Promise<TipoOrdenItem>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TipoOrdenForm({
  tipo,
  tipos,
  onCreate,
  onUpdate,
  onSuccess,
  onCancel,
}: TipoOrdenFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(tipo));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const opcionesPadre = useMemo(() => {
    if (!tipo) return tipos;
    const idsExcluidos = obtenerDescendientesIds(tipos, tipo.id_tipo_orden);
    idsExcluidos.add(tipo.id_tipo_orden);
    return tipos.filter(t => !idsExcluidos.has(t.id_tipo_orden));
  }, [tipos, tipo]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');

      const dto = {
        nombre: form.nombre.trim(),
        id_tipo_orden_padre: form.id_tipo_orden_padre,
        requiere_mesa: form.requiere_mesa,
      };

      if (tipo) {
        await onUpdate(tipo.id_tipo_orden, dto);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {tipo ? 'Editar Tipo de Orden' : 'Crear Nuevo Tipo de Orden'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Cómo funcionan los tipos de orden:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Si dejas <span className="font-semibold">Tipo padre</span> vacío, será un tipo principal (ej: "Para llevar", "Consumir en el local").</li>
                <li>Si seleccionas un padre, será un subtipo (ej: "Mostrador" como subtipo de "Consumir en el local").</li>
                <li>Marca <span className="font-semibold">Requiere mesa</span> sólo cuando el pedido se entregue directamente a la mesa del cliente.</li>
              </ul>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre del tipo de orden"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo padre
            </label>
            <select
              value={form.id_tipo_orden_padre ?? ''}
              onChange={(e) => handleChange('id_tipo_orden_padre', e.target.value === '' ? null : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Sin padre (es un tipo principal)</option>
              {opcionesPadre.map(t => (
                <option key={t.id_tipo_orden} value={t.id_tipo_orden}>
                  {t.nombre_padre ? `${t.nombre_padre} → ${t.nombre}` : t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiere_mesa"
              checked={form.requiere_mesa}
              onChange={(e) => handleChange('requiere_mesa', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requiere_mesa" className="ml-2 text-sm text-gray-700">
              Requiere mesa
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {tipo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
