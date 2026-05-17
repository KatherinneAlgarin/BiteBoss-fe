import { apiGet } from './api';
import type { InventarioStockItem } from '../types/inventario.types';

export async function getInventarioStockActual(id_sucursal?: number): Promise<InventarioStockItem[]> {
  const query = id_sucursal ? `?id_sucursal=${id_sucursal}` : '';
  return apiGet<InventarioStockItem[]>(`/api/inventario/stock-actual${query}`);
}
