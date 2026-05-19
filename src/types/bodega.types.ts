export type TipoBodega = 'COCINA' | 'ALMACEN' | 'CONGELADOR' | 'OTRO';

export const TIPOS_BODEGA: { value: TipoBodega; label: string }[] = [
  { value: 'COCINA', label: 'Cocina' },
  { value: 'ALMACEN', label: 'Almacén' },
  { value: 'CONGELADOR', label: 'Congelador' },
  { value: 'OTRO', label: 'Otro' },
];

export interface BodegaItem {
  id_bodega: number;
  nombre: string;
  tipo: TipoBodega;
  descripcion: string | null;
  activo: boolean;
  id_sucursal: number;
  sucursal?: string;
}

export interface CrearBodegaDto {
  nombre: string;
  tipo: TipoBodega;
  descripcion?: string | null;
  id_sucursal: number;
}

export interface ActualizarBodegaDto {
  nombre?: string;
  tipo?: TipoBodega;
  descripcion?: string | null;
  id_sucursal?: number;
}

export interface StockBodegaResult {
  tiene_stock: boolean;
}
