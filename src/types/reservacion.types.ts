export interface ReservacionItem {
  id_reservacion: number;
  nombre_cliente: string;
  telefono: string | null;
  email: string | null;
  fecha_llegada: string;
  cantidad_personas: number;
  id_zona: number;
  zona_nombre: string;
  id_mesa: number;
  mesa_numero: number;
  id_sucursal: number;
  id_usuario_sucursal: number;
  activo: boolean;
  creado_en: string;
}

export interface ActualizarReservacionPayload {
  nombre_cliente?: string;
  telefono?: string | null;
  email?: string | null;
  fecha_llegada?: string;
  cantidad_personas?: number;
  id_zona?: number;
  id_mesa?: number;
}

export interface CrearReservacionPayload {
  nombre_cliente: string;
  telefono?: string | null;
  email?: string | null;
  fecha_llegada: string;
  cantidad_personas: number;
  id_zona: number;
  id_mesa: number;
}

export interface ReservacionFormData {
  nombre_cliente: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  cantidad_personas: string;
  id_zona: string;
  id_mesa: string;
}

export interface ZonaItem {
  id_zona: number;
  id_sucursal: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface MesaItem {
  id_mesa: number;
  id_zona: number;
  numero: number;
  capacidad: number;
  activo: boolean;
}
