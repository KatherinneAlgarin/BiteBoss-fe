import { useState } from 'react';
import { useCategorias } from '../../../hooks/useCategorias';
import { CategoriasList } from '../../../components/categorias/CategoriasList';
import { CategoriaForm } from '../../../components/categorias/CategoriaForm';
import type { CategoriaItem } from '../../../types/categoria.types';

type ModalMode = 'create' | 'edit' | null;

export function CategoriasPage() {
  const {
    categorias,
    loading,
    error,
    refetch,
    createCategoria,
    updateCategoria,
    deactivateCategoria,
    activateCategoria,
    fetchProductosActivos,
  } = useCategorias();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<CategoriaItem | null>(null);

  const handleCreate = () => {
    setSelected(null);
    setModalMode('create');
  };

  const handleEdit = (categoria: CategoriaItem) => {
    setSelected(categoria);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
        <p className="text-gray-500 mt-1">
          Gestiona las categorías de productos del menú.
        </p>
      </div>

      <CategoriasList
        categorias={categorias}
        loading={loading}
        error={error}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onFetchProductosActivos={fetchProductosActivos}
        onDeactivate={deactivateCategoria}
        onActivate={activateCategoria}
      />

      {modalMode && (
        <CategoriaForm
          categoria={selected ?? undefined}
          onCreate={createCategoria}
          onUpdate={updateCategoria}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
