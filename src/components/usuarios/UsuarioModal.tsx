import { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import type { CrearUsuarioDto, RolItem, UsuarioListItem } from '../../types/usuario.types';
import type { SucursalItem } from '../../types/sucursal.types';

export type UsuarioModalMode = 'crear' | 'editar' | 'ver';

interface FormState {
  nombre: string;
  email: string;
  password: string;
  id_rol: string;
  id_sucursal: string;
}

function buildInitialForm(usuario?: UsuarioListItem): FormState {
  return {
    nombre:      usuario?.nombre      ?? '',
    email:       usuario?.email       ?? '',
    password:    '',
    id_rol:      usuario?.id_rol      ? String(usuario.id_rol)      : '',
    id_sucursal: usuario?.id_sucursal ? String(usuario.id_sucursal) : '',
  };
}

function validateForm(form: FormState, mode: UsuarioModalMode): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.nombre.trim() || form.nombre.trim().length < 2)
    errors.nombre = 'El nombre es requerido (mínimo 2 caracteres)';

  if (!form.email.trim())
    errors.email = 'El correo es requerido';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'El correo no tiene un formato válido';

  // La contraseña solo es obligatoria al crear
  if (mode === 'crear') {
    if (!form.password)
      errors.password = 'La contraseña temporal es requerida';
    else if (form.password.length < 6)
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!form.id_rol)      errors.id_rol      = 'El rol es requerido';
  if (!form.id_sucursal) errors.id_sucursal = 'La sucursal es requerida';

  return errors;
}

const MODAL_TITLE: Record<UsuarioModalMode, string> = {
  crear:  'Crear usuario',
  editar: 'Editar usuario',
  ver:    'Detalle de usuario',
};

const SUBMIT_LABEL: Record<UsuarioModalMode, string> = {
  crear:  'Crear usuario',
  editar: 'Guardar cambios',
  ver:    '',
};

interface Props {
  mode: UsuarioModalMode;
  roles: RolItem[];
  sucursales: SucursalItem[];
  usuario?: UsuarioListItem;
  onClose: () => void;
  onSubmit?: (dto: CrearUsuarioDto) => Promise<void>;
}

export function UsuarioModal({ mode, roles, sucursales, usuario, onClose, onSubmit }: Props) {
  const isReadOnly = mode === 'ver';
  const [form, setForm] = useState<FormState>(() => buildInitialForm(usuario));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(usuario));
    setErrors({});
    setServerError('');
  }, [usuario, mode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState])
      setErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isReadOnly || !onSubmit) return;

    const fieldErrors = validateForm(form, mode);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        nombre:      form.nombre.trim(),
        email:       form.email.trim().toLowerCase(),
        password:    form.password,
        id_rol:      Number(form.id_rol),
        id_sucursal: Number(form.id_sucursal),
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: keyof FormState) =>
    `w-full px-3 py-2 rounded-lg border text-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-orange-400
     ${isReadOnly ? 'bg-gray-50 text-gray-700 cursor-default' : ''}
     ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{MODAL_TITLE[mode]}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              readOnly={isReadOnly}
              placeholder="Ej: María García"
              className={inputClass('nombre')}
            />
            {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly={isReadOnly}
              placeholder="usuario@ejemplo.com"
              className={inputClass('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Contraseña — solo en crear/editar */}
          {mode !== 'ver' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña temporal {mode === 'crear' && <span className="text-red-500">*</span>}
                {mode === 'editar' && <span className="text-xs text-gray-400 ml-1">(dejar vacío para no cambiarla)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputClass('password')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              {showPassword && form.password && (
                <p className="mt-1 text-xs text-orange-600 font-medium">
                  Contraseña visible: {form.password}
                </p>
              )}
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            {isReadOnly ? (
              <input
                type="text"
                value={usuario?.rol ?? ''}
                readOnly
                className={inputClass('id_rol')}
              />
            ) : (
              <select
                name="id_rol"
                value={form.id_rol}
                onChange={handleChange}
                className={inputClass('id_rol')}
              >
                <option value="">Seleccionar rol</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                ))}
              </select>
            )}
            {errors.id_rol && <p className="mt-1 text-xs text-red-600">{errors.id_rol}</p>}
          </div>

          {/* Sucursal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sucursal {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            {isReadOnly ? (
              <input
                type="text"
                value={usuario?.sucursal ?? ''}
                readOnly
                className={inputClass('id_sucursal')}
              />
            ) : (
              <select
                name="id_sucursal"
                value={form.id_sucursal}
                onChange={handleChange}
                className={inputClass('id_sucursal')}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(s => (
                  <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                ))}
              </select>
            )}
            {errors.id_sucursal && <p className="mt-1 text-xs text-red-600">{errors.id_sucursal}</p>}
          </div>

          {/* Actions */}
          {isReadOnly ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium
                  text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium
                  text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                  bg-orange-500 text-white text-sm font-medium hover:bg-orange-600
                  transition-colors disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Guardando...' : SUBMIT_LABEL[mode]}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
