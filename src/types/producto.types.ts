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
  es_combo?:       boolean;
}

export interface ProductoIngrediente {
  id_ingrediente: number;
  cantidad: number;
  activo?: boolean;
  nombre_ingrediente?: string;
  unidad_medida?: string;
}

export interface ProductoIngredienteInput {
  id_ingrediente: number;
  cantidad: number;
}

export interface ProductoComboComponente {
  id_producto_hijo: number;
  cantidad: number;
  activo?: boolean;
  nombre_producto?: string;
}

export interface ProductoComboComponenteInput {
  id_producto_hijo: number;
  cantidad: number;
}

export interface ProductoDependenciasDesactivacion {
  id_producto: number;
  tiene_pedidos_activos: boolean;
  total_pedidos_activos: number;
  mensaje_advertencia?: string;
}

export interface ProductoSucursal {
  id_sucursal: number;
  activo: boolean;
}