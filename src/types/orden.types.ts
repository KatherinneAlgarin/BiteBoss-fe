// types/orden.types.ts
export type Orden = {
  id_pedido: number;
  numero_orden: string;
  id_sucursal_tipo_orden?: number;
  tipo_orden?: 'dine-in' | 'takeout' | 'delivery';
  estado_operativo: 'ABIERTO' | 'POR_COBRAR' | 'CERRADO' | 'CANCELADO' | 'FINALIZADO';
  estado_financiero: 'SIN_PAGAR' | 'PAGADO' | 'PAGO_PARCIAL' | 'REEMBOLSADO';
  nombre_cliente?: string;
  apellido_cliente?: string;
  id_mesa?: number;
  total: number;
  fecha_apertura?: string;
  fecha_cerrado?: string;
  detalles: Detalle[];
};

export type OrdenResumen = {
  id_pedido: number;
  numero_orden: string;
  tipo_orden?: 'dine-in' | 'takeout' | 'delivery' | string;
  estado_operativo: 'ABIERTO' | 'POR_COBRAR' | 'CERRADO' | 'CANCELADO' | 'FINALIZADO';
  total: number;
  fecha_apertura?: string;
  fecha_cerrado?: string;
  usuario_nombre?: string | null;
  mesa_numero?: number | null;
  nombre_cliente: string;
  apellido_cliente?: string;
  detalles?: Array<{
    id_producto: number;
    nombre_producto?: string;
    cantidad: number;
    nota?: string;
  }>;
};

export type HistorialEstadoOrden = {
  id_auditoria: number;
  estado_anterior: 'ABIERTO' | 'POR_COBRAR' | 'CERRADO' | 'CANCELADO' | 'FINALIZADO' | null;
  estado_nuevo: 'ABIERTO' | 'POR_COBRAR' | 'CERRADO' | 'CANCELADO' | 'FINALIZADO' | null;
  creado_en: string;
  id_usuario?: number;
  usuario_nombre?: string | null;
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
  estado_operativo?: 'ABIERTO' | 'POR_COBRAR' | 'CERRADO' | 'CANCELADO' | 'FINALIZADO';
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
  id_sucursal?: number;
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