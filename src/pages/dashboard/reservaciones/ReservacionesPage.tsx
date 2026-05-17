import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarPlus, Loader2, AlertCircle, CalendarX, Search, Pencil, X, RotateCcw, CheckCircle, MoreVertical } from 'lucide-react';
import { listarReservaciones, cancelarReservacion, reactivarReservacion, completarReservacion } from '../../../services/reservacion.service';
import { listarZonasPorSucursal } from '../../../services/zona.service';
import { ReservacionModal, type ReservacionModalMode } from '../../../components/reservaciones/ReservacionModal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useAuth } from '../../../hooks/useAuth';
import type { ReservacionItem, EstadoReservacion } from '../../../types/reservacion.types';
import type { ZonaItem } from '../../../types/zona.types';

type FiltroEstado = EstadoReservacion | 'todas';

const FILTRO_LABEL: Record<FiltroEstado, string> = {
  pendiente:  'Pendientes',
  cancelada:  'Canceladas',
  completada: 'Completadas',
  todas:      'Todas',
};

const ESTADO_BADGE: Record<EstadoReservacion, string> = {
  pendiente:  'bg-amber-100 text-amber-700',
  cancelada:  'bg-red-100 text-red-700',
  completada: 'bg-blue-100 text-blue-700',
};

const ESTADO_LABEL: Record<EstadoReservacion, string> = {
  pendiente:  'Pendiente',
  cancelada:  'Cancelada',
  completada: 'Completada',
};

function esVencida(r: ReservacionItem): boolean {
  return r.estado === 'pendiente' && new Date(r.fecha_llegada) < new Date();
}

