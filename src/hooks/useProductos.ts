// hooks/useProductos.ts
import { useState, useEffect } from 'react';
import type { Producto } from '../types/producto.types';
import { getProductosCatalogo } from '../services/producto.service';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductosCatalogo();
        setProductos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el catálogo');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  return { productos, loading, error };
}