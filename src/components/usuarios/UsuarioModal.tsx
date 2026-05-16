import { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import type { CrearUsuarioDto, ActualizarUsuarioDto, RolItem, UsuarioListItem } from '../../types/usuario.types';
import type { SucursalItem } from '../../types/sucursal.types';
import { formatRoleLabel } from '../../lib/roles';

export type UsuarioModalMode = 'crear' | 'editar';

interface CrearFormState {
  nombre: string;
  email: string;
  password: string;
  id_rol: string;
  id_sucursal: string;
}

interface EditarFormState {
  id_rol: string;
  id_sucursal: string;
  activo: boolean;
}

function buildInitialCrearForm(): CrearFormState {
  return {
    nombre:      '',
    email:       '',
    password:    '',
    id_rol:      '',
    id_sucursal: '',
  };
}

function buildInitialEditarForm(usuario: UsuarioListItem): EditarFormState {
  return {
    id_rol:      String(usuario.id_rol),
    id_sucursal: String(usuario.id_sucursal),
    activo:      usuario.activo,
  };
}

function validateCrearForm(form: CrearFormState): Partial<Record<keyof CrearFormState, string>> {
  const errors: Partial<Record<keyof CrearFormState, string>> = {};

  if (!form.nombre.trim() || form.nombre.trim().length < 2)
    errors.nombre = 'El nombre es requerido (mínimo 2 caracteres)';

  if (!form.email.trim())
    errors.email = 'El correo es requerido';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'El correo no tiene un formato válido';

  if (!form.password)
    errors.password = 'La contraseña es requerida';
  else if (form.password.length < 6)
    errors.password = 'La contraseña debe tener al menos 6 caracteres';

  if (!form.id_rol)      errors.id_rol      = 'El rol es requerido';
  if (!form.id_sucursal) errors.id_sucursal = 'La sucursal es requerida';

  return errors;
}

function validateEditarForm(form: EditarFormState): Partial<Record<keyof EditarFormState, string>> {
  const errors: Partial<Record<keyof EditarFormState, string>> = {};

  if (!form.id_rol)      errors.id_rol      = 'El rol es requerido';
  if (!form.id_sucursal) errors.id_sucursal = 'La sucursal es requerida';

  return errors;
}

const MODAL_TITLE: Record<UsuarioModalMode, string> = {
  crear:  'Crear nuevo usuario',
  editar: 'Editar permisos del usuario',
};

const SUBMIT_LABEL: Record<UsuarioModalMode, string> = {
  crear:  'Crear usuario',
  editar: 'Guardar cambios',
};

interface PropsCrear {
  mode: 'crear';
  roles: RolItem[];
  sucursales: SucursalItem[];
  usuario?: never;
  onClose: () => void;
  onSubmit: (dto: CrearUsuarioDto) => Promise<void>;
}

interface PropsEditar {
  mode: 'editar';
  roles: RolItem[];
  sucursales: SucursalItem[];
  usuario: UsuarioListItem;
  onClose: () => void;
  onSubmit: (id_usuario: number, dto: ActualizarUsuarioDto) => Promise<void>;
}

type Props = PropsCrear | PropsEditar;

export function UsuarioModal(props: Props) {
  const { mode, roles, sucursales, onClose } = props;
  const usuario = 'usuario' in props ? props.usuario : undefined;
  
  const [crearForm, setCrearForm] = useState<CrearFormState>(buildInitialCrearForm());
  const [editarForm, setEditarForm] = useState<EditarFormState>(
    usuario ? buildInitialEditarForm(usuario) : { id_rol: '', id_sucursal: '', activo: true }
  );
  const [crearErrors, setCrearErrors] = useState<Partial<Record<keyof CrearFormState, string>>>({});
  const [editarErrors, setEditarErrors] = useState<Partial<Record<keyof EditarFormState, string>>>({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCrearForm(buildInitialCrearForm());
    setCrearErrors({});
    setEditarErrors({});
    setServerError('');
  }, [mode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleCrearChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setCrearForm(prev => ({ ...prev, [name]: value }));
    if (crearErrors[name as keyof CrearFormState])
      setCrearErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError('');
  }

  function handleEditarChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setEditarForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setEditarForm(prev => ({ ...prev, [name]: value }));
    }
    if (editarErrors[name as keyof EditarFormState])
      setEditarErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError('');
  }

  async function handleCrearSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fieldErrors = validateCrearForm(crearForm);
    if (Object.keys(fieldErrors).length > 0) {
      setCrearErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      if (props.mode !== 'crear') return;
      await props.onSubmit({
        nombre:      crearForm.nombre.trim(),
        email:       crearForm.email.trim().toLowerCase(),
        password:    crearForm.password,
        id_rol:      Number(crearForm.id_rol),
        id_sucursal: Number(crearForm.id_sucursal),
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditarSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario || props.mode !== 'editar') return;

    const fieldErrors = validateEditarForm(editarForm);
    if (Object.keys(fieldErrors).length > 0) {
      setEditarErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      await props.onSubmit(usuario.id_usuario, {
        id_rol:      Number(editarForm.id_rol),
        id_sucursal: Number(editarForm.id_sucursal),
        activo:      editarForm.activo,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setSubmitting(false);
    }
  }

  const crearInputClass = (field: keyof CrearFormState) =>
    `w-full px-3 py-2 rounded-lg border text-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-orange-400
     ${crearErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  const editarInputClass = (field: keyof EditarFormState) =>
    `w-full px-3 py-2 rounded-lg border text-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-orange-400
     ${editarErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

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
        {mode === 'crear' ? (
          <form onSubmit={handleCrearSubmit} noValidate className="px-6 py-5 space-y-4">
            {serverError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={crearForm.nombre}
                onChange={handleCrearChange}
                placeholder="Ej: María García"
                className={crearInputClass('nombre')}
              />
              {crearErrors.nombre && <p className="mt-1 text-xs text-red-600">{crearErrors.nombre}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={crearForm.email}
                onChange={handleCrearChange}
                placeholder="usuario@ejemplo.com"
                className={crearInputClass('email')}
              />
              {crearErrors.email && <p className="mt-1 text-xs text-red-600">{crearErrors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña temporal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={crearForm.password}
                  onChange={handleCrearChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`${crearInputClass('password')} pr-10`}
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
              {crearErrors.password && <p className="mt-1 text-xs text-red-600">{crearErrors.password}</p>}
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                name="id_rol"
                value={crearForm.id_rol}
                onChange={handleCrearChange}
                className={crearInputClass('id_rol')}
              >
                <option value="">Seleccionar rol</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{formatRoleLabel(r.nombre)}</option>
                ))}
              </select>
              {crearErrors.id_rol && <p className="mt-1 text-xs text-red-600">{crearErrors.id_rol}</p>}
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal <span className="text-red-500">*</span>
              </label>
              <select
                name="id_sucursal"
                value={crearForm.id_sucursal}
                onChange={handleCrearChange}
                className={crearInputClass('id_sucursal')}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(s => (
                  <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                ))}
              </select>
              {crearErrors.id_sucursal && <p className="mt-1 text-xs text-red-600">{crearErrors.id_sucursal}</p>}
            </div>

            {/* Actions */}
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
                {submitting ? 'Creando...' : SUBMIT_LABEL[mode]}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEditarSubmit} noValidate className="px-6 py-5 space-y-4">
            {serverError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Información del usuario (solo lectura) */}
            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Nombre</label>
                <p className="text-sm font-medium text-gray-900">{usuario?.nombre}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Correo</label>
                <p className="text-sm font-medium text-gray-900">{usuario?.email}</p>
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                name="id_rol"
                value={editarForm.id_rol}
                onChange={handleEditarChange}
                className={editarInputClass('id_rol')}
              >
                <option value="">Seleccionar rol</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{formatRoleLabel(r.nombre)}</option>
                ))}
              </select>
              {editarErrors.id_rol && <p className="mt-1 text-xs text-red-600">{editarErrors.id_rol}</p>}
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sucursal <span className="text-red-500">*</span>
              </label>
              <select
                name="id_sucursal"
                value={editarForm.id_sucursal}
                onChange={handleEditarChange}
                className={editarInputClass('id_sucursal')}
              >
                <option value="">Seleccionar sucursal</option>
                {sucursales.map(s => (
                  <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                ))}
              </select>
              {editarErrors.id_sucursal && <p className="mt-1 text-xs text-red-600">{editarErrors.id_sucursal}</p>}
            </div>

            {/* Estado (Activo/Inactivo) */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={editarForm.activo}
                  onChange={handleEditarChange}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm font-medium text-gray-700">
                  Usuario activo
                  {editarForm.activo ? (
                    <span className="ml-2 text-xs font-normal text-green-600">(Puede acceder)</span>
                  ) : (
                    <span className="ml-2 text-xs font-normal text-red-600">(No puede acceder)</span>
                  )}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
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
          </form>
        )}
      </div>
    </div>
  );
}
