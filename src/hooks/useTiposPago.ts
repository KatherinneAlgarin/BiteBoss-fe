import { useState, useEffect } from 'react';
import {
  listarTiposPago,
  crearTipoPago,
  actualizarTipoPago,
  desactivarTipoPago,
  activarTipoPago,
  obtenerDependenciasDesactivacionTipoPago,
} from '../services/tipo-pago.service';
import type {
  TipoPagoItem,
  CrearTipoPagoDto,
  ActualizarTipoPagoDto,
  DependenciasDesactivacionTipoPago,
} from '../types/tipo-pago.types';

export function useTiposPago() {
  const [tipos, setTipos] = useState<TipoPagoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarTiposPago();
      setTipos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const createTipoPago = async (dto: CrearTipoPagoDto): Promise<TipoPagoItem> => {
    const nuevo = await crearTipoPago(dto);
    await fetchTipos();
    return nuevo;
  };

  const updateTipoPago = async (id: number, dto: ActualizarTipoPagoDto): Promise<TipoPagoItem> => {
    const actualizado = await actualizarTipoPago(id, dto);
    await fetchTipos();
    return actualizado;
  };

  const deactivateTipoPago = async (id: number): Promise<void> => {
    await desactivarTipoPago(id);
    await fetchTipos();
  };

  const activateTipoPago = async (id: number): Promise<void> => {
    await activarTipoPago(id);
    await fetchTipos();
  };

  const fetchDependenciasDesactivacion = async (id: number): Promise<DependenciasDesactivacionTipoPago> => {
    return obtenerDependenciasDesactivacionTipoPago(id);
  };

  return {
    tipos,
    loading,
    error,
    refetch: fetchTipos,
    createTipoPago,
    updateTipoPago,
    deactivateTipoPago,
    activateTipoPago,
    fetchDependenciasDesactivacion,
  };
}
