import { apiGet, apiPatch, apiPost } from './api';
import type { CajaCierreListadoItem, CajaResumen, CajeroSesionActivaItem, EstadoCajaSesion } from '../types/caja-cierre.types';

export async function obtenerSesionCajaActiva(): Promise<{ activa: boolean; sesion: { id_caja_sesion: number; estado: EstadoCajaSesion } | null }> {
  return apiGet<{ activa: boolean; sesion: { id_caja_sesion: number; estado: EstadoCajaSesion } | null }>('/api/caja-cierres/sesion-activa');
}

export async function listarCajerosConCajaAbierta(): Promise<CajeroSesionActivaItem[]> {
  return apiGet<CajeroSesionActivaItem[]>('/api/caja-cierres/cajeros-activos');
}

export async function iniciarSesionCaja(codigo_empleado: string): Promise<CajaResumen> {
  return apiPost<CajaResumen>('/api/caja-cierres/iniciar', { codigo_empleado });
}

export async function obtenerResumenCajaActual(): Promise<CajaResumen> {
  return apiGet<CajaResumen>('/api/caja-cierres/actual');
}

export async function solicitarCierreCaja(payload: { codigo_empleado: string; observacion?: string; monto_declarado: number }): Promise<CajaResumen> {
  return apiPost<CajaResumen>('/api/caja-cierres/solicitar', payload);
}

export async function listarCierresCaja(estado?: EstadoCajaSesion): Promise<CajaCierreListadoItem[]> {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  return apiGet<CajaCierreListadoItem[]>(`/api/caja-cierres${query}`);
}

export async function autorizarCierreCaja(id: number): Promise<CajaCierreListadoItem> {
  return apiPatch<CajaCierreListadoItem>(`/api/caja-cierres/${id}/autorizar`, {});
}

export async function rechazarCierreCaja(id: number, motivo_rechazo: string): Promise<CajaCierreListadoItem> {
  return apiPatch<CajaCierreListadoItem>(`/api/caja-cierres/${id}/rechazar`, { motivo_rechazo });
}

export async function reautorizarCierreCaja(id: number): Promise<CajaCierreListadoItem> {
  return apiPatch<CajaCierreListadoItem>(`/api/caja-cierres/${id}/reautorizar`, {});
}
