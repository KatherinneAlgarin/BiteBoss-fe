import { apiGet, apiPost, apiPatch } from './api';
import type {
  MesaItem,
  CrearMesaDto,
  ActualizarMesaDto,
} from '../types/mesa.types';

export async function listarMesasPorZona(id_zona: number): Promise<MesaItem[]> {
  return apiGet<MesaItem[]>(`/api/mesas?id_zona=${id_zona}`);
}

export async function obtenerMesa(id: number): Promise<MesaItem> {
  return apiGet<MesaItem>(`/api/mesas/${id}`);
}

export async function crearMesa(dto: CrearMesaDto): Promise<MesaItem> {
  return apiPost<MesaItem>('/api/mesas', dto);
}

export async function actualizarMesa(id: number, dto: ActualizarMesaDto): Promise<MesaItem> {
  return apiPatch<MesaItem>(`/api/mesas/${id}`, dto);
}

export async function desactivarMesa(id: number): Promise<MesaItem> {
  return apiPatch<MesaItem>(`/api/mesas/${id}/desactivar`, {});
}

export async function activarMesa(id: number): Promise<MesaItem> {
  return apiPatch<MesaItem>(`/api/mesas/${id}/activar`, {});
}
