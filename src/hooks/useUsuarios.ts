import { useState, useEffect, useCallback } from 'react';
import {
  listarUsuarios,
  listarRoles,
  crearUsuario,
  actualizarUsuario,
} from '../services/usuario.service';
import type {
  UsuarioListItem,
  RolItem,
  CrearUsuarioDto,
  ActualizarUsuarioDto,
} from '../types/usuario.types';

const isDev = import.meta.env.DEV;

export interface UsuariosFilters {
  search?: string;
  id_rol?: number;
  id_sucursal?: number;
}

export function useUsuarios(filters?: UsuariosFilters) {
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarUsuarios(filters);
      setUsuarios(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useUsuarios] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await listarRoles();
      setRoles(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      if (isDev) console.error('[useUsuarios] Error al cargar roles:', errorMsg);
    }
  }, []);

  useEffect(() => {
    void fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  const crearNuevoUsuario = async (dto: CrearUsuarioDto): Promise<void> => {
    await crearUsuario(dto);
    await fetchUsuarios();
  };

  const actualizarPermisosUsuario = async (
    id_usuario: number,
    dto: ActualizarUsuarioDto
  ): Promise<void> => {
    await actualizarUsuario(id_usuario, dto);
    await fetchUsuarios();
  };

  return {
    usuarios,
    roles,
    loading,
    error,
    refetch: fetchUsuarios,
    crearNuevoUsuario,
    actualizarPermisosUsuario,
  };
}
