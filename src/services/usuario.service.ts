import { apiGet, apiPost } from './api';
import type {
  CrearUsuarioDto,
  RolItem,
  SucursalItem,
  UsuarioCreadoResponse,
  UsuarioListItem,
} from '../types/usuario.types';

export function listarUsuarios(): Promise<UsuarioListItem[]> {
  return apiGet<UsuarioListItem[]>('/api/usuarios');
}

export function listarRoles(): Promise<RolItem[]> {
  return apiGet<RolItem[]>('/api/usuarios/roles');
}

export function listarSucursales(): Promise<SucursalItem[]> {
  return apiGet<SucursalItem[]>('/api/usuarios/sucursales');
}

export function crearUsuario(dto: CrearUsuarioDto): Promise<UsuarioCreadoResponse> {
  return apiPost<UsuarioCreadoResponse>('/api/usuarios', dto);
}
