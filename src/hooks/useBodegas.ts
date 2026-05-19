import { useState, useEffect } from 'react';
import {
  listarBodegas,
  crearBodega,
  actualizarBodega,
  desactivarBodega,
  activarBodega,
  verificarStockBodega,
} from '../services/bodega.service';
import type {
  BodegaItem,
  CrearBodegaDto,
  ActualizarBodegaDto,
  StockBodegaResult,
} from '../types/bodega.types';

const isDev = import.meta.env.DEV;

export function useBodegas(id_sucursal?: number) {
  const [bodegas, setBodegas] = useState<BodegaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBodegas = async (sucursalId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarBodegas(sucursalId ?? id_sucursal);
      setBodegas(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useBodegas] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBodegas();
  }, [id_sucursal]);

  const createBodega = async (dto: CrearBodegaDto): Promise<BodegaItem> => {
    const nueva = await crearBodega(dto);
    await fetchBodegas();
    return nueva;
  };

  const updateBodega = async (id: number, dto: ActualizarBodegaDto): Promise<BodegaItem> => {
    const actualizada = await actualizarBodega(id, dto);
    await fetchBodegas();
    return actualizada;
  };

  const deactivateBodega = async (id: number): Promise<void> => {
    await desactivarBodega(id);
    await fetchBodegas();
  };

  const activateBodega = async (id: number): Promise<void> => {
    await activarBodega(id);
    await fetchBodegas();
  };

  const checkStock = async (id: number): Promise<StockBodegaResult> => {
    return verificarStockBodega(id);
  };

  return {
    bodegas,
    loading,
    error,
    refetch: fetchBodegas,
    createBodega,
    updateBodega,
    deactivateBodega,
    activateBodega,
    checkStock,
  };
}
