import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import { obtenerSucursal } from '../../services/sucursal.service';
import type {
  SucursalItem,
  SucursalDetalle,
  CrearSucursalDto,
  ActualizarSucursalDto,
} from '../../types/sucursal.types';
import type { TipoOrdenItem } from '../../types/tipo-orden.types';
import type { TipoPagoItem } from '../../types/tipo-pago.types';

interface FormState {
  nombre: string;
  direccion: string;
  tipos_orden: number[];
  tipos_pago: number[];
}

interface FormErrors {
  nombre?: string;
  tipos_orden?: string;
  tipos_pago?: string;
}

const initialForm: FormState = {
  nombre: '',
  direccion: '',
  tipos_orden: [],
  tipos_pago: [],
};

interface SucursalFormProps {
  sucursal?: SucursalItem;
  tiposOrden: TipoOrdenItem[];
  tiposPago: TipoPagoItem[];
  loadingCatalogos: boolean;
  onCreate: (dto: CrearSucursalDto) => Promise<SucursalDetalle>;
  onUpdate: (id: number, dto: ActualizarSucursalDto) => Promise<SucursalDetalle>;
  onSuccess: () => void;
  onCancel: () => void;
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter(v => v !== id) : [...list, id];
}

export function SucursalForm({
  sucursal,
  tiposOrden,
  tiposPago,
  loadingCatalogos,
  onCreate,
  onUpdate,
  onSuccess,
  onCancel,
}: SucursalFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const tiposOrdenSeleccionables = useMemo(() => {
    const activos = tiposOrden.filter(t => t.activo);
    const idsConHijos = new Set(
      activos
        .map(t => t.id_tipo_orden_padre)
        .filter((id): id is number => id !== null && id !== undefined),
    );
    return activos.filter(t => !idsConHijos.has(t.id_tipo_orden));
  }, [tiposOrden]);

  const tiposPagoSeleccionables = useMemo(
    () => tiposPago.filter(t => t.activo),
    [tiposPago],
  );

  useEffect(() => {
    if (!sucursal) {
      setForm(initialForm);
      return;
    }
    let cancelado = false;
    (async () => {
      try {
        setLoadingDetalle(true);
        setSubmitError('');
        const detalle = await obtenerSucursal(sucursal.id_sucursal);
        if (cancelado) return;
        setForm({
          nombre: detalle.nombre,
          direccion: detalle.direccion ?? '',
          tipos_orden: detalle.tipos_orden.map(t => t.id_tipo_orden),
          tipos_pago: detalle.tipos_pago.map(t => t.id_tipo_pago),
        });
      } catch (err) {
        if (!cancelado) {
          setSubmitError(err instanceof Error ? err.message : 'Error al cargar la sucursal');
        }
      } finally {
        if (!cancelado) setLoadingDetalle(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [sucursal]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es requerido';
    if (form.tipos_orden.length === 0) next.tipos_orden = 'Selecciona al menos un tipo de orden';
    if (form.tipos_pago.length === 0) next.tipos_pago = 'Selecciona al menos un método de pago';
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

      if (sucursal) {
        await onUpdate(sucursal.id_sucursal, {
          nombre: form.nombre.trim(),
          direccion: form.direccion.trim() || null,
          tipos_orden: form.tipos_orden,
          tipos_pago: form.tipos_pago,
        });
      } else {
        await onCreate({
          nombre: form.nombre.trim(),
          direccion: form.direccion.trim() || null,
          tipos_orden: form.tipos_orden,
          tipos_pago: form.tipos_pago,
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {sucursal ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-800 flex gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Una sucursal necesita al menos un <span className="font-semibold">tipo de orden</span> y un{' '}
              <span className="font-semibold">método de pago</span>. Las zonas se gestionan en su propio módulo.
            </p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
          )}

          {loadingDetalle && (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Cargando datos de la sucursal...
            </div>
          )}

          <fieldset className="space-y-4" disabled={loadingDetalle}>
            <legend className="sr-only">Datos básicos</legend>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre de la sucursal"
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <textarea
                value={form.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección física de la sucursal"
              />
            </div>
          </fieldset>

          <CheckboxGroup
            label="Tipos de orden vinculados *"
            emptyMessage={loadingCatalogos ? 'Cargando...' : 'No hay tipos de orden registrados'}
            options={tiposOrdenSeleccionables.map(t => ({
              id: t.id_tipo_orden,
              label: t.nombre_padre ? `${t.nombre_padre} → ${t.nombre}` : t.nombre,
            }))}
            selected={form.tipos_orden}
            onToggle={(id) => handleChange('tipos_orden', toggleId(form.tipos_orden, id))}
            error={errors.tipos_orden}
            disabled={loadingDetalle}
          />

          <CheckboxGroup
            label="Métodos de pago aceptados *"
            emptyMessage={loadingCatalogos ? 'Cargando...' : 'No hay tipos de pago registrados'}
            options={tiposPagoSeleccionables.map(t => ({ id: t.id_tipo_pago, label: t.nombre }))}
            selected={form.tipos_pago}
            onToggle={(id) => handleChange('tipos_pago', toggleId(form.tipos_pago, id))}
            error={errors.tipos_pago}
            disabled={loadingDetalle}
          />

          <div className="flex justify-end space-x-3 pt-2">
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
              disabled={loading || loadingDetalle}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {sucursal ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CheckboxGroupProps {
  label: string;
  emptyMessage: string;
  options: { id: number; label: string }[];
  selected: number[];
  onToggle: (id: number) => void;
  error?: string;
  disabled?: boolean;
}

function CheckboxGroup({ label, emptyMessage, options, selected, onToggle, error, disabled }: CheckboxGroupProps) {
  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
      {options.length === 0 ? (
        <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}>
          {options.map(opt => (
            <label key={opt.id} className="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => onToggle(opt.id)}
                disabled={disabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
