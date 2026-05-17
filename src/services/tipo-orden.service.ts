import { apiGet, apiPost, apiPatch } from './api';
import type {
  TipoOrdenItem,
  CrearTipoOrdenDto,
  ActualizarTipoOrdenDto,
} from '../types/tipo-orden.types';

export async function listarTiposOrden(): Promise<TipoOrdenItem[]> {
  return apiGet<TipoOrdenItem[]>('/api/tipos-orden');
}

export async function obtenerTipoOrden(id: number): Promise<TipoOrdenItem> {
  return apiGet<TipoOrdenItem>(`/api/tipos-orden/${id}`);
}

export async function crearTipoOrden(dto: CrearTipoOrdenDto): Promise<TipoOrdenItem> {
  return apiPost<TipoOrdenItem>('/api/tipos-orden', dto);
}

export async function actualizarTipoOrden(id: number, dto: ActualizarTipoOrdenDto): Promise<TipoOrdenItem> {
  return apiPatch<TipoOrdenItem>(`/api/tipos-orden/${id}`, dto);
}

export async function desactivarTipoOrden(id: number): Promise<TipoOrdenItem> {
  return apiPatch<TipoOrdenItem>(`/api/tipos-orden/${id}/desactivar`, {});
}

export async function activarTipoOrden(id: number): Promise<TipoOrdenItem> {
  return apiPatch<TipoOrdenItem>(`/api/tipos-orden/${id}/activar`, {});
}
