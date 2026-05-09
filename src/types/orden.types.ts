// types/orden.types.ts
export type Orden = {
  id_pedido: number;
  numero_orden: string;
  id_sucursal_tipo_orden?: number;
  tipo_orden?: 'dine-in' | 'takeout' | 'delivery';
  estado_operativo: 'ABIERTO' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  estado_financiero: 'SIN_PAGAR' | 'PAGADO' | 'PAGO_PARCIAL' | 'REEMBOLSADO';
  nombre_cliente?: string;
  apellido_cliente?: string;
  id_mesa?: number;
  total: number;
  fecha_apertura?: string;
  detalles: Detalle[];
};

export type Detalle = {
  id_pedido_producto: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  estado_linea: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO';
  nota?: string;
  nombre_producto?: string;
  creado_en?: string;
};

export type OrdenUpdate = {
  tipo_orden?: 'dine-in' | 'takeout' | 'delivery';
  estado_operativo?: 'ABIERTO' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  nombre_cliente?: string;
  apellido_cliente?: string;
  id_mesa?: number;
};

export type DetalleCreate = {
  id_producto: number;
  cantidad: number;
  nota?: string;
};

export type DetalleUpdate = {
  cantidad?: number;
  nota?: string;
  estado_linea?: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO';
};

export type CrearOrdenDto = {
  id_sucursal: number;
  tipo_orden: 'dine-in' | 'takeout' | 'delivery';
  id_mesa?: number;
  nombre_cliente?: string;
  apellido_cliente?: string;
  detalles: Array<{
    id_producto: number;
    cantidad: number;
    nota?: string;
  }>;
};