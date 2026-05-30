import { useMemo, useState } from 'react';
import { useIngredientes } from '../../../hooks/useIngredientes';
import { useBodegas } from '../../../hooks/useBodegas';
import { IngredientesList } from '../../../components/ingredientes/IngredientesList';
import { IngredienteForm } from '../../../components/ingredientes/IngredienteForm';
import type { IngredienteItem } from '../../../types/ingrediente.types';

export function IngredientesAdminPage() {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedIngrediente, setSelectedIngrediente] = useState<IngredienteItem | undefined>(undefined);
  const [busqueda, setBusqueda] = useState('');

  const { ingredientes, loading, error, refetch, createIngrediente, updateIngrediente, deactivateIngrediente, activateIngrediente, checkEnUso } =
    useIngredientes();
  const { bodegas, loading: loadingBodegas } = useBodegas();

  const ingredientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return ingredientes;

    return ingredientes.filter(item => {
      const estado = item.activo ? 'activo' : 'inactivo';
      return (
        item.nombre.toLowerCase().includes(termino) ||
        item.unidad_medida.toLowerCase().includes(termino) ||
        estado.includes(termino)
      );
    });
  }, [busqueda, ingredientes]);

  const handleCreate = () => {
    setSelectedIngrediente(undefined);
    setModalMode('create');
  };

  const handleEdit = (ingrediente: IngredienteItem) => {
    setSelectedIngrediente(ingrediente);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelectedIngrediente(undefined);
  };

  const handleSuccess = () => {
    handleClose();
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Ingredientes</h1>
        <p className="text-gray-500 text-sm mt-1">Administra los ingredientes disponibles para los productos</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <label htmlFor="busqueda-ingredientes" className="mb-2 block text-sm font-medium text-gray-700">
          Buscar ingredientes
        </label>
        <input
          id="busqueda-ingredientes"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, unidad o estado"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <IngredientesList
        ingredientes={ingredientesFiltrados}
        loading={loading}
        error={error}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeactivate={deactivateIngrediente}
        onActivate={activateIngrediente}
        onCheckEnUso={checkEnUso}
      />

      {modalMode && (
        <IngredienteForm
          ingrediente={selectedIngrediente}
          bodegas={bodegas}
          loadingBodegas={loadingBodegas}
          onCreate={createIngrediente}
          onUpdate={updateIngrediente}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
