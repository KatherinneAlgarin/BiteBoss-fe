// services/producto.service.ts
import { apiGet, apiPatch, apiPost } from './api';
import type { Producto, ProductoSucursal } from '../types/producto.types';

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
  activo?: boolean;
}

export interface ActualizarProductoDto {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  id_categoria?: number;
  activo?: boolean;
  ids_sucursales?: number[];
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

export interface Categoria {
  id_categoria: number;
  nombre: string;
  activo: boolean;
}

export async function listarCategorias(): Promise<Categoria[]> {
  return apiGet<Categoria[]>('/api/productos/categorias/listar');
}