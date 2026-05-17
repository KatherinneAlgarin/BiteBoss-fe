import { useState, useEffect } from 'react';
import { listarProveedores, obtenerProveedor, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedor.service';
import type { ProveedorListItem, ProveedorDto, CrearProveedorDto, ActualizarProveedorDto } from '../types/proveedor.types';

const isDev = import.meta.env.DEV;

export function useProveedores() {
  const [proveedores, setProveedores] = useState<ProveedorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isDev) console.log('[useProveedores] Cargando proveedores...');
      const data = await listarProveedores();
      setProveedores(data);
      if (isDev) console.log('[useProveedores] Datos cargados:', data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      if (isDev) console.error('[useProveedores] Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const createProveedor = async (dto: CrearProveedorDto) => {
    try {
      if (isDev) console.log('[useProveedores] Creando proveedor:', dto);
      const nuevoProveedor = await crearProveedor(dto);
      setProveedores(prev => [...prev, {
        id_proveedor: nuevoProveedor.id_proveedor!,
        nombre: nuevoProveedor.nombre,
        email: nuevoProveedor.email,
        telefono: nuevoProveedor.telefono,
        direccion: nuevoProveedor.direccion,
        activo: nuevoProveedor.activo,
        creado_en: new Date().toISOString(),
      }]);
      return nuevoProveedor;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      if (isDev) console.error('[useProveedores] Error al crear:', errorMsg);
      throw err;
    }
  };

  const updateProveedor = async (id: number, dto: ActualizarProveedorDto) => {
    try {
      if (isDev) console.log('[useProveedores] Actualizando proveedor:', id, dto);
      const updatedProveedor = await actualizarProveedor(id, dto);
      setProveedores(prev => prev.map(p =>
        p.id_proveedor === id ? {
          ...p,
          ...updatedProveedor,
        } : p
      ));
      return updatedProveedor;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      if (isDev) console.error('[useProveedores] Error al actualizar:', errorMsg);
      throw err;
    }
  };

  const deleteProveedor = async (id: number) => {
    try {
      if (isDev) console.log('[useProveedores] Eliminando proveedor:', id);
      await eliminarProveedor(id);
      setProveedores(prev => prev.filter(p => p.id_proveedor !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      if (isDev) console.error('[useProveedores] Error al eliminar:', errorMsg);
      throw err;
    }
  };

  return {
    proveedores,
    loading,
    error,
    refetch: fetchProveedores,
    createProveedor,
    updateProveedor,
    deleteProveedor,
  };
}

export function useProveedor(id: number | null) {
  const [proveedor, setProveedor] = useState<ProveedorDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProveedor(null);
      return;
    }

    const fetchProveedor = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isDev) console.log('[useProveedor] Cargando proveedor:', id);
        const data = await obtenerProveedor(id);
        setProveedor(data);
        if (isDev) console.log('[useProveedor] Proveedor cargado:', data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        if (isDev) console.error('[useProveedor] Error:', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProveedor();
  }, [id]);

  return {
    proveedor,
    loading,
    error,
  };
}