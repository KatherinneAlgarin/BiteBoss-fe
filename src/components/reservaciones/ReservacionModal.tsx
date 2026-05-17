import { useState, useEffect } from 'react';
import { X, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { crearReservacion, actualizarReservacion } from '../../services/reservacion.service';
import { listarZonasPorSucursal } from '../../services/zona.service';
import { listarMesasPorZona } from '../../services/mesa.service';
import type { ZonaItem, MesaItem, ReservacionFormData, ReservacionItem } from '../../types/reservacion.types';

export type ReservacionModalMode = 'crear' | 'editar';

interface Props {
  isOpen: boolean;
  mode: ReservacionModalMode;
  reservacion?: ReservacionItem;
  onClose: () => void;
  onSuccess: () => void;
}

const TIEMPOS_EXTRA = [0, 30, 60, 90] as const;

function calcularDuracionBase(cantidad_personas: number): number {
  if (cantidad_personas <= 2) return 60;
  if (cantidad_personas <= 4) return 90;
  if (cantidad_personas <= 7) return 120;
  return 150;
}

const EMPTY_FORM: ReservacionFormData = {
  nombre_cliente:    '',
  telefono:          '',
  email:             '',
  fecha:             '',
  hora:              '',
  cantidad_personas: '',
  id_zona:           '',
  id_mesa:           '',
  tiempo_extra:      '0',
};

type FormErrors = Partial<Record<keyof ReservacionFormData, string>>;

function validateForm(form: ReservacionFormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.nombre_cliente.trim())
    errors.nombre_cliente = 'El nombre del cliente es requerido.';
  if (!form.fecha)
    errors.fecha = 'La fecha de llegada es requerida.';
  if (!form.hora)
    errors.hora = 'La hora de llegada es requerida.';
  const personas = parseInt(form.cantidad_personas, 10);
  if (!form.cantidad_personas || isNaN(personas) || personas <= 0)
    errors.cantidad_personas = 'Ingresa un número de personas válido (mínimo 1).';
  if (!form.id_zona)
    errors.id_zona = 'La zona es requerida.';
  if (!form.id_mesa)
    errors.id_mesa = 'La mesa es requerida.';
  return errors;
}

function buildFormFromReservacion(r: ReservacionItem): ReservacionFormData {
  const dt = r.fecha_llegada ?? '';
  const [fecha = '', horaRaw = ''] = dt.includes('T') ? dt.split('T') : [dt, ''];
  const hora = horaRaw.slice(0, 5);
  const base  = calcularDuracionBase(r.cantidad_personas);
  const extra = Math.min(90, Math.max(0, r.duracion_minutos - base));
  const extraRedondeado = (Math.round(extra / 30) * 30) as 0 | 30 | 60 | 90;
  return {
    nombre_cliente:    r.nombre_cliente,
    telefono:          r.telefono ?? '',
    email:             r.email ?? '',
    fecha,
    hora,
    cantidad_personas: String(r.cantidad_personas),
    id_zona:           String(r.id_zona),
    id_mesa:           String(r.id_mesa),
    tiempo_extra:      String(extraRedondeado),
  };
}

const TITLE: Record<ReservacionModalMode, string> = {
  crear:  'Nueva reservación',
  editar: 'Editar reservación',
};

const SUBMIT_LABEL: Record<ReservacionModalMode, string> = {
  crear:  'Crear reservación',
  editar: 'Guardar cambios',
};

