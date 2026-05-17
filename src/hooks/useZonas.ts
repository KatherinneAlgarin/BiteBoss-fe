import { useState, useEffect, useCallback } from 'react';
import {
  listarZonasPorSucursal,
  crearZona,
  actualizarZona,
  desactivarZona,
  activarZona,
} from '../services/zona.service';
import type {
  ZonaItem,
  CrearZonaDto,
  ActualizarZonaDto,
} from '../types/zona.types';

const isDev = import.meta.env.DEV;

export function useZonas(id_sucursal: number | null) {
  const [zonas, setZonas] = useState<ZonaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZonas = useCallback(async () => {
    if (!id_sucursal) {
      setZonas([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await listarZonasPorSucursal(id_sucursal);
      setZonas(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useZonas] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id_sucursal]);

  useEffect(() => {
    fetchZonas();
  }, [fetchZonas]);

  const createZona = async (dto: CrearZonaDto): Promise<ZonaItem> => {
    const nueva = await crearZona(dto);
    await fetchZonas();
    return nueva;
  };

  const updateZona = async (id: number, dto: ActualizarZonaDto): Promise<ZonaItem> => {
    const actualizada = await actualizarZona(id, dto);
    await fetchZonas();
    return actualizada;
  };

  const deactivateZona = async (id: number): Promise<void> => {
    await desactivarZona(id);
    await fetchZonas();
  };

  const activateZona = async (id: number): Promise<void> => {
    await activarZona(id);
    await fetchZonas();
  };

  return {
    zonas,
    loading,
    error,
    refetch: fetchZonas,
    createZona,
    updateZona,
    deactivateZona,
    activateZona,
  };
}
