import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Plus, Search, Pencil, MoreVertical, Loader2, CheckCircle } from 'lucide-react';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { PedidoProveedorForm } from '../../../components/pedidos-proveedor/PedidoProveedorForm';
import { PedidoProveedorDetalle } from '../../../components/pedidos-proveedor/PedidoProveedorDetalle';
import { EditarPedidoProveedorForm } from '../../../components/pedidos-proveedor/EditarPedidoProveedorForm';
import { ConfirmarRecepcionForm } from '../../../components/pedidos-proveedor/ConfirmarRecepcionForm';
import { useAuth } from '../../../hooks/useAuth';
import { useIngredientes } from '../../../hooks/useIngredientes';
import { listarSucursales } from '../../../services/sucursal.service';
import { listarPedidos, crearPedido, obtenerPedido, editarPedido, confirmarRecepcion } from '../../../services/pedido-proveedor.service';
import type { PedidoProveedorItem, CrearPedidoProveedorDto, EditarPedidoProveedorDto, ConfirmarRecepcionDto } from '../../../types/pedido-proveedor.types';
import type { IngredienteItem } from '../../../types/ingrediente.types';
import type { SucursalItem } from '../../../types/sucursal.types';

function ActionMenu({ onVerDetalle, onEditar, onRecibir, loading, estado }: {
  onVerDetalle: () => void;
  onEditar: () => void;
  onRecibir: () => void;
  loading: boolean;
  estado: string;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.right - 192 });
    setOpen(o => !o);
  };

  return (
    <>
      <button ref={btnRef} onClick={handleOpen} disabled={loading}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>
      {open && createPortal(
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 192 }}
          className="bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
          <button onClick={() => { setOpen(false); onVerDetalle(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <Eye className="w-4 h-4 flex-shrink-0" /> Ver detalle
          </button>
          {estado === 'PENDIENTE' && (
            <>
              <div className="border-t border-gray-100 mx-2" />
              <button onClick={() => { setOpen(false); onEditar(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                <Pencil className="w-4 h-4 flex-shrink-0" /> Editar orden
              </button>
              <div className="border-t border-gray-100 mx-2" />
              <button onClick={() => { setOpen(false); onRecibir(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors">
                <CheckCircle className="w-4 h-4 flex-shrink-0" /> Confirmar recepción
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  RECIBIDO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function PedidosProveedorPage() {
  const { role, id_sucursal: idSucursalUsuario } = useAuth();
  const isAdmin = role === 'admin';

  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);

  const [pedidos, setPedidos] = useState<PedidoProveedorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroSucursal, setFiltroSucursal] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  const { ingredientes } = useIngredientes();
  const ingredientesMap = useMemo<Map<number, IngredienteItem>>(
    () => new Map(ingredientes.map(i => [i.id_ingrediente, i])),
    [ingredientes]
  );

  const [showForm, setShowForm] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoProveedorItem | null>(null);
  const [pedidoEditar, setPedidoEditar] = useState<PedidoProveedorItem | null>(null);
  const [pedidoRecibir, setPedidoRecibir] = useState<PedidoProveedorItem | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    listarSucursales(true).then(setSucursales).catch(() => {});
  }, [isAdmin]);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { id_sucursal?: number } = {};
      if (!isAdmin && idSucursalUsuario) params.id_sucursal = idSucursalUsuario;
      setPedidos(await listarPedidos(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, idSucursalUsuario]);

  useEffect(() => { loadPedidos(); }, [loadPedidos]);

  const handleCrear = async (dto: CrearPedidoProveedorDto) => {
    await crearPedido(dto);
    setShowForm(false);
    await loadPedidos();
  };

  const handleVerDetalle = async (pedido: PedidoProveedorItem) => {
    setLoadingDetalle(pedido.id_pedido_proveedor);
    try {
      const completo = await obtenerPedido(pedido.id_pedido_proveedor);
      setPedidoDetalle(completo);
    } catch {
      /* silencioso */
    } finally {
      setLoadingDetalle(null);
    }
  };

  const handleAbrirEditar = async (pedido: PedidoProveedorItem) => {
    setLoadingDetalle(pedido.id_pedido_proveedor);
    try {
      const completo = await obtenerPedido(pedido.id_pedido_proveedor);
      setPedidoEditar(completo);
    } catch {
      /* silencioso */
    } finally {
      setLoadingDetalle(null);
    }
  };

  const handleEditar = async (dto: EditarPedidoProveedorDto) => {
    if (!pedidoEditar) return;
    await editarPedido(pedidoEditar.id_pedido_proveedor, dto);
    setPedidoEditar(null);
    await loadPedidos();
  };

  const handleAbrirRecibir = async (pedido: PedidoProveedorItem) => {
    setLoadingDetalle(pedido.id_pedido_proveedor);
    try {
      const completo = await obtenerPedido(pedido.id_pedido_proveedor);
      setPedidoRecibir(completo);
    } catch {
      /* silencioso */
    } finally {
      setLoadingDetalle(null);
    }
  };

  const handleRecibir = async (dto: ConfirmarRecepcionDto) => {
    if (!pedidoRecibir) return;
    await confirmarRecepcion(pedidoRecibir.id_pedido_proveedor, dto);
    setPedidoRecibir(null);
    await loadPedidos();
  };

  const pedidosFiltrados = useMemo(() => {
    let result = pedidos;
    if (filtroProveedor.trim())
      result = result.filter(p => p.nombre_proveedor.toLowerCase().includes(filtroProveedor.toLowerCase()));
    if (filtroSucursal.trim())
      result = result.filter(p => p.nombre_sucursal.toLowerCase().includes(filtroSucursal.toLowerCase()));
    if (filtroEstado)
      result = result.filter(p => p.estado === filtroEstado);
    if (filtroFechaDesde)
      result = result.filter(p => p.fecha_pedido >= filtroFechaDesde);
    if (filtroFechaHasta)
      result = result.filter(p => p.fecha_pedido.slice(0, 10) <= filtroFechaHasta);
    return result;
  }, [pedidos, filtroProveedor, filtroSucursal, filtroEstado, filtroFechaDesde, filtroFechaHasta]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de compra</h1>
          <p className="text-gray-500 mt-1 text-sm">Pedidos realizados a proveedores.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> Nueva orden
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filtroProveedor}
            onChange={e => setFiltroProveedor(e.target.value)}
            placeholder="Buscar proveedor..."
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-48 bg-gray-50"
          />
        </div>

        {isAdmin && (
          <>
            <datalist id="sucursales-list">
              {sucursales.map(s => <option key={s.id_sucursal} value={s.nombre} />)}
            </datalist>
            <input
              type="text"
              list="sucursales-list"
              value={filtroSucursal}
              onChange={e => setFiltroSucursal(e.target.value)}
              placeholder="Buscar sucursal..."
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-44 bg-gray-50"
            />
          </>
        )}

        <div className="w-px h-6 bg-gray-200 hidden sm:block" />

        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-gray-50 text-gray-700">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="RECIBIDO">Recibido</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        <div className="w-px h-6 bg-gray-200 hidden sm:block" />

        <div className="flex items-center gap-2 border border-gray-200 rounded-md bg-gray-50 px-3 py-2">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Desde</span>
          <input
            type="date"
            value={filtroFechaDesde}
            onChange={e => setFiltroFechaDesde(e.target.value)}
            className="text-sm text-gray-700 bg-transparent border-0 focus:outline-none"
          />
          <span className="text-gray-300 text-sm">|</span>
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Hasta</span>
          <input
            type="date"
            value={filtroFechaHasta}
            onChange={e => setFiltroFechaHasta(e.target.value)}
            className="text-sm text-gray-700 bg-transparent border-0 focus:outline-none"
          />
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {loading ? (
        <div className="flex items-center justify-center min-h-48 text-orange-500">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                {pedidos.length === 0
                  ? 'No hay órdenes de compra registradas.'
                  : 'No se encontraron órdenes con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Proveedor</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Sucursal</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha pedido</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha entrega</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidosFiltrados.map(pedido => (
                    <tr key={pedido.id_pedido_proveedor} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{pedido.id_pedido_proveedor}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{pedido.nombre_proveedor}</td>
                      <td className="px-4 py-3 text-gray-600">{pedido.nombre_sucursal}</td>
                      <td className="px-4 py-3 text-gray-600">{formatFecha(pedido.fecha_pedido)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatFecha(pedido.fecha_entrega)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ${Number(pedido.monto_total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ESTADO_BADGE[pedido.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ActionMenu
                          onVerDetalle={() => handleVerDetalle(pedido)}
                          onEditar={() => handleAbrirEditar(pedido)}
                          onRecibir={() => handleAbrirRecibir(pedido)}
                          loading={loadingDetalle === pedido.id_pedido_proveedor}
                          estado={pedido.estado}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <PedidoProveedorForm
          onSubmit={handleCrear}
          onCancel={() => setShowForm(false)}
        />
      )}

      {pedidoDetalle && (
        <PedidoProveedorDetalle
          pedido={pedidoDetalle}
          onClose={() => setPedidoDetalle(null)}
        />
      )}

      {pedidoEditar && (
        <EditarPedidoProveedorForm
          pedido={pedidoEditar}
          ingredientesMap={ingredientesMap}
          onSubmit={handleEditar}
          onCancel={() => setPedidoEditar(null)}
        />
      )}

      {pedidoRecibir && (
        <ConfirmarRecepcionForm
          pedido={pedidoRecibir}
          onSubmit={handleRecibir}
          onCancel={() => setPedidoRecibir(null)}
        />
      )}
    </div>
  );
}
