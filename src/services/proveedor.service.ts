import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type {
  ProveedorDto,
  ProveedorListItem,
  CrearProveedorDto,
  ActualizarProveedorDto,
} from '../types/proveedor.types';

export async function listarProveedores(): Promise<ProveedorListItem[]> {
  return apiGet<ProveedorListItem[]>('/api/proveedores');
}

export async function obtenerProveedor(id: number): Promise<ProveedorDto> {
  return apiGet<ProveedorDto>(`/api/proveedores/${id}`);
}

export async function crearProveedor(dto: CrearProveedorDto): Promise<ProveedorDto> {
  return apiPost<ProveedorDto>('/api/proveedores', dto);
}

export async function actualizarProveedor(id: number, dto: ActualizarProveedorDto): Promise<ProveedorDto> {
  return apiPatch<ProveedorDto>(`/api/proveedores/${id}`, dto);
}

export async function eliminarProveedor(id: number): Promise<void> {
  return apiDelete<void>(`/api/proveedores/${id}`);
}