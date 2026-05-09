// pages/dashboard/cajero/POSPage.tsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../../../hooks/useProductos';
import { useAuth } from '../../../hooks/useAuth';
import { createOrden } from '../../../services/orden.service';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { ProductCatalog } from '../../../components/pos/ProductCatalog';
import { CartSummary, type CartItem } from '../../../components/pos/CartSummary';
import { CreateOrderModal, type TipoOrden } from '../../../components/pos/CreateOrderModal';
import type { Producto } from '../../../types/producto.types';

const ROLE_HOME: Record<string, string> = {
  admin:   '/dashboard/admin',
  gerente: '/dashboard/gerente',
  mesero:  '/dashboard/mesero',
};

export function POSPage() {
  const navigate   = useNavigate();
  const { role, id_sucursal } = useAuth();
  const { productos, loading, error } = useProductos();

  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [showModal, setShowModal]         = useState(false);
  const [creating, setCreating]           = useState(false);
  const [createError, setCreateError]     = useState<string | null>(null);
  const [successMsg, setSuccessMsg]       = useState<string | null>(null);

  // Redirect admins and encargados (gerente) to their own panel
  if (role && ROLE_HOME[role]) {
    navigate(ROLE_HOME[role], { replace: true });
    return null;
  }

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

  const total = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  const handleConfirmar = () => {
    setCreateError(null);
    setShowModal(true);
  };

  const handleCreateOrder = async (formData: { nombre_cliente: string; apellido_cliente: string; tipo_orden: TipoOrden }) => {
    if (!id_sucursal) {
      setCreateError('No se pudo determinar la sucursal. Por favor, vuelva a iniciar sesión.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      await createOrden({
        id_sucursal,
        tipo_orden: formData.tipo_orden,
        nombre_cliente:   formData.nombre_cliente,
        apellido_cliente: formData.apellido_cliente,
        detalles: cart.map(i => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
      });

      setCart([]);
      setShowModal(false);
      setSuccessMsg('Pedido creado exitosamente.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el pedido');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Punto de Venta (POS)</h1>
        <p className="text-gray-500 mt-1 text-sm">Selecciona productos para armar el pedido</p>
      </div>

      {successMsg && (
        <div className="mb-4">
          <AlertMessage type="success" message={successMsg} />
        </div>
      )}

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
            onConfirmar={handleConfirmar}
            isCreating={creating}
          />
        </div>
      </div>

      <CreateOrderModal
        isOpen={showModal}
        items={cart}
        total={total}
        isCreating={creating}
        error={createError}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}