export function ReservacionModal({ isOpen, mode, reservacion, onClose, onSuccess }: Props) {
  const { id_sucursal } = useAuth();

  const [form, setForm]               = useState<ReservacionFormData>(EMPTY_FORM);
  const [errors, setErrors]           = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const [zonas, setZonas]                       = useState<ZonaItem[]>([]);
  const [todasMesas, setTodasMesas]             = useState<MesaItem[]>([]);
  const [mesasFiltradas, setMesasFiltradas]     = useState<MesaItem[]>([]);
  const [loadingZonas, setLoadingZonas]         = useState(false);
  const [loadingMesas, setLoadingMesas]         = useState(false);

  // Duración calculada en tiempo real
  const personas   = parseInt(form.cantidad_personas, 10);
  const tienePersonas = !isNaN(personas) && personas > 0;
  const duracionBase  = tienePersonas ? calcularDuracionBase(personas) : 0;
  const tiempoExtra   = parseInt(form.tiempo_extra, 10) || 0;
  const duracionTotal = duracionBase + tiempoExtra;

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setServerError('');
    setZonas([]);
    setTodasMesas([]);
    setMesasFiltradas([]);

    const initialForm = mode === 'editar' && reservacion
      ? buildFormFromReservacion(reservacion)
      : EMPTY_FORM;
    setForm(initialForm);

    if (!id_sucursal) return;

    void (async () => {
      setLoadingZonas(true);
      try {
        const zonasData = await listarZonasPorSucursal(id_sucursal);
        setZonas(zonasData.filter(z => z.activo));

        const zonaInicial = mode === 'editar' && reservacion ? reservacion.id_zona : null;
        if (zonaInicial) {
          setLoadingMesas(true);
          try {
            const mesasData = await listarMesasPorZona(zonaInicial);
            setTodasMesas(mesasData.filter(m => m.activo));
          } finally {
            setLoadingMesas(false);
          }
        }
      } catch {
        setServerError('Error al cargar los datos del formulario.');
      } finally {
        setLoadingZonas(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    const p = parseInt(form.cantidad_personas, 10);
    const filtradas = isNaN(p) || p <= 0
      ? todasMesas
      : todasMesas.filter(m => m.capacidad >= p);
    setMesasFiltradas(filtradas);

    if (form.id_mesa && !filtradas.find(m => String(m.id_mesa) === form.id_mesa)) {
      setForm(prev => ({ ...prev, id_mesa: '' }));
    }
  }, [form.cantidad_personas, todasMesas]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ReservacionFormData])
      setErrors(prev => ({ ...prev, [name]: undefined }));
    setServerError('');
  }

  function handleZonaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id_zona = e.target.value;
    setForm(prev => ({ ...prev, id_zona, id_mesa: '' }));
    setErrors(prev => ({ ...prev, id_zona: undefined, id_mesa: undefined }));
    setServerError('');
    setTodasMesas([]);
    setMesasFiltradas([]);

    if (!id_zona) return;

    setLoadingMesas(true);
    listarMesasPorZona(Number(id_zona))
      .then(data => setTodasMesas(data.filter(m => m.activo)))
      .catch(() => setServerError('Error al cargar las mesas.'))
      .finally(() => setLoadingMesas(false));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      const fecha_llegada       = `${form.fecha}T${form.hora}:00`;
      const tiempo_extra_minutos = parseInt(form.tiempo_extra, 10) || 0;

      const payload = {
        nombre_cliente:    form.nombre_cliente.trim(),
        telefono:          form.telefono.trim() || null,
        email:             form.email.trim() || null,
        fecha_llegada,
        cantidad_personas: parseInt(form.cantidad_personas, 10),
        id_zona:           Number(form.id_zona),
        id_mesa:           Number(form.id_mesa),
        tiempo_extra_minutos,
      };

      if (mode === 'editar' && reservacion) {
        await actualizarReservacion(reservacion.id_reservacion, payload);
      } else {
        await crearReservacion(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al procesar la reservación.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const inputClass = (field: keyof ReservacionFormData) =>
    `w-full px-3 py-2 rounded-lg border text-sm transition-colors
     focus:outline-none focus:ring-2 focus:ring-orange-400
     ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{TITLE[mode]}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form (scrollable) */}
        <form id="reservacion-form" onSubmit={handleSubmit} noValidate className="overflow-y-auto px-6 py-5 space-y-4">
          {serverError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Nombre cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre_cliente"
              value={form.nombre_cliente}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className={inputClass('nombre_cliente')}
            />
            {errors.nombre_cliente && <p className="mt-1 text-xs text-red-600">{errors.nombre_cliente}</p>}
          </div>

          {/* Teléfono y Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: 555-1234"
                className={inputClass('telefono')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={inputClass('email')}
              />
            </div>
          </div>

          {/* Fecha, Hora y Personas */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className={inputClass('fecha')}
              />
              {errors.fecha && <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="hora"
                value={form.hora}
                onChange={handleChange}
                className={inputClass('hora')}
              />
              {errors.hora && <p className="mt-1 text-xs text-red-600">{errors.hora}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personas <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="cantidad_personas"
                value={form.cantidad_personas}
                onChange={handleChange}
                min={1}
                placeholder="Ej: 4"
                className={inputClass('cantidad_personas')}
              />
              {errors.cantidad_personas && <p className="mt-1 text-xs text-red-600">{errors.cantidad_personas}</p>}
            </div>
          </div>

          {/* Duración estimada */}
          {tienePersonas && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                Duración estimada
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">
                  Base: <span className="font-medium text-gray-700">{duracionBase} min</span>
                </span>
                <span className="text-gray-300">+</span>
                <select
                  name="tiempo_extra"
                  value={form.tiempo_extra}
                  onChange={handleChange}
                  className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white
                    focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {TIEMPOS_EXTRA.map(t => (
                    <option key={t} value={t}>+{t} min</option>
                  ))}
                </select>
                <span className="text-gray-300">=</span>
                <span className="text-sm font-semibold text-orange-600">{duracionTotal} min total</span>
              </div>
            </div>
          )}

          {/* Zona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zona <span className="text-red-500">*</span>
            </label>
            <select
              name="id_zona"
              value={form.id_zona}
              onChange={handleZonaChange}
              className={inputClass('id_zona')}
              disabled={loadingZonas}
            >
              <option value="">{loadingZonas ? 'Cargando zonas...' : 'Seleccionar zona'}</option>
              {zonas.map(z => (
                <option key={z.id_zona} value={z.id_zona}>{z.nombre}</option>
              ))}
            </select>
            {errors.id_zona && <p className="mt-1 text-xs text-red-600">{errors.id_zona}</p>}
          </div>

          {/* Mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesa <span className="text-red-500">*</span>
            </label>
            <select
              name="id_mesa"
              value={form.id_mesa}
              onChange={handleChange}
              className={inputClass('id_mesa')}
              disabled={!form.id_zona || loadingMesas}
            >
              <option value="">
                {!form.id_zona
                  ? 'Selecciona una zona primero'
                  : loadingMesas
                    ? 'Cargando mesas...'
                    : mesasFiltradas.length === 0
                      ? 'Sin mesas disponibles'
                      : 'Seleccionar mesa'}
              </option>
              {mesasFiltradas.map(m => (
                <option key={m.id_mesa} value={m.id_mesa}>
                  Mesa {m.numero} (cap. {m.capacidad})
                </option>
              ))}
            </select>
            {errors.id_mesa && <p className="mt-1 text-xs text-red-600">{errors.id_mesa}</p>}
            {form.id_zona && !loadingMesas && mesasFiltradas.length === 0 && todasMesas.length > 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No hay mesas con capacidad suficiente para {form.cantidad_personas} persona(s).
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
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
            form="reservacion-form"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
              bg-orange-500 text-white text-sm font-medium hover:bg-orange-600
              transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Guardando...' : SUBMIT_LABEL[mode]}
          </button>
        </div>
      </div>
    </div>
  );
}
