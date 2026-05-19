import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MoreVertical, ArrowUpDown, Settings2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { SucursalSelect } from '../../../components/ui/SucursalSelect';
import { RegistrarStockForm } from '../../../components/inventario/RegistrarStockForm';
import { AjusteStockForm } from '../../../components/inventario/AjusteStockForm';
import { EditarLimitesForm } from '../../../components/inventario/EditarLimitesForm';
import { TransferirStockForm } from '../../../components/inventario/TransferirStockForm';
import { useAuth } from '../../../hooks/useAuth';
import { useIngredientes } from '../../../hooks/useIngredientes';
import { useBodegas } from '../../../hooks/useBodegas';
import {
  getInventarioStockIngredientes,
  registrarStockIngrediente,
  ajustarStock,
  actualizarLimites,
  transferirStock,
} from '../../../services/inventario.service';
import { listarSucursales } from '../../../services/sucursal.service';
import type { InventarioIngredienteItem, RegistrarStockIngredienteDto, AjusteStockDto, ActualizarLimitesDto, TransferirStockDto } from '../../../types/inventario.types';
import type { SucursalItem } from '../../../types/sucursal.types';

type ModalMode = 'registrar' | 'ajustar' | 'limites' | 'transferir' | null;

function ActionMenu({ item, onAjustar, onLimites, onTransferir, loading }: {
  item: InventarioIngredienteItem;
  onAjustar: () => void;
  onLimites: () => void;
  onTransferir: () => void;
  loading: boolean;
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
          <button onClick={() => { setOpen(false); onAjustar(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <ArrowUpDown className="w-4 h-4 flex-shrink-0" /> Ajustar stock
          </button>
          <div className="border-t border-gray-100 mx-2" />
          <button onClick={() => { setOpen(false); onLimites(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <Settings2 className="w-4 h-4 flex-shrink-0" /> Editar límites
          </button>
          <div className="border-t border-gray-100 mx-2" />
          <button onClick={() => { setOpen(false); onTransferir(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <ArrowRight className="w-4 h-4 flex-shrink-0" /> Transferir stock
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

export function InventarioPage() {
  const { role, id_sucursal: idSucursalUsuario } = useAuth();
  const isAdmin = role === 'admin';

  const [ingredientesStock, setIngredientesStock] = useState<InventarioIngredienteItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(idSucursalUsuario);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedItem, setSelectedItem] = useState<InventarioIngredienteItem | null>(null);
  const [busquedaLote, setBusquedaLote] = useState('');
  const { ingredientes, loading: loadingIngredientes } = useIngredientes();
  const { bodegas, loading: loadingBodegas } = useBodegas(selectedSucursal ?? undefined);
  // Para transferencias: admin ve todas las bodegas, gerente solo las de su sucursal
  const { bodegas: bodegasTransferencia, loading: loadingBodegasTransferencia } = useBodegas(isAdmin ? undefined : (idSucursalUsuario ?? undefined));

  useEffect(() => {
    const load = async () => {
      setLoadingSucursales(true);
      try {
        const data = await listarSucursales(true);
        setSucursales(data);
        if (!idSucursalUsuario && data.length > 0) setSelectedSucursal(data[0].id_sucursal);
      } catch { /* silencioso */ } finally { setLoadingSucursales(false); }
    };
    load();
  }, [idSucursalUsuario]);

  const loadInventario = async () => {
    if (selectedSucursal === null) { setIngredientesStock([]); return; }
    setLoading(true);
    setError(null);
    try {
      setIngredientesStock(await getInventarioStockIngredientes(selectedSucursal));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInventario(); }, [selectedSucursal]);

  const handleRegistrar = async (dto: RegistrarStockIngredienteDto) => {
    await registrarStockIngrediente(dto);
    setModalMode(null);
    await loadInventario();
  };

  const handleAjuste = async (dto: AjusteStockDto) => {
    if (!selectedItem) return;
    setLoadingId(selectedItem.id_inventario);
    await ajustarStock(selectedItem.id_inventario, dto);
    setModalMode(null);
    setSelectedItem(null);
    setLoadingId(null);
    await loadInventario();
  };

  const handleLimites = async (dto: ActualizarLimitesDto) => {
    if (!selectedItem) return;
    setLoadingId(selectedItem.id_inventario);
    await actualizarLimites(selectedItem.id_inventario, dto);
    setModalMode(null);
    setSelectedItem(null);
    setLoadingId(null);
    await loadInventario();
  };

  const handleTransferir = async (dto: TransferirStockDto) => {
    if (!selectedItem) return;
    setLoadingId(selectedItem.id_inventario);
    await transferirStock(selectedItem.id_inventario, dto);
    setModalMode(null);
    setSelectedItem(null);
    setLoadingId(null);
    await loadInventario();
  };

  const openAjustar = (item: InventarioIngredienteItem) => { setSelectedItem(item); setModalMode('ajustar'); };
  const openLimites = (item: InventarioIngredienteItem) => { setSelectedItem(item); setModalMode('limites'); };
  const openTransferir = (item: InventarioIngredienteItem) => { setSelectedItem(item); setModalMode('transferir'); };
  const closeModal = () => { setModalMode(null); setSelectedItem(null); };

  const ingredientesFiltrados = useMemo(() => {
    if (!busquedaLote.trim()) return ingredientesStock;
    return ingredientesStock.filter(i => i.lote?.toLowerCase().includes(busquedaLote.toLowerCase()));
  }, [ingredientesStock, busquedaLote]);

  const totalAlertas = useMemo(() => ingredientesStock.filter(i => i.en_alerta || i.vencido || i.proxima_vencer).length, [ingredientesStock]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75 text-orange-500">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1 text-sm">Stock actual de ingredientes por sucursal.</p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <div className="w-full sm:w-64">
            <SucursalSelect
              sucursales={sucursales}
              value={selectedSucursal}
              onChange={setSelectedSucursal}
              loading={loadingSucursales}
              label="Sucursal"
              placeholder="Selecciona una sucursal"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <AlertCircle className={`w-4 h-4 ${totalAlertas > 0 ? 'text-red-500' : 'text-green-500'}`} />
            <span className="font-medium text-gray-700">Alertas:</span>
            <span className={`font-semibold ${totalAlertas > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalAlertas}
            </span>
          </div>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {!error && selectedSucursal === null && (
        <AlertMessage type="info" message="Selecciona una sucursal para ver su inventario." />
      )}

      {!error && selectedSucursal !== null && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Ingredientes en stock</h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={busquedaLote}
                onChange={e => setBusquedaLote(e.target.value)}
                placeholder="Buscar por lote..."
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-48"
              />
              <button onClick={() => setModalMode('registrar')}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" /> Registrar stock
              </button>
            </div>
          </div>

          {ingredientesStock.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No hay ingredientes con stock registrado para esta sucursal.</p>
            </div>
          ) : ingredientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No se encontraron registros con el lote "<span className="font-medium">{busquedaLote}</span>".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ingrediente</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Bodega</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock actual</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Unidad</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Mín.</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Máx.</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Lote</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Vencimiento</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ingredientesFiltrados.map(item => {
                    const rowBg = item.vencido
                      ? 'bg-red-50 hover:bg-red-100'
                      : item.proxima_vencer
                      ? 'bg-yellow-50 hover:bg-yellow-100'
                      : item.en_alerta
                      ? 'bg-orange-50 hover:bg-orange-100'
                      : 'hover:bg-gray-50';

                    const estadoBadge = item.vencido
                      ? 'bg-red-100 text-red-700'
                      : item.proxima_vencer
                      ? 'bg-yellow-100 text-yellow-700'
                      : item.en_alerta
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700';

                    const estadoTexto = item.vencido
                      ? 'Vencido'
                      : item.proxima_vencer
                      ? 'Por vencer'
                      : item.en_alerta
                      ? 'Bajo mínimo'
                      : 'Normal';

                    return (
                      <tr key={item.id_inventario} className={rowBg}>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.nombre_ingrediente}</td>
                        <td className="px-4 py-3 text-gray-600">{item.nombre_bodega}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${item.en_alerta ? 'text-orange-700' : 'text-gray-900'}`}>
                          {item.stock_actual}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.unidad_medida}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.stock_minimo}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{item.stock_maximo}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.lote ?? <span className="text-gray-400">—</span>}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {item.fecha_vencimiento
                            ? new Date(item.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : <span className="text-gray-400">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${estadoBadge}`}>
                            {estadoTexto}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ActionMenu
                            item={item}
                            onAjustar={() => openAjustar(item)}
                            onLimites={() => openLimites(item)}
                            onTransferir={() => openTransferir(item)}
                            loading={loadingId === item.id_inventario}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalMode === 'registrar' && (
        <RegistrarStockForm
          ingredientes={ingredientes}
          bodegas={bodegas}
          loadingIngredientes={loadingIngredientes}
          loadingBodegas={loadingBodegas}
          onSubmit={handleRegistrar}
          onCancel={closeModal}
        />
      )}

      {modalMode === 'ajustar' && selectedItem && (
        <AjusteStockForm
          item={selectedItem}
          onSubmit={handleAjuste}
          onCancel={closeModal}
        />
      )}

      {modalMode === 'limites' && selectedItem && (
        <EditarLimitesForm
          item={selectedItem}
          onSubmit={handleLimites}
          onCancel={closeModal}
        />
      )}

      {modalMode === 'transferir' && selectedItem && (
        <TransferirStockForm
          item={selectedItem}
          bodegas={bodegasTransferencia}
          loadingBodegas={loadingBodegasTransferencia}
          onSubmit={handleTransferir}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}
