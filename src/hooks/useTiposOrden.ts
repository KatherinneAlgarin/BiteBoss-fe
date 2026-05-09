import { useState, useEffect } from 'react';
import {
  listarTiposOrden,
  crearTipoOrden,
  actualizarTipoOrden,
  eliminarTipoOrden,
  obtenerDependenciasTipoOrden,
} from '../services/tipo-orden.service';
import type {
  TipoOrdenItem,
  CrearTipoOrdenDto,
  ActualizarTipoOrdenDto,
  DependenciasTipoOrden,
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
      if (isDev) console.log('[useTiposOrden] Cargando tipos de orden...');
      const data = await listarTiposOrden();
      setTipos(data);
      if (isDev) console.log('[useTiposOrden] Datos cargados:', data);
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

  const deleteTipoOrden = async (id: number): Promise<void> => {
    await eliminarTipoOrden(id);
    setTipos(prev => prev.filter(t => t.id_tipo_orden !== id));
  };

  const fetchDependencias = async (id: number): Promise<DependenciasTipoOrden> => {
    return obtenerDependenciasTipoOrden(id);
  };

  return {
    tipos,
    loading,
    error,
    refetch: fetchTipos,
    createTipoOrden,
    updateTipoOrden,
    deleteTipoOrden,
    fetchDependencias,
  };
}
