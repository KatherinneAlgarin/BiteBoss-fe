// services/pago.service.ts
import { apiGet, apiPost } from './api';
import type { MetodoPago, PagoCreate } from '../types/pago.types';

export async function getMetodosPago(sucursalId: number): Promise<MetodoPago[]> {
  return apiGet<MetodoPago[]>(`/api/pagos/metodos?sucursal_id=${sucursalId}`);
}

export async function registrarPago(pago: PagoCreate): Promise<void> {
  return apiPost<void>('/api/pagos', pago);
}