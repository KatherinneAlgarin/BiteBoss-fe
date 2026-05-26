import { useMemo, useRef, useState } from 'react';
import { Loader2, Trash2, Search } from 'lucide-react';
import { useIngredientes } from '../../hooks/useIngredientes';
import type { PedidoProveedorItem, EditarPedidoProveedorDto, CrearPedidoDetalleDto } from '../../types/pedido-proveedor.types';
import type { IngredienteItem } from '../../types/ingrediente.types';
import { ModalShell } from '../ui/ModalShell';

interface DetalleRow {
  ingrediente: IngredienteItem;
  cantidad: string;
  precio_unitario: string;
}

interface Props {
  pedido: PedidoProveedorItem;
  ingredientesMap: Map<number, IngredienteItem>;
  onSubmit: (dto: EditarPedidoProveedorDto) => Promise<void>;
  onCancel: () => void;
}

const ESTADOS = ['PENDIENTE', 'CANCELADO'] as const;

export function EditarPedidoProveedorForm({ pedido, ingredientesMap, onSubmit, onCancel }: Props) {
  const { ingredientes, loading: loadingIngredientes } = useIngredientes();

  const buildRows = (): DetalleRow[] =>
    (pedido.detalles ?? []).map(d => {
      const ing = ingredientesMap.get(d.id_ingrediente) ?? {
        id_ingrediente: d.id_ingrediente,
        nombre: d.nombre_ingrediente,
        unidad_medida: d.unidad_medida,
        activo: true,
      };
      return { ingrediente: ing, cantidad: String(d.cantidad), precio_unitario: String(d.precio_unitario ?? '') };
    });

  const [estado, setEstado] = useState<typeof ESTADOS[number]>(pedido.estado);
  const [fechaEntrega, setFechaEntrega] = useState(
    pedido.fecha_entrega ? pedido.fecha_entrega.split('T')[0] : ''
  );
  const [detalles, setDetalles] = useState<DetalleRow[]>(buildRows);

  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const quitarDetalle = (idx: number) => setDetalles(prev => prev.filter((_, i) => i !== idx));

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
      const dto: EditarPedidoProveedorDto = {
        estado,
        ...(estado !== 'RECIBIDO' && { fecha_entrega: fechaEntrega || null }),
        detalles: detalles.map((d): CrearPedidoDetalleDto => ({
          id_ingrediente: d.ingrediente.id_ingrediente,
          cantidad: parseFloat(d.cantidad),
          precio_unitario: parseFloat(d.precio_unitario),
        })),
      };
      await onSubmit(dto);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al actualizar la orden');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={`Editar orden #${pedido.id_pedido_proveedor}`}
      onClose={onCancel}
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[90vh] flex flex-col overflow-hidden"
      headerContent={
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Editar orden #{pedido.id_pedido_proveedor}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pedido.nombre_proveedor} · {pedido.nombre_sucursal}</p>
        </div>
      }
    >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4">

            {/* Estado + Fecha entrega */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={estado} onChange={e => setEstado(e.target.value as typeof ESTADOS[number])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm">
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha entrega <span className="text-gray-400 text-xs">(opcional)</span></label>
                {estado === 'RECIBIDO' ? (
                  <p className="px-3 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                    Se registrará automáticamente al confirmar
                  </p>
                ) : (
                  <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" />
                )}
              </div>
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes <span className="text-red-500">*</span></label>

              <div ref={searchRef} className="relative mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setShowDropdown(true); }}
                    onFocus={() => { if (busqueda.trim()) setShowDropdown(true); }}
                    placeholder={loadingIngredientes ? 'Cargando...' : 'Buscar y agregar ingrediente...'}
                    disabled={loadingIngredientes}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 text-sm" />
                </div>
                {showDropdown && resultadosBusqueda.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {resultadosBusqueda.map(ing => (
                      <button key={ing.id_ingrediente} type="button" onClick={() => agregarIngrediente(ing)}
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
                        <tr key={`${d.ingrediente.id_ingrediente}-${i}`}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-gray-900">{d.ingrediente.nombre}</p>
                            <p className="text-xs text-gray-400">{d.ingrediente.unidad_medida}</p>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0.01" step="0.01" value={d.cantidad}
                              onChange={e => actualizarCantidad(i, e.target.value)} placeholder="0"
                              className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 ${errors[`cantidad_${i}`] ? 'border-red-400' : 'border-gray-300'}`} />
                            {errors[`cantidad_${i}`] && <p className="text-xs text-red-600 mt-0.5">{errors[`cantidad_${i}`]}</p>}
                          </td>
                          <td className="px-3 py-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                              <input type="number" min="0" step="0.01" value={d.precio_unitario}
                                onChange={e => actualizarPrecio(i, e.target.value)} placeholder="0.00"
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
              Guardar cambios
            </button>
          </div>
        </form>
    </ModalShell>
  );
}
