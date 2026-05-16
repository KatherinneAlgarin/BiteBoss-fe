import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarPlus, Loader2, AlertCircle, CalendarX, Search, Pencil, X, RotateCcw } from 'lucide-react';
import { listarReservaciones, cancelarReservacion, reactivarReservacion } from '../../../services/reservacion.service';
import { ReservacionModal, type ReservacionModalMode } from '../../../components/reservaciones/ReservacionModal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import type { ReservacionItem } from '../../../types/reservacion.types';

type FiltroEstado = 'activas' | 'canceladas' | 'todas';

const FILTRO_LABEL: Record<FiltroEstado, string> = {
  activas:    'Activas',
  canceladas: 'Canceladas',
  todas:      'Todas',
};

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

const MODAL_CLOSED: ModalState      = { open: false, mode: 'crear' };
const CONFIRM_CLOSED: ConfirmState  = {
  open: false, titulo: '', mensaje: '', confirmLabel: '', variant: 'danger',
  onConfirm: async () => {},
};

export function ReservacionesPage() {
  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  const [filtroEstado, setFiltroEstado]   = useState<FiltroEstado>('activas');
  const [busqueda, setBusqueda]           = useState('');

  const [modal, setModal]     = useState<ModalState>(MODAL_CLOSED);
  const [confirm, setConfirm] = useState<ConfirmState>(CONFIRM_CLOSED);

  const activoParam = filtroEstado === 'activas'
    ? true
    : filtroEstado === 'canceladas'
      ? false
      : undefined;

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await listarReservaciones(activoParam);
      setReservaciones(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  }, [activoParam]);

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
      mensaje:      `¿Reactivar la reservación de "${r.nombre_cliente}"?`,
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
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
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

        {/* Filtro de estado */}
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {r.activo ? 'Activa' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.activo ? (
                          <>
                            <button
                              onClick={() => openEditar(r)}
                              className="flex items-center gap-1 text-xs font-medium text-orange-600
                                hover:text-orange-700 hover:underline"
                            >
                              <Pencil className="w-3 h-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => pedirCancelar(r)}
                              className="flex items-center gap-1 text-xs font-medium text-red-600
                                hover:text-red-700 hover:underline"
                            >
                              <X className="w-3 h-3" />
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => pedirReactivar(r)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600
                              hover:text-blue-700 hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reactivar
                          </button>
                        )}
                      </div>
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
