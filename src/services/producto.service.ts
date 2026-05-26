// services/producto.service.ts
import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import type {
  Producto,
  ProductoSucursal,
  ProductoIngrediente,
  ProductoIngredienteInput,
  ProductoComboComponente,
  ProductoComboComponenteInput,
  ProductoDependenciasDesactivacion,
} from '../types/producto.types';

export async function getProductosCatalogo(idSucursal?: number): Promise<Producto[]> {
  const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
  return apiGet<Producto[]>(`/api/productos${query}`);
}

/** @deprecated use getProductosCatalogo – sucursal is resolved from the JWT on the server */
export async function getProductosBySucursal(_sucursalId: number): Promise<Producto[]> {
  return getProductosCatalogo();
}

export interface CrearProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  id_categoria: number;
  id_sucursal?: number;
  ids_sucursales?: number[];
  ingredientes?: ProductoIngredienteInput[];
  productos_combo?: ProductoComboComponenteInput[];
  activo?: boolean;
}

export interface ActualizarProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  id_categoria?: number;
  activo?: boolean;
  ids_sucursales?: number[];
  ingredientes?: ProductoIngredienteInput[];
  productos_combo?: ProductoComboComponenteInput[];
}

export async function crearProducto(dto: CrearProductoDto): Promise<Producto> {
  return apiPost<Producto>('/api/productos', dto);
}

export async function actualizarProducto(id: number, dto: ActualizarProductoDto): Promise<Producto> {
  return apiPatch<Producto>(`/api/productos/${id}`, dto);
}

export async function obtenerProducto(id: number): Promise<Producto> {
  return apiGet<Producto>(`/api/productos/${id}`);
}

export async function obtenerSucursalesDeProducto(id: number): Promise<ProductoSucursal[]> {
  return apiGet<ProductoSucursal[]>(`/api/productos/${id}/sucursales`);
}

export async function obtenerIngredientesDeProducto(id: number): Promise<ProductoIngrediente[]> {
  return apiGet<ProductoIngrediente[]>(`/api/productos/${id}/ingredientes`);
}

export async function obtenerComponentesCombo(id: number): Promise<ProductoComboComponente[]> {
  return apiGet<ProductoComboComponente[]>(`/api/productos/${id}/componentes-combo`);
}

export async function obtenerDependenciasDesactivacionProducto(id: number): Promise<ProductoDependenciasDesactivacion> {
  return apiGet<ProductoDependenciasDesactivacion>(`/api/productos/${id}/dependencias-desactivacion`);
}

export async function desactivarProducto(id: number, forzar = false): Promise<void> {
  const query = forzar ? '?forzar=true' : '';
  await apiDelete<void>(`/api/productos/${id}${query}`);
}

