import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertMessage } from '../ui/AlertMessage';
import { ModalShell } from '../ui/ModalShell';
import type { CartItem } from './CartSummary';
import type { TipoOrdenItem } from '../../types/tipo-orden.types';
import type { MesaItem } from '../../types/mesa.types';
import type { OrdenResumen } from '../../types/orden.types';
import { getOrdenesTiempoReal, createOrden } from '../../services/orden.service';
import { getMetodosPago, registrarPago } from '../../services/pago.service';
import { listarTiposOrden } from '../../services/tipo-orden.service';
import { obtenerSucursal } from '../../services/sucursal.service';
import { listarZonasPorSucursal } from '../../services/zona.service';
import { listarMesasPorZona } from '../../services/mesa.service';
import type { ZonaItem } from '../../types/zona.types';

export type CheckoutMode = 'crear-orden' | 'cerrar-cuenta';

interface CreateOrderModalProps {
  isOpen: boolean;
  mode: CheckoutMode;
  idSucursal: number | null;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function formatOrderLabel(order: OrdenResumen) {
  const mesa = order.mesa_numero ? `Mesa ${order.mesa_numero}` : 'Sin mesa';
  return `${mesa} · Pedido #${order.numero_orden} · $${order.total.toFixed(2)}`;
}

export function CreateOrderModal({
  isOpen,
  mode,
  idSucursal,
  items,
  total,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tiposOrden, setTiposOrden] = useState<TipoOrdenItem[]>([]);
  const [zonas, setZonas] = useState<ZonaItem[]>([]);
  const [mesas, setMesas] = useState<MesaItem[]>([]);
  const [pedidosMesa, setPedidosMesa] = useState<OrdenResumen[]>([]);
  const [metodosPago, setMetodosPago] = useState<Array<{ metodo: string; descripcion: string; disponible: boolean }>>([]);
  const [selectedTipoOrdenId, setSelectedTipoOrdenId] = useState<number | null>(null);
  const [selectedZonaId, setSelectedZonaId] = useState<number | null>(null);
  const [selectedMesaId, setSelectedMesaId] = useState<number | null>(null);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [selectedMetodo, setSelectedMetodo] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const selectedTipoOrden = useMemo(
    () => tiposOrden.find(tipo => tipo.id_tipo_orden === selectedTipoOrdenId) ?? null,
    [selectedTipoOrdenId, tiposOrden]
  );

  const requiresMesa = selectedTipoOrden?.requiere_mesa ?? false;

  const selectedPedido = useMemo(
    () => pedidosMesa.find(pedido => pedido.id_pedido === selectedPedidoId) ?? null,
    [pedidosMesa, selectedPedidoId]
  );

  const metodosDisponibles = useMemo(
    () => metodosPago.filter(metodo => metodo.disponible),
    [metodosPago]
  );

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setSelectedTipoOrdenId(null);
    setSelectedZonaId(null);
    setSelectedMesaId(null);
    setSelectedPedidoId(null);
    setSelectedMetodo('');
    setMessageError(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    resetForm();
    setLoadingData(true);

    const load = async () => {
      try {
        const [tipos, metodos, sucursal] = await Promise.all([
          listarTiposOrden(),
          idSucursal
            ? getMetodosPago(idSucursal)
            : Promise.resolve([]),
          idSucursal
            ? obtenerSucursal(idSucursal)
            : Promise.resolve(null),
        ]);

        const tiposPermitidos = new Set((sucursal?.tipos_orden ?? []).map(tipo => tipo.id_tipo_orden));
        const tiposActivos = tipos.filter(
          tipo => tipo.activo && (!sucursal || tiposPermitidos.has(tipo.id_tipo_orden))
        );

        setTiposOrden(tiposActivos);
        setMetodosPago(metodos);
        setSelectedTipoOrdenId(prev => prev ?? tiposActivos[0]?.id_tipo_orden ?? null);
        setSelectedMetodo(metodos.find(metodo => metodo.disponible)?.metodo ?? '');
      } catch (err) {
        setMessageError(err instanceof Error ? err.message : 'No se pudieron cargar los datos del checkout');
      } finally {
        setLoadingData(false);
      }
    };

    void load();
  }, [idSucursal, isOpen]);

