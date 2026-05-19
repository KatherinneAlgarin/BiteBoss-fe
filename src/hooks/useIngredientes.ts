import { useState, useEffect } from 'react';
import {
  listarIngredientes, crearIngrediente, actualizarIngrediente,
  desactivarIngrediente, activarIngrediente, verificarEnUso,
} from '../services/ingrediente.service';
import type { IngredienteItem, CrearIngredienteDto, ActualizarIngredienteDto, EnUsoIngrediente } from '../types/ingrediente.types';

export function useIngredientes() {
  const [ingredientes, setIngredientes] = useState<IngredienteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredientes = async () => {
    try {
      setLoading(true);
      setError(null);
      setIngredientes(await listarIngredientes());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIngredientes(); }, []);

  const createIngrediente = async (dto: CrearIngredienteDto): Promise<IngredienteItem> => {
    const nuevo = await crearIngrediente(dto);
    await fetchIngredientes();
    return nuevo;
  };

  const updateIngrediente = async (id: number, dto: ActualizarIngredienteDto): Promise<IngredienteItem> => {
    const actualizado = await actualizarIngrediente(id, dto);
    await fetchIngredientes();
    return actualizado;
  };

  const deactivateIngrediente = async (id: number): Promise<void> => {
    await desactivarIngrediente(id);
    await fetchIngredientes();
  };

  const activateIngrediente = async (id: number): Promise<void> => {
    await activarIngrediente(id);
    await fetchIngredientes();
  };

  const checkEnUso = async (id: number): Promise<EnUsoIngrediente> => verificarEnUso(id);

  return {
    ingredientes, loading, error,
    refetch: fetchIngredientes,
    createIngrediente, updateIngrediente,
    deactivateIngrediente, activateIngrediente,
    checkEnUso,
  };
}
