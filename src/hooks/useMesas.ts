import { useState, useEffect, useCallback } from 'react';
import {
  listarMesasPorZona,
  crearMesa,
  actualizarMesa,
  desactivarMesa,
  activarMesa,
} from '../services/mesa.service';
import type {
  MesaItem,
  CrearMesaDto,
  ActualizarMesaDto,
} from '../types/mesa.types';

const isDev = import.meta.env.DEV;

export function useMesas(id_zona: number | null) {
  const [mesas, setMesas] = useState<MesaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMesas = useCallback(async () => {
    if (!id_zona) {
      setMesas([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await listarMesasPorZona(id_zona);
      setMesas(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useMesas] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [id_zona]);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const createMesa = async (dto: CrearMesaDto): Promise<MesaItem> => {
    const nueva = await crearMesa(dto);
    await fetchMesas();
    return nueva;
  };

  const updateMesa = async (id: number, dto: ActualizarMesaDto): Promise<MesaItem> => {
    const actualizada = await actualizarMesa(id, dto);
    await fetchMesas();
    return actualizada;
  };

  const deactivateMesa = async (id: number): Promise<void> => {
    await desactivarMesa(id);
    await fetchMesas();
  };

  const activateMesa = async (id: number): Promise<void> => {
    await activarMesa(id);
    await fetchMesas();
  };

  return {
    mesas,
    loading,
    error,
    refetch: fetchMesas,
    createMesa,
    updateMesa,
    deactivateMesa,
    activateMesa,
  };
}
