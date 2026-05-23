// types/producto.types.ts
export interface Producto {
  id_producto:     number;
  nombre:          string;
  precio:          number;
  descripcion?:    string;
  id_categoria:    number;
  categoria_nombre?: string;
  activo:          boolean;
  ids_sucursales?: number[];
}

export interface ProductoSucursal {
  id_sucursal: number;
  activo: boolean;
}