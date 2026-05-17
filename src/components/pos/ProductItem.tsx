// components/pos/ProductItem.tsx
import type { Detalle } from '../../types/orden.types';
import { Button } from '../ui/Button';

interface ProductItemProps {
  detalle: Detalle;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function ProductItem({ detalle, onIncrease, onDecrease, onRemove }: ProductItemProps) {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg">
      <div>
        <p className="font-medium">{detalle.nombre_producto ?? 'Producto'}</p>
        <p className="text-sm text-gray-500">
          ${detalle.precio_unitario.toFixed(2)} x {detalle.cantidad} = ${detalle.subtotal.toFixed(2)}
        </p>
        {detalle.nota && <p className="text-sm text-gray-400">Notas: {detalle.nota}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onDecrease} disabled={detalle.cantidad <= 1}>-</Button>
        <span className="px-2">{detalle.cantidad}</span>
        <Button variant="secondary" onClick={onIncrease}>+</Button>
        <Button variant="secondary" onClick={onRemove}>X</Button>
      </div>
    </div>
  );
}