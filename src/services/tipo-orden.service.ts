import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type {
  TipoOrdenItem,
  CrearTipoOrdenDto,
  ActualizarTipoOrdenDto,
  DependenciasTipoOrden,
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

export async function obtenerDependenciasTipoOrden(id: number): Promise<DependenciasTipoOrden> {
  return apiGet<DependenciasTipoOrden>(`/api/tipos-orden/${id}/dependencias`);
}

export async function eliminarTipoOrden(id: number): Promise<void> {
  return apiDelete<void>(`/api/tipos-orden/${id}`);
}
