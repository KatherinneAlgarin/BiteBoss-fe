// hooks/usePagos.ts
import { useState, useEffect } from 'react';
import type { MetodoPago } from '../types/pago.types';
import { getMetodosPago, registrarPago } from '../services/pago.service';

export function useMetodosPago(sucursalId: number) {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetodos = async () => {
      try {
        const data = await getMetodosPago(sucursalId);
        setMetodos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    if (sucursalId) fetchMetodos();
  }, [sucursalId]);

  return { metodos, loading, error };
}

export function useRegistrarPago() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registrar = async (pago: any) => {
    setLoading(true);
    try {
      await registrarPago(pago);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return { registrar, loading, error };
}