function formatFecha(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('es-MX', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

interface ModalState {
  open: boolean;
  mode: ReservacionModalMode;
  reservacion?: ReservacionItem;
}

interface ConfirmState {
  open: boolean;
  titulo: string;
  mensaje: string;
  confirmLabel: string;
  variant: 'danger' | 'warning';
  onConfirm: () => Promise<void>;
}

const MODAL_CLOSED: ModalState     = { open: false, mode: 'crear' };
const CONFIRM_CLOSED: ConfirmState = {
  open: false, titulo: '', mensaje: '', confirmLabel: '', variant: 'danger',
  onConfirm: async () => {},
};

interface MenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className: string;
}

function RowMenu({ actions }: { actions: MenuAction[] }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pos) return;
    function handleClose() { setPos(null); }
    document.addEventListener('mousedown', handleClose);
    document.addEventListener('scroll', handleClose, true);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('scroll', handleClose, true);
    };
  }, [pos]);

  if (actions.length === 0) return <span className="text-xs text-gray-400">—</span>;

  function handleOpen() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos(prev => prev ? null : { top: rect.bottom + 4, left: rect.right - 176 });
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        aria-label="Acciones"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {pos && (
        <div
          style={{ position: 'fixed', top: pos.top, left: pos.left }}
          className="z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1"
          onMouseDown={e => e.stopPropagation()}
        >
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { setPos(null); action.onClick(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${action.className}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function hoyStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function ReservacionesPage() {
  const { role } = useAuth();

  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  const [filtroEstado, setFiltroEstado]   = useState<FiltroEstado>('pendiente');
  const [filtroFecha, setFiltroFecha]     = useState<string>(role === 'mesero' ? hoyStr() : '');
  const [filtroZona, setFiltroZona]       = useState<string>('');
  const [zonas, setZonas]                 = useState<ZonaItem[]>([]);
  const [busqueda, setBusqueda]           = useState('');

  const [modal, setModal]     = useState<ModalState>(MODAL_CLOSED);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED);

  useEffect(() => {
    listarZonasPorSucursal()
      .then(data => setZonas(data.filter(z => z.activo)))
      .catch(() => {});
  }, []);

  const estadoParam = filtroEstado === 'todas' ? undefined : filtroEstado;
  const zonaParam   = filtroZona ? Number(filtroZona) : undefined;

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await listarReservaciones(estadoParam, filtroFecha || undefined, zonaParam);
      setReservaciones(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  }, [estadoParam, filtroFecha, zonaParam]);

  useEffect(() => { void loadData(); }, [loadData]);

  const reservacionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return reservaciones;
    return reservaciones.filter(r =>
      r.nombre_cliente.toLowerCase().includes(q) ||
      (r.telefono ?? '').toLowerCase().includes(q),
    );
  }, [reservaciones, busqueda]);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function openCrear() {
    setModal({ open: true, mode: 'crear' });
  }

  function openEditar(r: ReservacionItem) {
    setModal({ open: true, mode: 'editar', reservacion: r });
  }

  function handleModalSuccess() {
    const msg = modal.mode === 'editar'
      ? 'Reservación actualizada correctamente.'
      : 'Reservación creada correctamente.';
    showSuccess(msg);
    void loadData();
  }

  function pedirCancelar(r: ReservacionItem) {
    setConfirm({
      open:         true,
      titulo:       'Cancelar reservación',
      mensaje:      `¿Estás seguro de cancelar la reservación de "${r.nombre_cliente}"? Se podrá reactivar después.`,
      confirmLabel: 'Sí, cancelar',
      variant:      'danger',
      onConfirm:    async () => {
        await cancelarReservacion(r.id_reservacion);
        setConfirm(CONFIRM_CLOSED);
        showSuccess('Reservación cancelada correctamente.');
        void loadData();
      },
    });
  }

  function pedirReactivar(r: ReservacionItem) {
    setConfirm({
      open:         true,
      titulo:       'Reactivar reservación',
      mensaje:      `¿Reactivar la reservación de "${r.nombre_cliente}"? Volverá a estado pendiente.`,
      confirmLabel: 'Sí, reactivar',
      variant:      'warning',
      onConfirm:    async () => {
        await reactivarReservacion(r.id_reservacion);
        setConfirm(CONFIRM_CLOSED);
        showSuccess('Reservación reactivada correctamente.');
        void loadData();
      },
    });
  }

  function pedirCompletar(r: ReservacionItem) {
    setConfirm({
      open:         true,
      titulo:       'Completar reservación',
      mensaje:      `¿Marcar como completada la reservación de "${r.nombre_cliente}"?`,
      confirmLabel: 'Sí, completar',
      variant:      'warning',
      onConfirm:    async () => {
        await completarReservacion(r.id_reservacion);
        setConfirm(CONFIRM_CLOSED);
        showSuccess('Reservación marcada como completada.');
        void loadData();
      },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (loadError && reservaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-600">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{loadError}</p>
        <button
          onClick={() => void loadData()}
          className="text-sm font-medium underline underline-offset-2 hover:text-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reservacionesFiltradas.length} resultado{reservacionesFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCrear}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium
            rounded-lg hover:bg-orange-600 transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          Nueva reservación
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        {/* Fila 1: búsqueda + estado */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value as FiltroEstado)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {(Object.keys(FILTRO_LABEL) as FiltroEstado[]).map(k => (
              <option key={k} value={k}>{FILTRO_LABEL[k]}</option>
            ))}
          </select>
        </div>

        {/* Fila 2: fecha + zona */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="date"
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
            {filtroFecha && (
              <button
                onClick={() => setFiltroFecha('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filtroZona}
            onChange={e => setFiltroZona(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">Todas las zonas</option>
            {zonas.map(z => (
              <option key={z.id_zona} value={z.id_zona}>{z.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mensajes */}
      {successMsg && (
        <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {loadError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Tabla */}
      {reservacionesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <CalendarX className="w-12 h-12" />
          <p className="text-sm">
            {busqueda
              ? 'Sin resultados para tu búsqueda'
              : `No hay reservaciones ${FILTRO_LABEL[filtroEstado].toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha llegada</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Personas</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Zona / Mesa</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservacionesFiltradas.map(r => (
                  <tr key={r.id_reservacion} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.nombre_cliente}</p>
                      {r.telefono && <p className="text-xs text-gray-500">{r.telefono}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatFecha(r.fecha_llegada)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{r.cantidad_personas}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span>{r.zona_nombre}</span>
                      {r.mesa_numero > 0 && (
                        <span className="text-gray-400"> · Mesa {r.mesa_numero}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${ESTADO_BADGE[r.estado]}`}>
                          {ESTADO_LABEL[r.estado]}
                        </span>
                        {esVencida(r) && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium w-fit bg-gray-100 text-gray-500">
                            Vencida
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RowMenu actions={
                        r.estado === 'pendiente' && !esVencida(r) ? [
                          { label: 'Editar',    icon: <Pencil className="w-3.5 h-3.5" />,      onClick: () => openEditar(r),     className: 'text-orange-600 hover:bg-orange-50' },
                          { label: 'Completar', icon: <CheckCircle className="w-3.5 h-3.5" />, onClick: () => pedirCompletar(r), className: 'text-blue-600 hover:bg-blue-50' },
                          { label: 'Cancelar',  icon: <X className="w-3.5 h-3.5" />,           onClick: () => pedirCancelar(r),  className: 'text-red-600 hover:bg-red-50' },
                        ] : r.estado === 'pendiente' && esVencida(r) ? [
                          { label: 'Cancelar',  icon: <X className="w-3.5 h-3.5" />,           onClick: () => pedirCancelar(r),  className: 'text-red-600 hover:bg-red-50' },
                        ] : r.estado === 'cancelada' ? [
                          { label: 'Reactivar', icon: <RotateCcw className="w-3.5 h-3.5" />,   onClick: () => pedirReactivar(r), className: 'text-amber-600 hover:bg-amber-50' },
                        ] : []
                      } />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ReservacionModal
        isOpen={modal.open}
        mode={modal.mode}
        reservacion={modal.reservacion}
        onClose={() => setModal(MODAL_CLOSED)}
        onSuccess={handleModalSuccess}
      />

      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.titulo}
        message={confirm.mensaje}
        confirmLabel={confirm.confirmLabel}
        variant={confirm.variant}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(CONFIRM_CLOSED)}
      />
    </div>
  );
}
