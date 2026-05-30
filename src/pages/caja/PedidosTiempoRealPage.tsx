import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock3, RefreshCw, ClipboardList, CircleAlert, ArrowRight, History } from 'lucide-react';
import { getOrdenesTiempoReal, getHistorialEstadosOrden, updateOrden } from '../../services/orden.service';
import type { HistorialEstadoOrden, OrdenResumen } from '../../types/orden.types';
import { useAuth } from '../../hooks/useAuth';

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof ClipboardList }> = {
  NUEVO: { label: 'Nuevos', className: 'bg-orange-50 text-orange-700 border-orange-200', icon: ClipboardList },
  EN_PROCESO: { label: 'En proceso', className: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock3 },
  ENTREGADO: { label: 'Entregados', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ArrowRight },
  CANCELADO: { label: 'Cancelados', className: 'bg-red-50 text-red-700 border-red-200', icon: CircleAlert },
};

const ORDER_STATUS_CARD_STYLES: Record<string, string> = {
  NUEVO: 'bg-orange-50/70 border-orange-200',
  EN_PROCESO: 'bg-amber-50 border-amber-300 shadow-[0_10px_24px_rgba(251,191,36,0.18)]',
  ENTREGADO: 'bg-emerald-50/75 border-emerald-200',
  CANCELADO: 'bg-red-50/75 border-red-200',
};

function parseOrderDateMs(value?: string, now = Date.now()) {
  if (!value) return null;

  const normalized = String(value).trim();
  const candidates: number[] = [];

  const direct = Date.parse(normalized);
  if (!Number.isNaN(direct)) candidates.push(direct);

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  if (!hasTimezone) {
    const withT = normalized.includes(' ') ? normalized.replace(' ', 'T') : normalized;
    const asUtc = Date.parse(`${withT}Z`);
    if (!Number.isNaN(asUtc)) candidates.push(asUtc);
  }

  if (candidates.length === 0) return null;

  const nonFuture = candidates.filter(item => item <= now + 1000);
  if (nonFuture.length > 0) {
    return Math.max(...nonFuture);
  }

  return Math.min(...candidates);
}

