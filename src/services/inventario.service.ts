import { apiGet } from './api';
import type { InventarioStockItem } from '../types/inventario.types';

export async function getInventarioStockActual(): Promise<InventarioStockItem[]> {
  return apiGet<InventarioStockItem[]>('/api/inventario/stock-actual');
}
