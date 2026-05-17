import { apiGet, apiPost, apiPatch } from './api';
import type {
  ZonaItem,
  CrearZonaDto,
  ActualizarZonaDto,
} from '../types/zona.types';

export async function listarZonasPorSucursal(id_sucursal: number): Promise<ZonaItem[]> {
  return apiGet<ZonaItem[]>(`/api/zonas?id_sucursal=${id_sucursal}`);
}

export async function obtenerZona(id: number): Promise<ZonaItem> {
  return apiGet<ZonaItem>(`/api/zonas/${id}`);
}

export async function crearZona(dto: CrearZonaDto): Promise<ZonaItem> {
  return apiPost<ZonaItem>('/api/zonas', dto);
}

export async function actualizarZona(id: number, dto: ActualizarZonaDto): Promise<ZonaItem> {
  return apiPatch<ZonaItem>(`/api/zonas/${id}`, dto);
}

export async function desactivarZona(id: number): Promise<ZonaItem> {
  return apiPatch<ZonaItem>(`/api/zonas/${id}/desactivar`, {});
}

export async function activarZona(id: number): Promise<ZonaItem> {
  return apiPatch<ZonaItem>(`/api/zonas/${id}/activar`, {});
}
