import { useState, useEffect } from 'react';
import {
  listarTiposOrden,
  crearTipoOrden,
  actualizarTipoOrden,
  desactivarTipoOrden,
  activarTipoOrden,
} from '../services/tipo-orden.service';
import type {
  TipoOrdenItem,
  CrearTipoOrdenDto,
  ActualizarTipoOrdenDto,
} from '../types/tipo-orden.types';

const isDev = import.meta.env.DEV;

export function useTiposOrden() {
  const [tipos, setTipos] = useState<TipoOrdenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarTiposOrden();
      setTipos(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useTiposOrden] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const createTipoOrden = async (dto: CrearTipoOrdenDto): Promise<TipoOrdenItem> => {
    const nuevo = await crearTipoOrden(dto);
    await fetchTipos();
    return nuevo;
  };

  const updateTipoOrden = async (id: number, dto: ActualizarTipoOrdenDto): Promise<TipoOrdenItem> => {
    const actualizado = await actualizarTipoOrden(id, dto);
    await fetchTipos();
    return actualizado;
  };

  const deactivateTipoOrden = async (id: number): Promise<void> => {
    await desactivarTipoOrden(id);
    await fetchTipos();
  };

  const activateTipoOrden = async (id: number): Promise<void> => {
    await activarTipoOrden(id);
    await fetchTipos();
  };

  return {
    tipos,
    loading,
    error,
    refetch: fetchTipos,
    createTipoOrden,
    updateTipoOrden,
    deactivateTipoOrden,
    activateTipoOrden,
  };
}
