// types/pago.types.ts
export interface MetodoPago {
  metodo: string;
  descripcion: string;
  disponible: boolean;
}

export interface PagoCreate {
  id_orden: number;
  metodo: string;
  monto: number;
  referencia?: string;
  propina?: number;
}