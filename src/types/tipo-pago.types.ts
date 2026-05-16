export interface TipoPagoItem {
  id_tipo_pago: number;
  nombre: string;
  activo: boolean;
}

export interface CrearTipoPagoDto {
  nombre: string;
}

export interface ActualizarTipoPagoDto {
  nombre?: string;
}

export interface SucursalImpactadaTipoPago {
  id_sucursal: number;
  nombre: string;
  metodos_activos_restantes: number;
}

export interface DependenciasDesactivacionTipoPago {
  id_tipo_pago: number;
  nombre: string;
  sucursales_activas_count: number;
  sucursales_activas: SucursalImpactadaTipoPago[];
  puede_desactivar: boolean;
  sucursales_sin_metodos: SucursalImpactadaTipoPago[];
}
