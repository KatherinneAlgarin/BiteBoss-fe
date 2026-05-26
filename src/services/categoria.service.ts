import { apiGet, apiPost, apiPatch } from './api';
import type {
  CategoriaItem,
  CrearCategoriaDto,
  ActualizarCategoriaDto,
  ProductosActivosCategoria,
} from '../types/categoria.types';

export async function listarCategorias(): Promise<CategoriaItem[]> {
  return apiGet<CategoriaItem[]>('/api/categorias');
}

export async function crearCategoria(dto: CrearCategoriaDto): Promise<CategoriaItem> {
  return apiPost<CategoriaItem>('/api/categorias', dto);
}

export async function actualizarCategoria(id: number, dto: ActualizarCategoriaDto): Promise<CategoriaItem> {
  return apiPatch<CategoriaItem>(`/api/categorias/${id}`, dto);
}

export async function verificarProductosActivos(id: number): Promise<ProductosActivosCategoria> {
  return apiGet<ProductosActivosCategoria>(`/api/categorias/${id}/productos-activos`);
}

export async function desactivarCategoria(id: number): Promise<CategoriaItem> {
  return apiPatch<CategoriaItem>(`/api/categorias/${id}/desactivar`, {});
}

export async function activarCategoria(id: number): Promise<CategoriaItem> {
  return apiPatch<CategoriaItem>(`/api/categorias/${id}/activar`, {});
}
