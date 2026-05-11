import { useState } from 'react';
import { useTiposOrden } from '../../../hooks/useTiposOrden';
import { TiposOrdenList } from '../../../components/tipos-orden/TiposOrdenList';
import { TipoOrdenForm } from '../../../components/tipos-orden/TipoOrdenForm';
import type { TipoOrdenItem } from '../../../types/tipo-orden.types';

type ModalMode = 'create' | 'edit' | null;

export function TiposOrdenPage() {
  const {
    tipos,
    loading,
    error,
    refetch,
    createTipoOrden,
    updateTipoOrden,
    deactivateTipoOrden,
    activateTipoOrden,
  } = useTiposOrden();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<TipoOrdenItem | null>(null);

  const handleCreate = () => {
    setSelected(null);
    setModalMode('create');
  };

  const handleEdit = (tipo: TipoOrdenItem) => {
    setSelected(tipo);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tipos de Orden</h1>
        <p className="text-gray-500 mt-1">
          Gestiona el catálogo global de tipos de orden disponibles para asignar a sucursales
        </p>
      </div>

      <TiposOrdenList
        tipos={tipos}
        loading={loading}
        error={error}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeactivate={deactivateTipoOrden}
        onActivate={activateTipoOrden}
      />

      {modalMode && (
        <TipoOrdenForm
          tipo={selected ?? undefined}
          tipos={tipos}
          onCreate={createTipoOrden}
          onUpdate={updateTipoOrden}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
