// types/pago.types.ts
export interface MetodoPago {
  metodo: string;
  descripcion: string;
  disponible: boolean;
}

export interface PagoCreate {
  id_pedido: number;
  metodo_pago: string;
  monto: number;
  notas?: string;
}