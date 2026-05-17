import { useState, useEffect } from 'react';
import {
  listarSucursales,
  obtenerSucursal,
  crearSucursal,
  actualizarSucursal,
  desactivarSucursal,
  activarSucursal,
  obtenerDependenciasSucursal,
} from '../services/sucursal.service';
import type {
  SucursalItem,
  SucursalDetalle,
  CrearSucursalDto,
  ActualizarSucursalDto,
  DependenciasSucursal,
} from '../types/sucursal.types';

const isDev = import.meta.env.DEV;

export function useSucursales() {
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSucursales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarSucursales();
      setSucursales(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useSucursales] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const fetchDetalle = async (id: number): Promise<SucursalDetalle> => {
    return obtenerSucursal(id);
  };

  const createSucursal = async (dto: CrearSucursalDto): Promise<SucursalDetalle> => {
    const nueva = await crearSucursal(dto);
    await fetchSucursales();
    return nueva;
  };

  const updateSucursal = async (id: number, dto: ActualizarSucursalDto): Promise<SucursalDetalle> => {
    const actualizada = await actualizarSucursal(id, dto);
    await fetchSucursales();
    return actualizada;
  };

  const deactivateSucursal = async (id: number): Promise<void> => {
    await desactivarSucursal(id);
    await fetchSucursales();
  };

  const activateSucursal = async (id: number): Promise<void> => {
    await activarSucursal(id);
    await fetchSucursales();
  };

  const fetchDependencias = async (id: number): Promise<DependenciasSucursal> => {
    return obtenerDependenciasSucursal(id);
  };

  return {
    sucursales,
    loading,
    error,
    refetch: fetchSucursales,
    fetchDetalle,
    createSucursal,
    updateSucursal,
    deactivateSucursal,
    activateSucursal,
    fetchDependencias,
  };
}
