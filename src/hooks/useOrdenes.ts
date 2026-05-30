// hooks/useOrdenes.ts
import { useState, useEffect } from 'react';
import type { Orden, OrdenResumen } from '../types/orden.types';
import { getOrdenesPendientes, getOrdenById, updateOrden, addProductoToOrden, updateDetalleOrden, removeDetalleOrden } from '../services/orden.service';

export function useOrdenesPendientes() {
  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const data = await getOrdenesPendientes();
        setOrdenes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchOrdenes();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await getOrdenesPendientes();
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { ordenes, loading, error, refetch };
}

export function useOrden(id: number) {
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        const data = await getOrdenById(id);
        setOrden(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrden();
  }, [id]);

  const update = async (updates: any) => {
    if (!orden) return;
    try {
      const updated = await updateOrden(orden.id_pedido, updates);
      setOrden(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const addProducto = async (detalle: any) => {
    if (!orden) return;
    try {
      const updated = await addProductoToOrden(orden.id_pedido, detalle);
      setOrden(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const updateDetalle = async (idDetalle: number, updates: any) => {
    if (!orden) return;
    try {
      const updated = await updateDetalleOrden(orden.id_pedido, idDetalle, updates);
      setOrden(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const removeDetalle = async (idDetalle: number) => {
    if (!orden) return;
    try {
      const updated = await removeDetalleOrden(orden.id_pedido, idDetalle);
      setOrden(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return { orden, loading, error, update, addProducto, updateDetalle, removeDetalle };
}