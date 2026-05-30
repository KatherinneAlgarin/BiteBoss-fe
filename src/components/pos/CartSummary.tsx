// components/pos/CartSummary.tsx
export interface CartItem {
  id_producto: number;
  nombre:      string;
  precio:      number;
  cantidad:    number;
}

interface CartSummaryProps {
  items:          CartItem[];
  onIncrease:     (id: number) => void;
  onDecrease:     (id: number) => void;
  onRemove:       (id: number) => void;
}

export function CartSummary({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: CartSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>

      <div className="h-[44vh] mb-4">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-400 text-sm text-center">
              Haz clic en un producto para agregarlo al pedido.
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto space-y-2 pr-1">
            {items.map(item => (
              <div
                key={item.id_producto}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-500">
                    ${item.precio.toFixed(2)} × {item.cantidad} ={' '}
                    <span className="font-semibold text-orange-600">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onDecrease(item.id_producto)}
                    disabled={item.cantidad <= 1}
                    aria-label="Disminuir cantidad"
                    className="w-6 h-6 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold leading-none"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold" aria-live="polite">{item.cantidad}</span>
                  <button
                    onClick={() => onIncrease(item.id_producto)}
                    aria-label="Aumentar cantidad"
                    className="w-6 h-6 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-bold leading-none"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onRemove(item.id_producto)}
                    className="w-6 h-6 rounded bg-red-100 text-red-500 hover:bg-red-200 text-sm font-bold leading-none ml-1"
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center text-base font-bold text-gray-900">
          <span>Total</span>
          <span className="text-orange-600">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
