import { useState } from 'react';
import { useZonas } from '../../hooks/useZonas';
import { ZonasList } from './ZonasList';
import { ZonaForm } from './ZonaForm';
import type { ZonaItem } from '../../types/zona.types';

type ModalMode = 'create' | 'edit' | null;

interface ZonasTabProps {
  id_sucursal: number | null;
}

export function ZonasTab({ id_sucursal }: ZonasTabProps) {
  const {
    zonas,
    loading,
    error,
    refetch,
    createZona,
    updateZona,
    deactivateZona,
    activateZona,
  } = useZonas(id_sucursal);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<ZonaItem | null>(null);

  const handleCreate = () => {
    setSelected(null);
    setModalMode('create');
  };

  const handleEdit = (zona: ZonaItem) => {
    setSelected(zona);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <ZonasList
        zonas={zonas}
        loading={loading}
        error={error}
        sucursalSeleccionada={id_sucursal !== null}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeactivate={deactivateZona}
        onActivate={activateZona}
      />

      {modalMode && id_sucursal && (
        <ZonaForm
          zona={selected ?? undefined}
          id_sucursal={id_sucursal}
          onCreate={createZona}
          onUpdate={updateZona}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
