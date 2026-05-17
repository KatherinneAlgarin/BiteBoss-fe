import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useProveedores } from '../../hooks/useProveedores';
import type { ProveedorListItem } from '../../types/proveedor.types';

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
  }

  const tieneEmail = form.email.trim().length > 0;
  const tieneTelefono = form.telefono.trim().length > 0;

  if (!tieneEmail && !tieneTelefono) {
    errors.email = 'Debe proporcionar al menos email o teléfono';
  }

  if (tieneEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'El email no tiene un formato válido';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {proveedor ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="555-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dirección del proveedor"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={form.activo}
              onChange={(e) => handleChange('activo', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {proveedor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}