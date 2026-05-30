// services/pago.service.ts
import { apiGet, apiPost } from './api';
import type { MetodoPago, PagoCreate } from '../types/pago.types';

export async function getMetodosPago(sucursalId: number): Promise<MetodoPago[]> {
  const data = await apiGet<Array<MetodoPago & { activo?: boolean }>>(`/api/pagos/metodos?sucursal_id=${sucursalId}`);
  return data.map(metodo => ({
    metodo: metodo.metodo,
    descripcion: metodo.descripcion || metodo.metodo,
    disponible: metodo.disponible ?? metodo.activo ?? false,
  }));
}

export async function registrarPago(pago: PagoCreate): Promise<void> {
  return apiPost<void>('/api/pagos', pago);
}