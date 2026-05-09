// components/pos/OrderEditModal.tsx
import { useState, useEffect } from 'react';
import type { Orden, Detalle } from '../../types/orden.types';
import { useOrden } from '../../hooks/useOrdenes';
import { useMetodosPago } from '../../hooks/usePagos';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertMessage } from '../ui/AlertMessage';
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

  const handleTipoOrdenChange = async (tipo: 'dine-in' | 'takeout' | 'delivery') => {
    try {
      const updates: any = { tipo_orden: tipo };
      if (tipo !== 'dine-in') {
        updates.id_mesa = null;
      }
      await update(updates);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleIncrease = async (detalle: Detalle) => {
    const newCantidad = detalle.cantidad + 1;
    try {
      await updateDetalle(detalle.id_pedido_producto, { cantidad: newCantidad });
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleDecrease = async (detalle: Detalle) => {
    if (detalle.cantidad <= 1) return;
    const newCantidad = detalle.cantidad - 1;
    try {
      await updateDetalle(detalle.id_pedido_producto, { cantidad: newCantidad });
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleRemove = async (detalle: Detalle) => {
    try {
      await removeDetalle(detalle.id_pedido_producto);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleConfirmar = async () => {
    if (orden.detalles.length === 0) {
      alert('La orden debe tener al menos un producto.');
      return;
    }
    try {
      await update({ estado_operativo: 'EN_PREPARACION' });
      onClose();
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleCancelar = async () => {
    try {
      await update({ estado_operativo: 'CANCELADO' });
      onClose();
    } catch (err) {
      // Error handled in hook
    }
  };

  if (!isOpen) return null;

  const { subtotal, impuesto, total } = calculateTotals(orden.detalles);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Editar Orden #{orden.numero_orden}</h2>

        {error && <AlertMessage type="error" message={error} />}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Tipo de Orden</label>
            <select
              value={orden.tipo_orden}
              onChange={(e) => handleTipoOrdenChange(e.target.value as any)}
              className="mt-1 block w-full border-gray-300 rounded-md"
            >
              <option value="dine-in">Consumir en el local</option>
              <option value="takeout">Para llevar</option>
              <option value="delivery">Delivery</option>
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
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">Seleccionar método</option>
                {metodos.filter(m => m.disponible).map((m) => (
                  <option key={m.metodo} value={m.metodo}>{m.descripcion}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={handleCancelar} disabled={loading}>
              Cancelar Orden
            </Button>
            <Button onClick={handleConfirmar} disabled={loading}>
              Confirmar Pedido
            </Button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">X</button>
      </div>
    </div>
  );
}