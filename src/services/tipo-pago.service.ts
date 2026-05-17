import { apiGet, apiPatch, apiPost } from './api';
import type {
  TipoPagoItem,
  CrearTipoPagoDto,
  ActualizarTipoPagoDto,
  DependenciasDesactivacionTipoPago,
} from '../types/tipo-pago.types';

export async function listarTiposPago(): Promise<TipoPagoItem[]> {
  return apiGet<TipoPagoItem[]>('/api/tipos-pago');
}

export async function obtenerTipoPago(id: number): Promise<TipoPagoItem> {
  return apiGet<TipoPagoItem>(`/api/tipos-pago/${id}`);
}

export async function crearTipoPago(dto: CrearTipoPagoDto): Promise<TipoPagoItem> {
  return apiPost<TipoPagoItem>('/api/tipos-pago', dto);
}

export async function actualizarTipoPago(id: number, dto: ActualizarTipoPagoDto): Promise<TipoPagoItem> {
  return apiPatch<TipoPagoItem>(`/api/tipos-pago/${id}`, dto);
}

export async function obtenerDependenciasDesactivacionTipoPago(id: number): Promise<DependenciasDesactivacionTipoPago> {
  return apiGet<DependenciasDesactivacionTipoPago>(`/api/tipos-pago/${id}/dependencias-desactivacion`);
}

export async function desactivarTipoPago(id: number): Promise<TipoPagoItem> {
  return apiPatch<TipoPagoItem>(`/api/tipos-pago/${id}/desactivar`, {});
}

export async function activarTipoPago(id: number): Promise<TipoPagoItem> {
  return apiPatch<TipoPagoItem>(`/api/tipos-pago/${id}/activar`, {});
}