function formatTime(iso?: string) {
  const parsed = parseOrderDateMs(iso);
  if (!parsed) return '—';
  return new Date(parsed).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatElapsed(iso?: string, now = Date.now(), endIso?: string) {
  const openedAt = parseOrderDateMs(iso, now);
  if (!openedAt) return '—';
  const endAt = endIso ? parseOrderDateMs(endIso, now) : null;
  const anchor = endAt && endAt >= openedAt ? endAt : now;
  const diff = Math.max(0, Math.floor((anchor - openedAt) / 1000));
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function nextEstado(estado: OrdenResumen['estado_operativo']): OrdenResumen['estado_operativo'] | null {
  if (estado === 'NUEVO') return 'EN_PROCESO';
  if (estado === 'EN_PROCESO') return 'ENTREGADO';
  if (estado === 'ENTREGADO') return 'OCULTO';
  if (estado === 'CANCELADO') return 'OCULTO';
  return null;
}

function estadoLabel(estado: string | null) {
  if (!estado) return '—';
  const map: Record<string, string> = {
    NUEVO: 'Nuevo',
    EN_PROCESO: 'En proceso',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
    OCULTO: 'Oculto',
  };
  return map[estado] ?? estado;
}

export function PedidosTiempoRealPage() {
  const [searchParams] = useSearchParams();
  const { role, id_sucursal: idSucursalUsuario } = useAuth();
  const isAdmin = role === 'admin';

  const idSucursalFromQuery = useMemo(() => {
    const raw = searchParams.get('id_sucursal');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const sucursalEfectiva = isAdmin
    ? idSucursalFromQuery
    : idSucursalUsuario;

  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const [highlightedIds, setHighlightedIds] = useState<number[]>([]);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [historialTarget, setHistorialTarget] = useState<OrdenResumen | null>(null);
  const [historial, setHistorial] = useState<HistorialEstadoOrden[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historialError, setHistorialError] = useState<string | null>(null);
  const previousMapRef = useRef<Map<number, string>>(new Map());

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getOrdenesTiempoReal(sucursalEfectiva ?? undefined);

      const changedIds: number[] = [];
      const previousMap = previousMapRef.current;
      const nextMap = new Map<number, string>();

      for (const item of data) {
        const prevEstado = previousMap.get(item.id_pedido);
        if (!prevEstado || prevEstado !== item.estado_operativo) {
          changedIds.push(item.id_pedido);
        }
        nextMap.set(item.id_pedido, item.estado_operativo);
      }

      previousMapRef.current = nextMap;
      setOrdenes(data);
      setError(null);

      if (changedIds.length > 0) {
        setHighlightedIds(prev => Array.from(new Set([...prev, ...changedIds])));
        window.setTimeout(() => {
          setHighlightedIds(prev => prev.filter(id => !changedIds.includes(id)));
        }, 3000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el tablero de pedidos');
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, [sucursalEfectiva]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 5000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => setTimerNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleNextEstado = useCallback(async (order: OrdenResumen) => {
    const next = nextEstado(order.estado_operativo);
    if (!next) return;

    setUpdatingIds(prev => [...prev, order.id_pedido]);
    try {
      await updateOrden(order.id_pedido, { estado_operativo: next });
      if (next === 'OCULTO') {
        setSelectedOrderId(null);
      }
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el estado del pedido');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== order.id_pedido));
    }
  }, [load]);

  const handleCancelar = useCallback(async (order: OrdenResumen) => {
    if (order.estado_operativo === 'ENTREGADO' || order.estado_operativo === 'CANCELADO') return;

    setUpdatingIds(prev => [...prev, order.id_pedido]);
    try {
      await updateOrden(order.id_pedido, { estado_operativo: 'CANCELADO' });
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el pedido');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== order.id_pedido));
    }
  }, [load]);

  const abrirHistorial = useCallback(async (order: OrdenResumen) => {
    setHistorialTarget(order);
    setLoadingHistorial(true);
    setHistorialError(null);
    try {
      const data = await getHistorialEstadosOrden(order.id_pedido);
      setHistorial(data);
    } catch (err) {
      setHistorialError(err instanceof Error ? err.message : 'No se pudo cargar el historial');
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  const grouped = useMemo(() => {
    return Object.entries(STATUS_CONFIG).map(([status, config]) => ({
      status,
      ...config,
      orders: ordenes.filter(orden => orden.estado_operativo === status),
    }));
  }, [ordenes]);

  const selectedOrder = useMemo(
    () => ordenes.find(item => item.id_pedido === selectedOrderId) ?? null,
    [ordenes, selectedOrderId]
  );

  const selectedIsUpdating = selectedOrder ? updatingIds.includes(selectedOrder.id_pedido) : false;
  const selectedNext = selectedOrder ? nextEstado(selectedOrder.estado_operativo) : null;
  const selectedCanCancel = selectedOrder
    ? selectedOrder.estado_operativo !== 'ENTREGADO' && selectedOrder.estado_operativo !== 'CANCELADO'
    : false;

  useEffect(() => {
    if (!selectedOrderId) return;
    const exists = ordenes.some(item => item.id_pedido === selectedOrderId);
    if (!exists) {
      setSelectedOrderId(null);
    }
  }, [ordenes, selectedOrderId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-400 px-4 py-4 lg:px-6 lg:py-6">
        <div className="mb-4 rounded-3xl border border-white/10 bg-linear-to-br from-white/10 via-white/5 to-white/10 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Pedidos en vivo</p>
              <h1 className="mt-1 text-3xl font-black">Tablero operativo</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>
          </div>
          {error && <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-300">Cargando pedidos...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-4">
              {grouped.map(column => {
              const Icon = column.icon;
              return (
                <section key={column.status} className={`min-h-[calc(100vh-220px)] rounded-4xl border p-4 ${column.className} bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]`}>
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h2 className="font-bold">{column.label}</h2>
                    </div>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">{column.orders.length}</span>
                  </div>

                  <div className="mt-4 space-y-3 overflow-y-auto pr-1 max-h-[68vh]">
                    {column.orders.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/40 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
                        Sin pedidos
                      </div>
                    ) : (
                      column.orders.map(order => {
                        const isHighlighted = highlightedIds.includes(order.id_pedido);
                        const isSelected = selectedOrderId === order.id_pedido;
                        const statusStyle = ORDER_STATUS_CARD_STYLES[order.estado_operativo] ?? 'bg-white border-white/60';
                        const orderCardClassName = isSelected
                          ? `${statusStyle} border-orange-500 outline outline-2 outline-orange-200`
                          : isHighlighted
                            ? `${statusStyle} border-orange-400 outline outline-2 outline-orange-100`
                            : statusStyle;

                        return (
                        <article
                          key={order.id_pedido}
                          onClick={() => setSelectedOrderId(order.id_pedido)}
                          className={`cursor-pointer rounded-2xl border px-4 py-4 shadow-sm transition-all min-h-65 flex flex-col ${orderCardClassName}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">#{order.numero_orden}</p>
                              <h3 className="mt-1 font-bold text-slate-900">
                                {order.nombre_cliente}{order.apellido_cliente ? ` ${order.apellido_cliente}` : ''}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">{order.tipo_orden ?? 'Pedido'} · {formatTime(order.fecha_apertura)}</p>
                              <p className="mt-1 text-xs font-medium text-slate-500">Tiempo: {formatElapsed(order.fecha_apertura, timerNow, order.fecha_cerrado)}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">${Number(order.total ?? 0).toFixed(2)}</span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            {order.mesa_numero ? <span className="rounded-full bg-slate-100 px-2.5 py-1">Mesa {order.mesa_numero}</span> : null}
                            {order.usuario_nombre ? <span className="rounded-full bg-slate-100 px-2.5 py-1">{order.usuario_nombre}</span> : null}
                          </div>

                          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Detalle</p>
                            {order.detalles && order.detalles.length > 0 ? (
                              <div className="mt-1.5 space-y-1.5">
                                {order.detalles.slice(0, 4).map((detalle, index) => (
                                  <p key={`${order.id_pedido}-${detalle.id_producto}-${index}`} className="text-xs text-slate-700">
                                    {detalle.cantidad}x {detalle.nombre_producto ?? `Producto ${detalle.id_producto}`}
                                    {detalle.nota ? ` · ${detalle.nota}` : ''}
                                  </p>
                                ))}
                                {order.detalles.length > 4 ? (
                                  <p className="text-[11px] font-semibold text-slate-500">+{order.detalles.length - 4} más</p>
                                ) : null}
                              </div>
                            ) : (
                              <p className="mt-1.5 text-xs text-slate-500">Sin detalle disponible</p>
                            )}
                          </div>
                        </article>
                        );
                      })
                    )}
                  </div>
                </section>
              );
            })}
            </div>

            <div className="fixed bottom-6 left-4 right-4 z-30 sm:left-auto sm:right-6 sm:w-110">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/90 px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">Acciones</p>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {selectedOrder ? `Pedido #${selectedOrder.numero_orden}` : 'Selecciona una card'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {selectedOrder ? estadoLabel(selectedOrder.estado_operativo) : 'Para actualizar, ver historial o cancelar'}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {selectedOrder ? 'Listo' : 'Sin selección'}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    onClick={() => selectedOrder && void handleNextEstado(selectedOrder)}
                    disabled={!selectedOrder || !selectedNext || selectedIsUpdating}
                    className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {selectedIsUpdating ? 'Actualizando...' : selectedNext === 'OCULTO' ? 'Ocultar' : 'Siguiente'}
                  </button>
                  <button
                    onClick={() => selectedOrder && void abrirHistorial(selectedOrder)}
                    disabled={!selectedOrder}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <History className="h-4 w-4" />
                    Historial
                  </button>
                  <button
                    onClick={() => selectedOrder && void handleCancelar(selectedOrder)}
                    disabled={!selectedOrder || !selectedCanCancel || selectedIsUpdating}
                    className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {historialTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">Historial de estados</h2>
                <p className="text-sm text-slate-500">Pedido #{historialTarget.numero_orden}</p>
              </div>
              <button
                onClick={() => setHistorialTarget(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-5">
              {loadingHistorial ? (
                <p className="text-sm text-slate-500">Cargando historial...</p>
              ) : historialError ? (
                <p className="text-sm text-red-600">{historialError}</p>
              ) : historial.length === 0 ? (
                <p className="text-sm text-slate-500">Aún no hay cambios de estado registrados.</p>
              ) : (
                <div className="space-y-3">
                  {historial.map(item => (
                    <div key={item.id_auditoria} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-800">
                        {estadoLabel(item.estado_anterior)} {'->'} {estadoLabel(item.estado_nuevo)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(item.creado_en).toLocaleString('es-ES')} · {item.usuario_nombre ?? 'Usuario'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}