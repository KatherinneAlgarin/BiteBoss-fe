// pages/dashboard/cajero/POSPage.tsx
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useProductos } from '../../../hooks/useProductos';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { ProductCatalog } from '../../../components/pos/ProductCatalog';
import { CartSummary, type CartItem } from '../../../components/pos/CartSummary';
import { Button } from '../../../components/ui/Button';
import { listarSucursales } from '../../../services/sucursal.service';
import { CreateOrderModal, type CheckoutMode } from '../../../components/pos/CreateOrderModal';
import { CajaCierreModal } from '../../../components/pos/CajaCierreModal';
import { obtenerSesionCajaActiva } from '../../../services/caja-cierre.service';
import { printTicket, type TicketPrintPayload } from '../../../lib/ticket-print';
import type { Producto } from '../../../types/producto.types';
import type { SucursalItem } from '../../../types/sucursal.types';

export function POSPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id_sucursal: idSucursalUsuario, role } = useAuth();
  const isAdmin = role === 'admin';

  const idSucursalFromQuery = useMemo(() => {
    const raw = searchParams.get('id_sucursal');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(idSucursalFromQuery ?? idSucursalUsuario);

  const sucursalEfectiva = isAdmin
    ? selectedSucursal
    : idSucursalUsuario;

  const { productos, loading, error } = useProductos(sucursalEfectiva ?? undefined);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('crear-orden');
  const [cierreCajaOpen, setCierreCajaOpen] = useState(false);
  const [validandoAccesoCaja, setValidandoAccesoCaja] = useState(true);
  const [cajaBloqueada, setCajaBloqueada] = useState(false);
  const [mensajeBloqueoCaja, setMensajeBloqueoCaja] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setSelectedSucursal(idSucursalUsuario);
      return;
    }

    let mounted = true;
    const loadSucursales = async () => {
      try {
        const data = await listarSucursales(true);
        if (!mounted) return;
        setSucursales(data);
        setSelectedSucursal(prev => prev ?? idSucursalFromQuery ?? data[0]?.id_sucursal ?? null);
      } catch {
        // Best effort: si falla, se mantiene la sucursal por id.
      }
    };

    void loadSucursales();
    return () => {
      mounted = false;
    };
  }, [idSucursalUsuario, idSucursalFromQuery, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (idSucursalFromQuery) {
      setSelectedSucursal(idSucursalFromQuery);
    }
  }, [idSucursalFromQuery, isAdmin]);

  const verificarAccesoCaja = useCallback(async () => {
    try {
      const sesion = await obtenerSesionCajaActiva();
      const bloqueada = sesion.sesion?.estado === 'PENDIENTE';
      setCajaBloqueada(bloqueada);
      setMensajeBloqueoCaja(bloqueada
        ? 'Hay una revisión pendiente de tu cierre de caja. No puedes abrir la caja hasta que sea autorizada o denegada.'
        : null
      );
    } catch {
      setCajaBloqueada(false);
      setMensajeBloqueoCaja(null);
    } finally {
      setValidandoAccesoCaja(false);
    }
  }, []);

  useEffect(() => {
    void verificarAccesoCaja();
    const interval = window.setInterval(() => void verificarAccesoCaja(), 15000);
    return () => window.clearInterval(interval);
  }, [verificarAccesoCaja]);

  useEffect(() => {
    setCart([]);
  }, [sucursalEfectiva]);

  useEffect(() => {
    if (location.pathname.endsWith('/cierre-caja')) {
      setCierreCajaOpen(true);
    }
  }, [location.pathname]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [cart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

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

  const handleCheckoutSuccess = useCallback((message: string, ticketData?: TicketPrintPayload) => {
    if (checkoutMode === 'crear-orden') {
      clearCart();
    }
    setCheckoutOpen(false);
    setSuccessMessage(message);

    if (ticketData) {
      try {
        printTicket(ticketData);
      } catch {
        // Si falla la descarga automática, no bloquea el flujo de cobro.
      }
    }

    window.setTimeout(() => setSuccessMessage(null), 4000);
  }, [clearCart, checkoutMode]);

  const nombreSucursalActiva = useMemo(() => {
    if (!sucursalEfectiva) return 'Sin sucursal';
    const found = sucursales.find(item => item.id_sucursal === sucursalEfectiva);
    return found?.nombre ?? `Sucursal ${sucursalEfectiva}`;
  }, [sucursalEfectiva, sucursales]);

  const volverAlPanel = useCallback(() => {
    navigate(isAdmin ? '/dashboard/admin/caja' : '/dashboard/cajero');
  }, [isAdmin, navigate]);

  const cerrarPestanaPos = useCallback(() => {
    // If the POS was opened as a separate window from Caja Hub, this will close it.
    window.close();

    // Fallback for browsers that block close() on non-script-opened tabs.
    window.setTimeout(() => {
      if (!window.closed) {
        volverAlPanel();
      }
    }, 200);
  }, [volverAlPanel]);

  if (validandoAccesoCaja) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,247,237,0.96)_42%,rgba(255,237,213,0.9))] px-4 text-gray-900">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <LoadingSpinner />
          <p className="mt-4 text-sm text-gray-600">Validando acceso a caja...</p>
        </div>
      </div>
    );
  }

  if (cajaBloqueada) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,247,237,0.96)_42%,rgba(255,237,213,0.9))] px-4 text-gray-900">
        <div className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(249,115,22,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Caja bloqueada</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Cierre pendiente</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {mensajeBloqueoCaja ?? 'Tu cierre de caja está pendiente de resolución.'}
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Cuando el cierre sea autorizado o denegado podrás volver a ingresar a la caja.
          </p>
          <div className="mt-6 flex justify-center">
            <Button type="button" variant="secondary" onClick={volverAlPanel}>
              Volver al panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(255,247,237,0.96)_42%,rgba(255,237,213,0.9))] text-gray-900">
      <div className="mx-auto max-w-400 px-4 py-4 lg:px-6 lg:py-6">
        <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_60px_rgba(249,115,22,0.12)] backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Caja / POS</p>
              <h1 className="text-3xl font-black text-gray-950">Terminal de ventas</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-700">{nombreSucursalActiva}</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">{cart.length} ítems</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">${total.toFixed(2)}</span>
            </div>
          </div>

          {successMessage && (
            <AlertMessage type="success" message={successMessage} />
          )}
        </div>

        {checkoutOpen && (
          <CreateOrderModal
            isOpen={checkoutOpen}
            mode={checkoutMode}
            idSucursal={sucursalEfectiva ?? null}
            items={cart}
            total={total}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        {cierreCajaOpen && (
          <CajaCierreModal
            isOpen={cierreCajaOpen}
            onClose={() => setCierreCajaOpen(false)}
            onSuccess={(message) => {
              setCierreCajaOpen(false);
              setSuccessMessage(message);
              setCajaBloqueada(true);
              setMensajeBloqueoCaja(message);
              window.setTimeout(() => setSuccessMessage(null), 4000);
              cerrarPestanaPos();
            }}
          />
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px] min-h-[calc(100vh-170px)]">
          <div className="min-h-0 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur flex flex-col">
            <div className="border-b border-orange-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Menú rápido</h2>
            </div>
            <div className="flex-1 min-h-0 p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
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
          </div>

          <div className="min-h-0 rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-[0_20px_60px_rgba(249,115,22,0.12)] backdrop-blur flex flex-col">
            <CartSummary
              items={cart}
              onIncrease={increase}
              onDecrease={decrease}
              onRemove={remove}
            />

            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              <Button
                type="button"
                fullWidth
                onClick={() => {
                  setCheckoutMode('crear-orden');
                  setCheckoutOpen(true);
                }}
                disabled={cart.length === 0 || !sucursalEfectiva}
              >
                Enviar pedido
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => {
                  setCheckoutMode('cerrar-cuenta');
                  setCheckoutOpen(true);
                }}
                disabled={!sucursalEfectiva}
              >
                Cerrar cuenta de mesa
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Limpiar carrito
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setCierreCajaOpen(true)}
                disabled={!sucursalEfectiva}
              >
                Solicitar cierre de caja
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
