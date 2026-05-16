import { apiGet } from './api';
import type { MesaItem } from '../types/reservacion.types';

export async function listarMesasPorZona(id_zona: number): Promise<MesaItem[]> {
  return apiGet<MesaItem[]>(`/api/mesas?id_zona=${id_zona}`);
}
