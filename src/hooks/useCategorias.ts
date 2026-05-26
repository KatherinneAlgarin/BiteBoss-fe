import { useState, useEffect } from 'react';
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  desactivarCategoria,
  activarCategoria,
  verificarProductosActivos,
} from '../services/categoria.service';
import type {
  CategoriaItem,
  CrearCategoriaDto,
  ActualizarCategoriaDto,
  ProductosActivosCategoria,
} from '../types/categoria.types';

export function useCategorias() {
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarCategorias();
      setCategorias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const createCategoria = async (dto: CrearCategoriaDto): Promise<CategoriaItem> => {
    const nueva = await crearCategoria(dto);
    await fetchCategorias();
    return nueva;
  };

  const updateCategoria = async (id: number, dto: ActualizarCategoriaDto): Promise<CategoriaItem> => {
    const actualizada = await actualizarCategoria(id, dto);
    await fetchCategorias();
    return actualizada;
  };

  const deactivateCategoria = async (id: number): Promise<void> => {
    await desactivarCategoria(id);
    await fetchCategorias();
  };

  const activateCategoria = async (id: number): Promise<void> => {
    await activarCategoria(id);
    await fetchCategorias();
  };

  const fetchProductosActivos = async (id: number): Promise<ProductosActivosCategoria> => {
    return verificarProductosActivos(id);
  };

  return {
    categorias,
    loading,
    error,
    refetch: fetchCategorias,
    createCategoria,
    updateCategoria,
    deactivateCategoria,
    activateCategoria,
    fetchProductosActivos,
  };
}
