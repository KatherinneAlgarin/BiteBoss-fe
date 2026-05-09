// types/producto.types.ts
export interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  disponible: boolean;
  categoria?: string;
  sucursal_id: number;
}