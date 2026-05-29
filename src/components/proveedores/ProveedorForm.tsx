import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useProveedores } from '../../hooks/useProveedores';
import type { ProveedorListItem } from '../../types/proveedor.types';
import { ModalShell } from '../ui/ModalShell';

const PHONE_REGEX = /^\+?[\d\s\-()./]{7,20}$/;
const CONTAINS_LETTER = /[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/;

interface FormState {
  id_proveedor?: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
}

function buildInitialForm(proveedor?: ProveedorListItem): FormState {
  return {
    id_proveedor: proveedor?.id_proveedor,
    nombre: proveedor?.nombre ?? '',
    email: proveedor?.email ?? '',
    telefono: proveedor?.telefono ?? '',
    direccion: proveedor?.direccion ?? '',
    activo: proveedor?.activo ?? true,
  };
}

function validateForm(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
  } else if (!CONTAINS_LETTER.test(form.nombre)) {
    errors.nombre = 'El nombre debe contener al menos una letra';
  }

  const tieneEmail = form.email.trim().length > 0;
  const tieneTelefono = form.telefono.trim().length > 0;

  if (!tieneEmail && !tieneTelefono) {
    errors.email = 'Debe proporcionar al menos email o teléfono';
  }

  if (tieneEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email no tiene un formato válido';
  }

  if (tieneTelefono && !PHONE_REGEX.test(form.telefono.trim())) {
    errors.telefono = 'El teléfono no tiene un formato válido (ej: +503 7000-1234)';
  }

  return errors;
}

interface ProveedorFormProps {
  proveedor?: ProveedorListItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProveedorForm({ proveedor, onSuccess, onCancel }: ProveedorFormProps) {
  const { createProveedor, updateProveedor } = useProveedores();
  const [form, setForm] = useState<FormState>(() => buildInitialForm(proveedor));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset form when proveedor changes
  const currentForm = buildInitialForm(proveedor);
  if (proveedor?.id_proveedor !== form.id_proveedor) {
    setForm(currentForm);
    setErrors({});
    setSubmitError('');
  }

  const handleChange = (field: keyof FormState, value: string | boolean) => {
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
        email: form.email.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        activo: form.activo,
      };

      if (proveedor) {
        await updateProveedor(proveedor.id_proveedor, dto);
      } else {
        await createProveedor(dto);
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
      title={proveedor ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}
      onClose={onCancel}
      maxWidthClass="max-w-md"
      panelClassName="max-h-[90vh] overflow-hidden"
    >
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 max-h-[calc(90vh-73px)]">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre del proveedor"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="contacto@proveedor.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: +503 7000-1234"
            />
            {errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
            )}
          </div>
          <p className="text-xs text-gray-500 -mt-2">* Al menos email o teléfono es requerido</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Dirección del proveedor"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => handleChange('activo', e.target.checked)}
              className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded"
            />
            <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
              Activo
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
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {proveedor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
    </ModalShell>
  );
}