// components/pos/OrderEditModal.tsx
import { useState, useEffect } from 'react';
import type { Orden, Detalle } from '../../types/orden.types';
import { useOrden } from '../../hooks/useOrdenes';
import { useMetodosPago } from '../../hooks/usePagos';
import { useTiposOrden } from '../../hooks/useTiposOrden';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertMessage } from '../ui/AlertMessage';
import { ModalShell } from '../ui/ModalShell';
import { ProductItem } from './ProductItem';

interface OrderEditModalProps {
  orden: Orden;
  isOpen: boolean;
  onClose: () => void;
}

const SUCURSAL_ID = 1; // TODO: Obtener de auth context

export function OrderEditModal({ orden: initialOrden, isOpen, onClose }: OrderEditModalProps) {
  const [orden, setOrden] = useState<Orden>(initialOrden);
  const { update, updateDetalle, removeDetalle, loading, error } = useOrden(initialOrden.id_pedido);
  const { metodos, loading: loadingMetodos } = useMetodosPago(SUCURSAL_ID);
  const { tipos } = useTiposOrden();
  const [selectedMetodo, setSelectedMetodo] = useState<string>('');

  useEffect(() => {
    setOrden(initialOrden);
  }, [initialOrden]);

  const calculateTotals = (detalles: Detalle[]) => {
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const impuesto = subtotal * 0.12;
    const total = subtotal + impuesto;
    return { subtotal, impuesto, total };
  };

  const handleTipoOrdenChange = async (tipo: string) => {
    try {
      const updates: Partial<Orden> = { tipo_orden: tipo };
      await update(updates);
    } catch {
      // Error handled in hook
    }
  };

  const handleIncrease = async (detalle: Detalle) => {
    const newCantidad = detalle.cantidad + 1;
    try {
      await updateDetalle(detalle.id_pedido_producto, { cantidad: newCantidad });
    } catch {
      // Error handled in hook
    }
  };

  const handleDecrease = async (detalle: Detalle) => {
    if (detalle.cantidad <= 1) return;
    const newCantidad = detalle.cantidad - 1;
    try {
      await updateDetalle(detalle.id_pedido_producto, { cantidad: newCantidad });
    } catch {
      // Error handled in hook
    }
  };

  const handleRemove = async (detalle: Detalle) => {
    try {
      await removeDetalle(detalle.id_pedido_producto);
    } catch {
      // Error handled in hook
    }
  };

  const handleConfirmar = async () => {
    if (orden.detalles.length === 0) {
      alert('La orden debe tener al menos un producto.');
      return;
    }
    try {
      await update({ estado_operativo: 'POR_COBRAR' });
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelar = async () => {
    try {
      await update({ estado_operativo: 'CANCELADO' });
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  if (!isOpen) return null;

  const { subtotal, impuesto, total } = calculateTotals(orden.detalles);

  return (
    <ModalShell
      title={`Editar Orden #${orden.numero_orden}`}
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[90vh] overflow-hidden"
    >
      <div className="overflow-y-auto px-6 py-5 space-y-4 max-h-[calc(90vh-73px)]">

        {error && <AlertMessage type="error" message={error} />}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Tipo de Orden</label>
            <select
              value={orden.tipo_orden}
              onChange={(e) => handleTipoOrdenChange(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Seleccionar tipo</option>
              {tipos.filter(tipo => tipo.activo).map(tipo => (
                <option key={tipo.id_tipo_orden} value={tipo.nombre}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {orden.tipo_orden === 'dine-in' && (
            <div>
              <label className="block text-sm font-medium">Número de Mesa</label>
              <Input
                label="Número de Mesa"
                type="number"
                value={orden.id_mesa ?? ''}
                onChange={(e) => update({ id_mesa: parseInt(e.target.value) || undefined })}
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold">Productos</h3>
            {orden.detalles.map((detalle: Detalle) => (
              <ProductItem
                key={detalle.id_pedido_producto}
                detalle={detalle}
                onIncrease={() => handleIncrease(detalle)}
                onDecrease={() => handleDecrease(detalle)}
                onRemove={() => handleRemove(detalle)}
              />
            ))}
          </div>

          <div className="border-t pt-4">
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Impuesto (12%): ${impuesto.toFixed(2)}</p>
            <p className="font-bold">Total: ${total.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium">Método de Pago</label>
            {loadingMetodos ? (
              <LoadingSpinner />
            ) : (
              <select
                value={selectedMetodo}
                onChange={(e) => setSelectedMetodo(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Seleccionar método</option>
                {metodos.filter(m => m.disponible).map((m) => (
                  <option key={m.metodo} value={m.metodo}>{m.descripcion}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={handleCancelar} disabled={loading}>
              Cancelar Orden
            </Button>
            <Button onClick={handleConfirmar} disabled={loading}>
              Confirmar Pedido
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}