import { useMemo, useState } from 'react';
import { useIngredientes } from '../../../hooks/useIngredientes';
import { useBodegas } from '../../../hooks/useBodegas';
import { IngredientesList } from '../../../components/ingredientes/IngredientesList';
import { IngredienteForm } from '../../../components/ingredientes/IngredienteForm';
import { FilterPanel } from '../../../components/ui/FilterPanel';
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

      <FilterPanel title="Buscar ingredientes" description="Filtra por nombre, unidad de medida o estado.">
        <input
          id="busqueda-ingredientes"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, unidad o estado"
          className="input-field"
        />
      </FilterPanel>

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