  useEffect(() => {
    if (!isOpen || mode !== 'crear-orden' || !idSucursal) return;

    const loadZonas = async () => {
      try {
        const data = await listarZonasPorSucursal(idSucursal);
        const activas = data.filter(zona => zona.activo);
        setZonas(activas);
        setSelectedZonaId(prev => prev ?? activas[0]?.id_zona ?? null);
      } catch (err) {
        setMessageError(err instanceof Error ? err.message : 'No se pudieron cargar las zonas');
      }
    };

    void loadZonas();
  }, [idSucursal, isOpen, mode]);

  useEffect(() => {
    if (!isOpen || mode !== 'crear-orden' || !selectedZonaId) {
      setMesas([]);
      return;
    }

    const loadMesas = async () => {
      try {
        const data = await listarMesasPorZona(selectedZonaId);
        const activas = data.filter(mesa => mesa.activo);
        setMesas(activas);
        setSelectedMesaId(prev => prev ?? activas[0]?.id_mesa ?? null);
      } catch (err) {
        setMessageError(err instanceof Error ? err.message : 'No se pudieron cargar las mesas');
      }
    };

    void loadMesas();
  }, [isOpen, mode, selectedZonaId]);

  useEffect(() => {
    if (!isOpen || mode !== 'cerrar-cuenta' || !idSucursal) return;

    const loadPedidosMesa = async () => {
      try {
        const data = await getOrdenesTiempoReal(idSucursal);
        const abiertos = data.filter(orden => orden.mesa_numero != null && ['ABIERTO', 'POR_COBRAR'].includes(orden.estado_operativo));
        setPedidosMesa(abiertos);
        setSelectedPedidoId(prev => prev ?? abiertos[0]?.id_pedido ?? null);
      } catch (err) {
        setMessageError(err instanceof Error ? err.message : 'No se pudieron cargar las cuentas de mesa');
      }
    };

    void loadPedidosMesa();
  }, [idSucursal, isOpen, mode]);

  useEffect(() => {
    if (!selectedTipoOrden) return;

    if (!selectedTipoOrden.requiere_mesa) {
      setSelectedMesaId(null);
      return;
    }

    if (!selectedMesaId && mesas.length > 0) {
      setSelectedMesaId(mesas[0].id_mesa);
    }
  }, [mesas, requiresMesa, selectedMesaId, selectedTipoOrden]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessageError(null);

    if (!idSucursal) {
      setMessageError('No se pudo determinar la sucursal actual.');
      return;
    }

    if (mode === 'crear-orden') {
      if (!selectedTipoOrden) {
        setMessageError('Selecciona un tipo de orden.');
        return;
      }

      if (!nombre.trim()) {
        setMessageError('El nombre del cliente es requerido.');
        return;
      }

      if (!apellido.trim()) {
        setMessageError('El apellido del cliente es requerido.');
        return;
      }

      if (requiresMesa && !selectedMesaId) {
        setMessageError('Selecciona una mesa para este tipo de orden.');
        return;
      }

      if (!requiresMesa && !selectedMetodo) {
        setMessageError('Selecciona un método de pago.');
        return;
      }

      if (items.length === 0) {
        setMessageError('Agrega productos antes de confirmar el pedido.');
        return;
      }

      setSubmitting(true);
      try {
        const orden = await createOrden({
          id_sucursal: idSucursal,
          tipo_orden: selectedTipoOrden.nombre,
          id_mesa: requiresMesa ? selectedMesaId ?? undefined : undefined,
          nombre_cliente: nombre.trim(),
          apellido_cliente: apellido.trim(),
          detalles: items.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
          })),
        });

        if (!requiresMesa) {
          await registrarPago({
            id_orden: orden.id_pedido,
            monto: total,
            metodo: selectedMetodo,
          });
        }

