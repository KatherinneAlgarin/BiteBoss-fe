// services/producto.service.ts
import { apiGet } from './api';
import type { Producto } from '../types/producto.types';

export async function getProductosCatalogo(): Promise<Producto[]> {
  return apiGet<Producto[]>('/api/productos');
}

/** @deprecated use getProductosCatalogo – sucursal is resolved from the JWT on the server */
export async function getProductosBySucursal(_sucursalId: number): Promise<Producto[]> {
  return getProductosCatalogo();
}