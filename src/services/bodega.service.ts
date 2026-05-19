import { apiGet, apiPost, apiPatch } from './api';
import type {
  BodegaItem,
  CrearBodegaDto,
  ActualizarBodegaDto,
  StockBodegaResult,
} from '../types/bodega.types';

export async function listarBodegas(id_sucursal?: number): Promise<BodegaItem[]> {
  const query = id_sucursal ? `?id_sucursal=${id_sucursal}` : '';
  return apiGet<BodegaItem[]>(`/api/bodegas${query}`);
}

export async function crearBodega(dto: CrearBodegaDto): Promise<BodegaItem> {
  return apiPost<BodegaItem>('/api/bodegas', dto);
}

export async function actualizarBodega(id: number, dto: ActualizarBodegaDto): Promise<BodegaItem> {
  return apiPatch<BodegaItem>(`/api/bodegas/${id}`, dto);
}

export async function desactivarBodega(id: number): Promise<BodegaItem> {
  return apiPatch<BodegaItem>(`/api/bodegas/${id}/desactivar`, {});
}

export async function activarBodega(id: number): Promise<BodegaItem> {
  return apiPatch<BodegaItem>(`/api/bodegas/${id}/activar`, {});
}

export async function verificarStockBodega(id: number): Promise<StockBodegaResult> {
  return apiGet<StockBodegaResult>(`/api/bodegas/${id}/tiene-stock`);
}
