import { useState, useEffect } from 'react';
import { listarProveedores, obtenerProveedor, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedor.service';
import type { ProveedorListItem, ProveedorDto, CrearProveedorDto, ActualizarProveedorDto } from '../types/proveedor.types';

export function useProveedores() {
  const [proveedores, setProveedores] = useState<ProveedorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarProveedores();
      setProveedores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const createProveedor = async (dto: CrearProveedorDto) => {
    try {
      const nuevoProveedor = await crearProveedor(dto);
      setProveedores(prev => [...prev, {
        id_proveedor: nuevoProveedor.id_proveedor!,
        nombre: nuevoProveedor.nombre,
        email: nuevoProveedor.email,
        telefono: nuevoProveedor.telefono,
        direccion: nuevoProveedor.direccion,
        activo: nuevoProveedor.activo,
        creado_en: new Date().toISOString(), // Approximate
      }]);
      return nuevoProveedor;
    } catch (err) {
      throw err;
    }
  };

  const updateProveedor = async (id: number, dto: ActualizarProveedorDto) => {
    try {
      const updatedProveedor = await actualizarProveedor(id, dto);
      setProveedores(prev => prev.map(p =>
        p.id_proveedor === id ? {
          ...p,
          ...updatedProveedor,
        } : p
      ));
      return updatedProveedor;
    } catch (err) {
      throw err;
    }
  };

  const deleteProveedor = async (id: number) => {
    try {
      await eliminarProveedor(id);
      setProveedores(prev => prev.filter(p => p.id_proveedor !== id));
    } catch (err) {
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
        const data = await obtenerProveedor(id);
        setProveedor(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
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