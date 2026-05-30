import { apiGet, apiPost, apiPatch } from './api';
import type {
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  RolItem,
  UsuarioCreadoResponse,
  UsuarioActualizadoResponse,
  UsuarioListItem,
} from '../types/usuario.types';

export function listarUsuarios(params?: {
  search?: string;
  id_rol?: number;
  id_sucursal?: number;
}): Promise<UsuarioListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.id_rol) searchParams.append('id_rol', String(params.id_rol));
  if (params?.id_sucursal) searchParams.append('id_sucursal', String(params.id_sucursal));
  
  const query = searchParams.toString();
  const path = query ? `/api/usuarios?${query}` : '/api/usuarios';
  
  return apiGet<UsuarioListItem[]>(path);
}

export function listarRoles(): Promise<RolItem[]> {
  return apiGet<RolItem[]>('/api/usuarios/roles');
}

export function generarCodigoEmpleadoAleatorio(): Promise<{ codigo_empleado: string }> {
  return apiGet<{ codigo_empleado: string }>('/api/usuarios/codigo-empleado/aleatorio');
}

export function crearUsuario(dto: CrearUsuarioDto): Promise<UsuarioCreadoResponse> {
  return apiPost<UsuarioCreadoResponse>('/api/usuarios', dto);
}

export function actualizarUsuario(
  id_usuario: number,
  dto: ActualizarUsuarioDto
): Promise<UsuarioActualizadoResponse> {
  return apiPatch<UsuarioActualizadoResponse>(`/api/usuarios/${id_usuario}`, dto);
}
