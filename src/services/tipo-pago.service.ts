import { apiGet } from './api';
import type { TipoPagoItem } from '../types/tipo-pago.types';

export async function listarTiposPago(): Promise<TipoPagoItem[]> {
  return apiGet<TipoPagoItem[]>('/api/tipos-pago');
}
