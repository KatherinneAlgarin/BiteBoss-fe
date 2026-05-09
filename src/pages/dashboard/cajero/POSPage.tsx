// pages/dashboard/cajero/POSPage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../../../hooks/useProductos';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { ProductCatalog } from '../../../components/pos/ProductCatalog';
import { CartSummary, type CartItem } from '../../../components/pos/CartSummary';
import type { Producto } from '../../../types/producto.types';

const ROLE_HOME: Record<string, string> = {
  admin:   '/dashboard/admin',
  gerente: '/dashboard/gerente',
  mesero:  '/dashboard/mesero',
};

export function POSPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { productos, loading, error } = useProductos();

  const [cart, setCart] = useState<CartItem[]>([]);

  // Redirect admins and encargados (gerente) to their own panel
  useEffect(() => {
    if (role && ROLE_HOME[role]) {
      navigate(ROLE_HOME[role], { replace: true });
    }
  }, [role, navigate]);

  const addToCart = useCallback((producto: Producto) => {
    setCart(prev => {
      const existing = prev.find(i => i.id_producto === producto.id_producto);
      if (existing) {
        return prev.map(i =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [
        ...prev,
        { id_producto: producto.id_producto, nombre: producto.nombre, precio: producto.precio, cantidad: 1 },
      ];
    });
  }, []);

  const increase = useCallback((id: number) => {
    setCart(prev =>
      prev.map(i => i.id_producto === id ? { ...i, cantidad: i.cantidad + 1 } : i)
    );
  }, []);

  const decrease = useCallback((id: number) => {
    setCart(prev =>
      prev.map(i => i.id_producto === id && i.cantidad > 1 ? { ...i, cantidad: i.cantidad - 1 } : i)
    );
  }, []);

  const remove = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id_producto !== id));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Punto de Venta (POS)</h1>
        <p className="text-gray-500 mt-1 text-sm">Selecciona productos para armar el pedido</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left: product catalog */}
        <div className="flex-1 min-h-0 card overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <AlertMessage
              type="error"
              message="No se pudo cargar el catálogo de productos. Por favor, intenta de nuevo más tarde."
            />
          ) : (
            <ProductCatalog productos={productos} onAddToCart={addToCart} />
          )}
        </div>

        {/* Right: order summary */}
        <div className="w-full lg:w-80 card flex flex-col">
          <CartSummary
            items={cart}
            onIncrease={increase}
            onDecrease={decrease}
            onRemove={remove}
          />
        </div>
      </div>
    </div>
  );
}
