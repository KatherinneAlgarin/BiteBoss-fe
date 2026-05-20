import { apiGet, apiPost, apiPatch } from './api';
import type { PedidoProveedorItem, CrearPedidoProveedorDto, EditarPedidoProveedorDto } from '../types/pedido-proveedor.types';

export async function listarPedidos(params?: { id_sucursal?: number; id_proveedor?: number }): Promise<PedidoProveedorItem[]> {
  const query = new URLSearchParams();
  if (params?.id_sucursal) query.set('id_sucursal', String(params.id_sucursal));
  if (params?.id_proveedor) query.set('id_proveedor', String(params.id_proveedor));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return apiGet<PedidoProveedorItem[]>(`/api/pedidos-proveedor${qs}`);
}

export async function obtenerPedido(id: number): Promise<PedidoProveedorItem> {
  return apiGet<PedidoProveedorItem>(`/api/pedidos-proveedor/${id}`);
}

export async function crearPedido(dto: CrearPedidoProveedorDto): Promise<PedidoProveedorItem> {
  return apiPost<PedidoProveedorItem>('/api/pedidos-proveedor', dto);
}

export async function editarPedido(id: number, dto: EditarPedidoProveedorDto): Promise<PedidoProveedorItem> {
  return apiPatch<PedidoProveedorItem>(`/api/pedidos-proveedor/${id}`, dto);
}
