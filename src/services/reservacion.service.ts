import { apiGet, apiPost, apiPatch } from './api';
import type { ReservacionItem, CrearReservacionPayload, ActualizarReservacionPayload } from '../types/reservacion.types';

export async function listarReservaciones(activo?: boolean): Promise<ReservacionItem[]> {
  const param = activo === undefined ? '' : `?activo=${activo}`;
  return apiGet<ReservacionItem[]>(`/api/reservaciones${param}`);
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
