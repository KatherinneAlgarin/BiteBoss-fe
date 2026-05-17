import { apiGet, apiPost, apiPatch } from './api';
import type { ReservacionItem, CrearReservacionPayload, ActualizarReservacionPayload, EstadoReservacion } from '../types/reservacion.types';

export async function listarReservaciones(
  estado?: EstadoReservacion,
  fecha?: string,
  id_zona?: number,
): Promise<ReservacionItem[]> {
  const params = new URLSearchParams();
  if (estado)  params.set('estado', estado);
  if (fecha)   params.set('fecha', fecha);
  if (id_zona) params.set('zona', String(id_zona));
  const qs = params.toString();
  return apiGet<ReservacionItem[]>(`/api/reservaciones${qs ? `?${qs}` : ''}`);
}

export async function crearReservacion(payload: CrearReservacionPayload): Promise<ReservacionItem> {
  return apiPost<ReservacionItem>('/api/reservaciones', payload);
}

export async function actualizarReservacion(id: number, payload: ActualizarReservacionPayload): Promise<ReservacionItem> {
  return apiPatch<ReservacionItem>(`/api/reservaciones/${id}`, payload);
}

export async function cancelarReservacion(id: number): Promise<void> {
  return apiPatch<void>(`/api/reservaciones/${id}/cancelar`, {});
}

export async function reactivarReservacion(id: number): Promise<void> {
  return apiPatch<void>(`/api/reservaciones/${id}/reactivar`, {});
}

export async function completarReservacion(id: number): Promise<void> {
  return apiPatch<void>(`/api/reservaciones/${id}/completar`, {});
}
