import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProveedores } from '../../hooks/useProveedores';
import { useIngredientes } from '../../hooks/useIngredientes';
import { listarSucursales } from '../../services/sucursal.service';
import type { CrearPedidoDetalleDto, CrearPedidoProveedorDto } from '../../types/pedido-proveedor.types';
import type { IngredienteItem } from '../../types/ingrediente.types';
import type { SucursalItem } from '../../types/sucursal.types';
import { ModalShell } from '../ui/ModalShell';

interface DetalleRow {
  ingrediente: IngredienteItem;
  cantidad: string;
  precio_unitario: string;
}

interface Props {
  onSubmit: (dto: CrearPedidoProveedorDto) => Promise<void>;
  onCancel: () => void;
}

export function PedidoProveedorForm({ onSubmit, onCancel }: Props) {
  const { role, id_sucursal: idSucursalUsuario } = useAuth();
  const isAdmin = role === 'admin';

  const { proveedores, loading: loadingProveedores } = useProveedores();
  const { ingredientes, loading: loadingIngredientes } = useIngredientes();

  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  const [idProveedor, setIdProveedor] = useState('');
  const [idSucursal, setIdSucursal] = useState(isAdmin ? '' : String(idSucursalUsuario ?? ''));
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [detalles, setDetalles] = useState<DetalleRow[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingSucursales(true);
    listarSucursales(true)
      .then(setSucursales)
      .catch(() => {})
      .finally(() => setLoadingSucursales(false));
  }, [isAdmin]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ingredientesSeleccionados = useMemo(
    () => new Set(detalles.map(d => d.ingrediente.id_ingrediente)),
    [detalles]
  );

  const resultadosBusqueda = useMemo(() => {
    if (!busqueda.trim()) return [];
    return ingredientes
      .filter(i => i.activo && !ingredientesSeleccionados.has(i.id_ingrediente))
      .filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .slice(0, 8);
  }, [busqueda, ingredientes, ingredientesSeleccionados]);

  const agregarIngrediente = (ing: IngredienteItem) => {
    setDetalles(prev => [...prev, { ingrediente: ing, cantidad: '', precio_unitario: '' }]);
    setBusqueda('');
    setShowDropdown(false);
    setErrors(prev => { const e = { ...prev }; delete e.detalles; return e; });
  };

  const quitarDetalle = (idx: number) => {
    setDetalles(prev => prev.filter((_, i) => i !== idx));
  };

  const actualizarCantidad = (idx: number, valor: string) => {
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, cantidad: valor } : d));
    setErrors(prev => { const e = { ...prev }; delete e[`cantidad_${idx}`]; return e; });
  };

  const actualizarPrecio = (idx: number, valor: string) => {
    setDetalles(prev => prev.map((d, i) => i === idx ? { ...d, precio_unitario: valor } : d));
    setErrors(prev => { const e = { ...prev }; delete e[`precio_${idx}`]; return e; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!idProveedor) errs.proveedor = 'Selecciona un proveedor';
    if (isAdmin && !idSucursal) errs.sucursal = 'Selecciona una sucursal';
    if (detalles.length === 0) errs.detalles = 'Agrega al menos un ingrediente';
    detalles.forEach((d, i) => {
      const cant = parseFloat(d.cantidad);
      if (!d.cantidad || isNaN(cant) || cant <= 0) errs[`cantidad_${i}`] = 'Debe ser mayor a 0';
      const precio = parseFloat(d.precio_unitario);
      if (!d.precio_unitario || isNaN(precio) || precio < 0) errs[`precio_${i}`] = 'Requerido, debe ser ≥ 0';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const dto: CrearPedidoProveedorDto = {
        id_proveedor: Number(idProveedor),
        id_sucursal: isAdmin ? Number(idSucursal) : (idSucursalUsuario ?? 0),
        fecha_entrega: fechaEntrega || undefined,
        detalles: detalles.map((d): CrearPedidoDetalleDto => ({
          id_ingrediente: d.ingrediente.id_ingrediente,
          cantidad: parseFloat(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario),
        })),
      };
      await onSubmit(dto);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al crear la orden');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title="Nueva orden de compra"
      onClose={onCancel}
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[90vh] flex flex-col overflow-hidden"
    >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor <span className="text-red-500">*</span></label>
              <select value={idProveedor} onChange={e => { setIdProveedor(e.target.value); setErrors(prev => { const er = { ...prev }; delete er.proveedor; return er; }); }}
                disabled={loadingProveedores}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100">
                <option value="">{loadingProveedores ? 'Cargando...' : 'Selecciona un proveedor'}</option>
                {proveedores.map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
                ))}
              </select>
              {errors.proveedor && <p className="mt-1 text-xs text-red-600">{errors.proveedor}</p>}
            </div>

            {/* Sucursal (solo admin) */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sucursal destino <span className="text-red-500">*</span></label>
                <select value={idSucursal} onChange={e => { setIdSucursal(e.target.value); setErrors(prev => { const er = { ...prev }; delete er.sucursal; return er; }); }}
                  disabled={loadingSucursales}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100">
                  <option value="">{loadingSucursales ? 'Cargando...' : 'Selecciona una sucursal'}</option>
                  {sucursales.map(s => (
                    <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
                  ))}
                </select>
                {errors.sucursal && <p className="mt-1 text-xs text-red-600">{errors.sucursal}</p>}
              </div>
            )}

            {/* Fecha entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega esperada <span className="text-gray-400 text-xs">(opcional)</span></label>
              <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes <span className="text-red-500">*</span></label>

              {/* Search */}
              <div ref={searchRef} className="relative mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setShowDropdown(true); }}
                    onFocus={() => { if (busqueda.trim()) setShowDropdown(true); }}
                    placeholder={loadingIngredientes ? 'Cargando ingredientes...' : 'Buscar ingrediente...'}
                    disabled={loadingIngredientes}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 text-sm"
                  />
                </div>
                {showDropdown && resultadosBusqueda.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {resultadosBusqueda.map(ing => (
                      <button key={ing.id_ingrediente} type="button"
                        onClick={() => agregarIngrediente(ing)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-orange-50 hover:text-orange-700 text-left">
                        <span>{ing.nombre}</span>
                        <span className="text-xs text-gray-400">{ing.unidad_medida}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && busqueda.trim() && resultadosBusqueda.length === 0 && !loadingIngredientes && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg px-4 py-3 text-sm text-gray-500">
                    No se encontraron ingredientes
                  </div>
                )}
              </div>

              {errors.detalles && <p className="mb-2 text-xs text-red-600">{errors.detalles}</p>}

              {/* Tabla detalles */}
              {detalles.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Ingrediente</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 w-28">Cantidad</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700 w-32">Precio unitario <span className="text-red-500">*</span></th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {detalles.map((d, i) => (
                        <tr key={d.ingrediente.id_ingrediente}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-900">{d.ingrediente.nombre}</p>
                            <p className="text-xs text-gray-400">{d.ingrediente.unidad_medida}</p>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0.01" step="0.01" value={d.cantidad}
                              onChange={e => actualizarCantidad(i, e.target.value)}
                              placeholder="0"
                              className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 ${errors[`cantidad_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                            {errors[`cantidad_${i}`] && <p className="text-xs text-red-600 mt-0.5">{errors[`cantidad_${i}`]}</p>}
                          </td>
                          <td className="px-3 py-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input type="number" min="0" step="0.01" value={d.precio_unitario}
                                onChange={e => actualizarPrecio(i, e.target.value)}
                                placeholder="0.00"
                                className={`w-full pl-5 pr-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 ${errors[`precio_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                            </div>
                            {errors[`precio_${i}`] && <p className="text-xs text-red-600 mt-0.5">{errors[`precio_${i}`]}</p>}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button type="button" onClick={() => quitarDetalle(i)}
                              className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detalles.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg py-6 text-center">
                  <Plus className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                  <p className="text-sm text-gray-400">Usa el buscador para agregar ingredientes</p>
                </div>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{submitError}</div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md disabled:opacity-50 flex items-center">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear orden
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
