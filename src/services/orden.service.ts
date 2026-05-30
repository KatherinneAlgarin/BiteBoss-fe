// services/orden.service.ts
import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './api';
import type { Orden, OrdenResumen, OrdenUpdate, DetalleCreate, DetalleUpdate, CrearOrdenDto, HistorialEstadoOrden } from '../types/orden.types';

export async function getOrdenesPendientes(): Promise<OrdenResumen[]> {
  return apiGet<OrdenResumen[]>('/api/ordenes?estado=NUEVO');
}

export async function getOrdenesTiempoReal(idSucursal?: number): Promise<OrdenResumen[]> {
  const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
  return apiGet<OrdenResumen[]>(`/api/ordenes${query}`);
}

export async function getOrdenById(id: number): Promise<Orden> {
  return apiGet<Orden>(`/api/ordenes/${id}`);
}

export async function getHistorialEstadosOrden(id: number): Promise<HistorialEstadoOrden[]> {
  return apiGet<HistorialEstadoOrden[]>(`/api/ordenes/${id}/historial-estados`);
}

export async function createOrden(payload: CrearOrdenDto): Promise<Orden> {
  return apiPost<Orden>('/api/ordenes', payload);
}

export async function updateOrden(id: number, updates: OrdenUpdate): Promise<Orden> {
  return apiPatch<Orden>(`/api/ordenes/${id}`, updates);
}

export async function addProductoToOrden(idPedido: number, detalle: DetalleCreate): Promise<Orden> {
  return apiPost<Orden>(`/api/ordenes/${idPedido}/detalles`, detalle);
}

export async function updateDetalleOrden(idPedido: number, idDetalle: number, updates: DetalleUpdate): Promise<Orden> {
  return apiPut<Orden>(`/api/ordenes/${idPedido}/detalles/${idDetalle}`, updates);
}

export async function removeDetalleOrden(idPedido: number, idDetalle: number): Promise<Orden> {
  return apiDelete<Orden>(`/api/ordenes/${idPedido}/detalles/${idDetalle}`);
}