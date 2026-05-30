import { useEffect, useMemo, useState } from 'react';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { Button } from '../../../components/ui/Button';
import { ProductCatalog } from '../../../components/pos/ProductCatalog';
import { CartSummary, type CartItem } from '../../../components/pos/CartSummary';
import { useAuth } from '../../../hooks/useAuth';
import { useProductos } from '../../../hooks/useProductos';
import { listarZonasPorSucursal } from '../../../services/zona.service';
import { listarMesasPorZona } from '../../../services/mesa.service';
import { listarCajerosConCajaAbierta } from '../../../services/caja-cierre.service';
import { listarTiposOrden } from '../../../services/tipo-orden.service';
import { obtenerSucursal } from '../../../services/sucursal.service';
import { createOrden } from '../../../services/orden.service';
import type { MesaItem } from '../../../types/mesa.types';
import type { ZonaItem } from '../../../types/zona.types';
import type { CajeroSesionActivaItem } from '../../../types/caja-cierre.types';
import type { TipoOrdenItem } from '../../../types/tipo-orden.types';
import type { Producto } from '../../../types/producto.types';

export function TomarOrdenMeseroPage() {
  const { id_sucursal } = useAuth();
  const { productos, loading: loadingProductos, error: productosError } = useProductos(id_sucursal ?? undefined);

  const [zonas, setZonas] = useState<ZonaItem[]>([]);
  const [mesas, setMesas] = useState<MesaItem[]>([]);
  const [cajerosActivos, setCajerosActivos] = useState<CajeroSesionActivaItem[]>([]);
  const [tipoOrdenMesa, setTipoOrdenMesa] = useState<TipoOrdenItem | null>(null);

  const [idZona, setIdZona] = useState<number | null>(null);
  const [idMesa, setIdMesa] = useState<number | null>(null);
  const [idCajeroAsignado, setIdCajeroAsignado] = useState<number | null>(null);
  const [nombreCliente, setNombreCliente] = useState('Cliente');
  const [apellidoCliente, setApellidoCliente] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadInit = async () => {
      if (!id_sucursal) return;

      setLoadingInit(true);
      setError(null);

      try {
        const [zonasData, cajerosData, tiposOrden, sucursal] = await Promise.all([
          listarZonasPorSucursal(id_sucursal),
          listarCajerosConCajaAbierta(),
          listarTiposOrden(),
          obtenerSucursal(id_sucursal),
        ]);

        const tiposSucursal = new Set(sucursal.tipos_orden.map(t => t.id_tipo_orden));
        const tipoMesaDisponible = tiposOrden.find(
          tipo => tipo.activo && tipo.requiere_mesa && tiposSucursal.has(tipo.id_tipo_orden)
        );

        if (!tipoMesaDisponible) {
          throw new Error('No hay un tipo de orden de mesa activo para esta sucursal.');
        }

        setTipoOrdenMesa(tipoMesaDisponible);
        setZonas(zonasData.filter(z => z.activo));
        setCajerosActivos(cajerosData);

        if (cajerosData.length > 0) {
          setIdCajeroAsignado(cajerosData[0].id_usuario_cajero);
        }

        if (zonasData.length > 0) {
          const primeraZona = zonasData[0];
          setIdZona(primeraZona.id_zona);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración inicial.');
      } finally {
        setLoadingInit(false);
      }
    };

    void loadInit();
  }, [id_sucursal]);

  useEffect(() => {
    const loadMesas = async () => {
      if (!idZona) {
        setMesas([]);
        setIdMesa(null);
        return;
      }

      try {
        const mesasData = await listarMesasPorZona(idZona);
        const mesasActivas = mesasData.filter(m => m.activo);
        setMesas(mesasActivas);
        setIdMesa(mesasActivas.length > 0 ? mesasActivas[0].id_mesa : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las mesas.');
      }
    };

    void loadMesas();
  }, [idZona]);

  const onAddToCart = (producto: Producto) => {
    setCartItems(prev => {
      const index = prev.findIndex(item => item.id_producto === producto.id_producto);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], cantidad: updated[index].cantidad + 1 };
        return updated;
      }
      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
        },
      ];
    });
  };

  const increaseItem = (id: number) => {
    setCartItems(prev => prev.map(item => (item.id_producto === id ? { ...item, cantidad: item.cantidad + 1 } : item)));
  };

  const decreaseItem = (id: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id_producto === id ? { ...item, cantidad: Math.max(1, item.cantidad - 1) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id_producto !== id));
  };

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0), [cartItems]);

  const handleSubmit = async () => {
    if (!id_sucursal) {
      setError('No se detectó la sucursal del usuario.');
      return;
    }

    if (!tipoOrdenMesa) {
      setError('No hay un tipo de orden de mesa configurado.');
      return;
    }

    if (!idMesa) {
      setError('Debes seleccionar una mesa.');
      return;
    }

    if (!idCajeroAsignado) {
      setError('Debes asignar la orden a un cajero con caja abierta.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Agrega al menos un producto al pedido.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const orden = await createOrden({
        id_sucursal,
        tipo_orden: tipoOrdenMesa.nombre,
        id_mesa: idMesa,
        id_usuario_asignado: idCajeroAsignado,
        nombre_cliente: nombreCliente.trim() || 'Cliente',
        apellido_cliente: apellidoCliente.trim() || undefined,
        detalles: cartItems.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
        })),
      });

      setCartItems([]);
      setNombreCliente('Cliente');
      setApellidoCliente('');
      setSuccess(`Orden ${orden.numero_orden} creada y asignada correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la orden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInit) {
    return <div className="card">Cargando configuración de mesero...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">Tomar orden</h1>
        <p className="text-sm text-gray-500 mt-1">
          Crea pedidos sin pago y asígnalos a un cajero que tenga caja abierta.
        </p>
      </div>

      {(error || productosError) && (
        <AlertMessage
          type="error"
          message={error ?? productosError ?? 'Ocurrió un error inesperado.'}
        />
      )}

      {success && <AlertMessage type="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card space-y-3 lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900">Datos de la orden</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={idZona ?? ''}
              onChange={e => setIdZona(Number(e.target.value))}
            >
              {zonas.map(zona => (
                <option key={zona.id_zona} value={zona.id_zona}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={idMesa ?? ''}
              onChange={e => setIdMesa(Number(e.target.value))}
            >
              {mesas.map(mesa => (
                <option key={mesa.id_mesa} value={mesa.id_mesa}>
                  Mesa {mesa.numero} · Capacidad {mesa.capacidad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a cajero</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={idCajeroAsignado ?? ''}
              onChange={e => setIdCajeroAsignado(Number(e.target.value))}
            >
              {cajerosActivos.map(cajero => (
                <option key={cajero.id_usuario_cajero} value={cajero.id_usuario_cajero}>
                  {cajero.cajero_nombre}
                </option>
              ))}
            </select>
            {cajerosActivos.length === 0 && (
              <p className="text-xs text-red-600 mt-1">No hay cajeros con caja abierta en esta sucursal.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre cliente</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={nombreCliente}
              onChange={e => setNombreCliente(e.target.value)}
              maxLength={80}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido cliente</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={apellidoCliente}
              onChange={e => setApellidoCliente(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total estimado</p>
            <p className="text-xl font-bold text-orange-600">${total.toFixed(2)}</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || cartItems.length === 0 || cajerosActivos.length === 0 || !idMesa}
            className="w-full"
          >
            {isSubmitting ? 'Guardando orden...' : 'Guardar orden sin pago'}
          </Button>
        </div>

        <div className="card lg:col-span-1 min-h-[500px]">
          {loadingProductos ? (
            <p className="text-gray-500">Cargando catálogo...</p>
          ) : (
            <ProductCatalog productos={productos} onAddToCart={onAddToCart} />
          )}
        </div>

        <div className="card lg:col-span-1 min-h-[500px]">
          <CartSummary
            items={cartItems}
            onIncrease={increaseItem}
            onDecrease={decreaseItem}
            onRemove={removeItem}
          />
        </div>
      </div>
    </div>
  );
}
