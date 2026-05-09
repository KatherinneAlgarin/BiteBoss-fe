// components/pos/CreateOrderModal.tsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertMessage } from '../ui/AlertMessage';
import type { CartItem } from './CartSummary';

export type TipoOrden = 'dine-in' | 'takeout' | 'delivery';

interface CreateOrderModalProps {
  isOpen:     boolean;
  items:      CartItem[];
  total:      number;
  isCreating: boolean;
  error:      string | null;
  onClose:    () => void;
  onSubmit:   (data: { nombre_cliente: string; apellido_cliente: string; tipo_orden: TipoOrden }) => void;
}

export function CreateOrderModal({
  isOpen,
  items,
  total,
  isCreating,
  error,
  onClose,
  onSubmit,
}: CreateOrderModalProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipoOrden, setTipoOrden] = useState<TipoOrden>('dine-in');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!nombre.trim()) {
      setValidationError('El nombre del cliente es requerido.');
      return;
    }
    if (!apellido.trim()) {
      setValidationError('El apellido del cliente es requerido.');
      return;
    }

    onSubmit({ nombre_cliente: nombre.trim(), apellido_cliente: apellido.trim(), tipo_orden: tipoOrden });
  };

  const handleClose = () => {
    if (isCreating) return;
    setNombre('');
    setApellido('');
    setTipoOrden('dine-in');
    setValidationError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmar pedido</h2>
          <p className="text-sm text-gray-500 mb-6">
            {items.length} {items.length === 1 ? 'producto' : 'productos'} · Total:{' '}
            <span className="font-semibold text-orange-600">${total.toFixed(2)}</span>
          </p>

          {(error || validationError) && (
            <div className="mb-4">
              <AlertMessage type="error" message={validationError ?? error ?? ''} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del cliente"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Juan"
              disabled={isCreating}
              autoFocus
            />
            <Input
              label="Apellido del cliente"
              value={apellido}
              onChange={e => setApellido(e.target.value)}
              placeholder="Ej: Pérez"
              disabled={isCreating}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de orden
              </label>
              <select
                value={tipoOrden}
                onChange={e => setTipoOrden(e.target.value as TipoOrden)}
                disabled={isCreating}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="dine-in">Consumir en el local</option>
                <option value="takeout">Para llevar</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" fullWidth isLoading={isCreating}>
                Crear pedido
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
