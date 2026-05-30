import { apiGet, apiPost, apiPatch } from './api';
import type {
  InventarioStockItem,
  InventarioIngredienteItem,
  InventarioMovimientoItem,
  InventarioMovimientosFiltros,
  RegistrarStockIngredienteDto,
  AjusteStockDto,
  DescartarInventarioDto,
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

export async function getInventarioMovimientos(filtros: InventarioMovimientosFiltros): Promise<InventarioMovimientoItem[]> {
  const params = new URLSearchParams();

  if (filtros.id_sucursal) params.set('id_sucursal', String(filtros.id_sucursal));
  if (filtros.id_ingrediente) params.set('id_ingrediente', String(filtros.id_ingrediente));
  if (filtros.id_bodega) params.set('id_bodega', String(filtros.id_bodega));
  if (filtros.id_usuario) params.set('id_usuario', String(filtros.id_usuario));
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  if (filtros.limit) params.set('limit', String(filtros.limit));

  const query = params.toString();
  return apiGet<InventarioMovimientoItem[]>(`/api/inventario/movimientos${query ? `?${query}` : ''}`);
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

export async function descartarStockIngrediente(id_inventario: number, dto: DescartarInventarioDto): Promise<void> {
  await apiPatch<{ mensaje: string }>(`/api/inventario/${id_inventario}/descartar`, dto);
}
