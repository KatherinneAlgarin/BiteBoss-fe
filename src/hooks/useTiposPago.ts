import { useState, useEffect } from 'react';
import { listarTiposPago } from '../services/tipo-pago.service';
import type { TipoPagoItem } from '../types/tipo-pago.types';

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

  return { tipos, loading, error, refetch: fetchTipos };
}
