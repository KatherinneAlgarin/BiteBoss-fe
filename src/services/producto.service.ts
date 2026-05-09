// services/producto.service.ts
import { apiGet } from './api';
import type { Producto } from '../types/producto.types';

export async function getProductosBySucursal(sucursalId: number): Promise<Producto[]> {
  return apiGet<Producto[]>(`/api/productos?sucursal_id=${sucursalId}`);
}