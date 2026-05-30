import { useState, useCallback } from 'react';
import { obtenerVentas, obtenerComparativa } from '../services/kpi.service';
import type { KpiVentasResponse, KpiSucursalResumen, DateRange } from '../types/kpi.types';

function toLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMesActual(): DateRange {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    inicio: toLocalISO(inicio),
    fin: toLocalISO(fin),
  };
}

export function useKPIs() {
  const [ventasData, setVentasData] = useState<KpiVentasResponse | null>(null);
  const [comparativaData, setComparativaData] = useState<KpiSucursalResumen[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [loadingComparativa, setLoadingComparativa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getMesActual);
  const [sucursalFiltro, setSucursalFiltro] = useState<number | null>(null); // null = global

  const fetchVentas = useCallback(async (range: DateRange, id_sucursal?: number) => {
    try {
      setLoadingVentas(true);
      setError(null);
      const data = await obtenerVentas({
        fecha_inicio: range.inicio,
        fecha_fin: range.fin,
        id_sucursal,
      });
      setVentasData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas');
    } finally {
      setLoadingVentas(false);
    }
  }, []);

  const fetchComparativa = useCallback(async (range: DateRange) => {
    try {
      setLoadingComparativa(true);
      setError(null);
      const data = await obtenerComparativa({ fecha_inicio: range.inicio, fecha_fin: range.fin });
      setComparativaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comparativa');
    } finally {
      setLoadingComparativa(false);
    }
  }, []);

  return {
    ventasData,
    comparativaData,
    loadingVentas,
    loadingComparativa,
    error,
    dateRange,
    setDateRange,
    sucursalFiltro,
    setSucursalFiltro,
    fetchVentas,
    fetchComparativa,
  };
}
