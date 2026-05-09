// hooks/useProductos.ts
import { useState, useEffect } from 'react';
import type { Producto } from '../types/producto.types';
import { getProductosBySucursal } from '../services/producto.service';

export function useProductos(sucursalId: number) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductosBySucursal(sucursalId);
        setProductos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    if (sucursalId) fetchProductos();
  }, [sucursalId]);

  return { productos, loading, error };
}