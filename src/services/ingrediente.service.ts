import { apiGet, apiPost, apiPatch } from './api';
import type { IngredienteItem, CrearIngredienteDto, ActualizarIngredienteDto, EnUsoIngrediente } from '../types/ingrediente.types';

export async function listarIngredientes(): Promise<IngredienteItem[]> {
  return apiGet<IngredienteItem[]>('/api/ingredientes');
}

export async function crearIngrediente(dto: CrearIngredienteDto): Promise<IngredienteItem> {
  return apiPost<IngredienteItem>('/api/ingredientes', dto);
}

export async function actualizarIngrediente(id: number, dto: ActualizarIngredienteDto): Promise<IngredienteItem> {
  return apiPatch<IngredienteItem>(`/api/ingredientes/${id}`, dto);
}

export async function desactivarIngrediente(id: number): Promise<IngredienteItem> {
  return apiPatch<IngredienteItem>(`/api/ingredientes/${id}/desactivar`, {});
}

export async function activarIngrediente(id: number): Promise<IngredienteItem> {
  return apiPatch<IngredienteItem>(`/api/ingredientes/${id}/activar`, {});
}

export async function verificarEnUso(id: number): Promise<EnUsoIngrediente> {
  return apiGet<EnUsoIngrediente>(`/api/ingredientes/${id}/en-uso`);
}
