import { apiGet, apiPost, apiPatch } from './api';
import type {
  InventarioStockItem,
  InventarioIngredienteItem,
  RegistrarStockIngredienteDto,
  AjusteStockDto,
  ActualizarLimitesDto,
  TransferirStockDto,
} from '../types/inventario.types';

export async function getInventarioStockActual(id_sucursal?: number): Promise<InventarioStockItem[]> {
  const query = id_sucursal ? `?id_sucursal=${id_sucursal}` : '';
  return apiGet<InventarioStockItem[]>(`/api/inventario/stock-actual${query}`);
}

export async function getInventarioStockIngredientes(id_sucursal?: number): Promise<InventarioIngredienteItem[]> {
  const query = id_sucursal ? `?id_sucursal=${id_sucursal}` : '';
  return apiGet<InventarioIngredienteItem[]>(`/api/inventario/stock-ingredientes${query}`);
}

export async function registrarStockIngrediente(dto: RegistrarStockIngredienteDto): Promise<void> {
  await apiPost<{ mensaje: string }>('/api/inventario/stock-ingrediente', dto);
}

export async function ajustarStock(id_inventario: number, dto: AjusteStockDto): Promise<void> {
  await apiPatch<{ mensaje: string }>(`/api/inventario/${id_inventario}/ajuste`, dto);
}

export async function actualizarLimites(id_inventario: number, dto: ActualizarLimitesDto): Promise<void> {
  await apiPatch<{ mensaje: string }>(`/api/inventario/${id_inventario}/limites`, dto);
}

export async function transferirStock(id_inventario: number, dto: TransferirStockDto): Promise<void> {
  await apiPost<{ mensaje: string }>(`/api/inventario/${id_inventario}/transferir`, dto);
}