        onSuccess(requiresMesa ? 'Pedido creado y asignado a mesa.' : 'Pedido creado y pagado correctamente.');
        onClose();
      } catch (err) {
        setMessageError(err instanceof Error ? err.message : 'No se pudo completar el pedido');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!selectedPedido) {
      setMessageError('Selecciona una cuenta de mesa para cerrar.');
      return;
    }

    if (!selectedMetodo) {
      setMessageError('Selecciona un método de pago.');
      return;
    }

    setSubmitting(true);
    try {
      await registrarPago({
        id_orden: selectedPedido.id_pedido,
        monto: selectedPedido.total,
        metodo: selectedMetodo,
      });
      onSuccess(`Cuenta de la ${selectedPedido.mesa_numero ? `mesa ${selectedPedido.mesa_numero}` : 'mesa'} cerrada correctamente.`);
      onClose();
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : 'No se pudo cerrar la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === 'crear-orden' ? 'Confirmar pedido' : 'Cerrar cuenta de mesa';
  const submitLabel = mode === 'crear-orden'
    ? (requiresMesa ? 'Crear pedido' : 'Cobrar y crear pedido')
    : 'Cobrar cuenta';

  return (
    <ModalShell title={title} onClose={handleClose} maxWidthClass="max-w-2xl" panelClassName="max-h-[90vh] overflow-hidden">
      <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-6 py-5">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {mode === 'crear-orden' ? (
            <p className="mt-1 text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'producto' : 'productos'} · Total:{' '}
              <span className="font-semibold text-orange-600">${total.toFixed(2)}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Selecciona la cuenta abierta de una mesa y cobra el total pendiente.
            </p>
          )}
        </div>

        {(messageError) && (
          <div className="mb-4">
            <AlertMessage type="error" message={messageError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'crear-orden' && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Nombre del cliente"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Juan"
                  disabled={submitting || loadingData}
                  autoFocus
                />
                <Input
                  label="Apellido del cliente"
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                  placeholder="Ej: Pérez"
                  disabled={submitting || loadingData}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de orden</label>
                <select
                  value={selectedTipoOrdenId ?? ''}
                  onChange={e => setSelectedTipoOrdenId(e.target.value ? Number(e.target.value) : null)}
                  disabled={submitting || loadingData}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Selecciona un tipo</option>
                  {tiposOrden.map(tipo => (
                    <option key={tipo.id_tipo_orden} value={tipo.id_tipo_orden}>
                      {tipo.nombre}{tipo.requiere_mesa ? ' · requiere mesa' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {requiresMesa ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Zona</label>
                    <select
                      value={selectedZonaId ?? ''}
                      onChange={e => {
                        setSelectedZonaId(e.target.value ? Number(e.target.value) : null);
                        setSelectedMesaId(null);
                      }}
                      disabled={submitting || loadingData || zonas.length === 0}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Selecciona una zona</option>
                      {zonas.map(zona => (
                        <option key={zona.id_zona} value={zona.id_zona}>
                          {zona.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Mesa</label>
                    <select
                      value={selectedMesaId ?? ''}
                      onChange={e => setSelectedMesaId(e.target.value ? Number(e.target.value) : null)}
                      disabled={submitting || loadingData || mesas.length === 0}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">Selecciona una mesa</option>
                      {mesas.map(mesa => (
                        <option key={mesa.id_mesa} value={mesa.id_mesa}>
                          Mesa {mesa.numero} · capacidad {mesa.capacidad}
                        </option>
                      ))}
                    </select>
                    {selectedZonaId && mesas.length === 0 && (
                      <p className="mt-1 text-xs text-amber-700">No hay mesas activas en esta zona.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Método de pago</label>
                  <select
                    value={selectedMetodo}
                    onChange={e => setSelectedMetodo(e.target.value)}
                    disabled={submitting || loadingData}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Selecciona un método</option>
                    {metodosDisponibles.map(metodo => (
                      <option key={metodo.metodo} value={metodo.metodo}>
                        {metodo.descripcion || metodo.metodo}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {mode === 'cerrar-cuenta' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Cuenta de mesa</label>
                <select
                  value={selectedPedidoId ?? ''}
                  onChange={e => setSelectedPedidoId(e.target.value ? Number(e.target.value) : null)}
                  disabled={submitting || loadingData || pedidosMesa.length === 0}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Selecciona una cuenta</option>
                  {pedidosMesa.map(pedido => (
                    <option key={pedido.id_pedido} value={pedido.id_pedido}>
                      {formatOrderLabel(pedido)}
                    </option>
                  ))}
                </select>
                {selectedPedido && (
                  <p className="mt-1 text-xs text-gray-500">Cliente: {selectedPedido.nombre_cliente}</p>
                )}
                {pedidosMesa.length === 0 && !loadingData && (
                  <p className="mt-1 text-xs text-amber-700">No hay cuentas abiertas con mesa para cobrar.</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Método de pago</label>
                <select
                  value={selectedMetodo}
                  onChange={e => setSelectedMetodo(e.target.value)}
                  disabled={submitting || loadingData}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Selecciona un método</option>
                  {metodosDisponibles.map(metodo => (
                    <option key={metodo.metodo} value={metodo.metodo}>
                      {metodo.descripcion || metodo.metodo}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={submitting} disabled={loadingData}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
