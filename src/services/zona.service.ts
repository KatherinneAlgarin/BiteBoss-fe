import { apiGet } from './api';
import type { ZonaItem } from '../types/reservacion.types';

export async function listarZonasPorSucursal(id_sucursal: number): Promise<ZonaItem[]> {
  return apiGet<ZonaItem[]>(`/api/zonas?id_sucursal=${id_sucursal}`);
}
