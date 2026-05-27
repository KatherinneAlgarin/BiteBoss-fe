import { apiGet } from './api';
import type { KpiVentasResponse, KpiSucursalResumen } from '../types/kpi.types';

export async function obtenerVentas(params: {
  fecha_inicio: string;
  fecha_fin: string;
  id_sucursal?: number;
}): Promise<KpiVentasResponse> {
  const qs = new URLSearchParams({
    fecha_inicio: params.fecha_inicio,
    fecha_fin: params.fecha_fin,
    ...(params.id_sucursal !== undefined && { id_sucursal: String(params.id_sucursal) }),
  });
  return apiGet<KpiVentasResponse>(`/api/kpis/ventas?${qs}`);
}

export async function obtenerComparativa(params: {
  fecha_inicio: string;
  fecha_fin: string;
}): Promise<KpiSucursalResumen[]> {
  const qs = new URLSearchParams({
    fecha_inicio: params.fecha_inicio,
    fecha_fin: params.fecha_fin,
  });
  return apiGet<KpiSucursalResumen[]>(`/api/kpis/comparativa?${qs}`);
}
