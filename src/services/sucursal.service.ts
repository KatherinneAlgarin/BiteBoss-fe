import { apiGet, apiPost, apiPatch } from './api';
import type {
  SucursalItem,
  SucursalDetalle,
  CrearSucursalDto,
  ActualizarSucursalDto,
} from '../types/sucursal.types';

export async function listarSucursales(soloActivas = false): Promise<SucursalItem[]> {
  const query = soloActivas ? '?activo=true' : '';
  return apiGet<SucursalItem[]>(`/api/sucursales${query}`);
}

export async function obtenerSucursal(id: number): Promise<SucursalDetalle> {
  return apiGet<SucursalDetalle>(`/api/sucursales/${id}`);
}

export async function crearSucursal(dto: CrearSucursalDto): Promise<SucursalDetalle> {
  return apiPost<SucursalDetalle>('/api/sucursales', dto);
}

export async function actualizarSucursal(id: number, dto: ActualizarSucursalDto): Promise<SucursalDetalle> {
  return apiPatch<SucursalDetalle>(`/api/sucursales/${id}`, dto);
}

export async function desactivarSucursal(id: number): Promise<SucursalItem> {
  return apiPatch<SucursalItem>(`/api/sucursales/${id}/desactivar`, {});
}

export async function activarSucursal(id: number): Promise<SucursalItem> {
  return apiPatch<SucursalItem>(`/api/sucursales/${id}/activar`, {});
}
