import { useEffect, useState } from 'react';
import { useZonas } from '../../hooks/useZonas';
import { useMesas } from '../../hooks/useMesas';
import { MesasList } from './MesasList';
import { MesaForm } from './MesaForm';
import type { MesaItem } from '../../types/mesa.types';

type ModalMode = 'create' | 'edit' | null;

interface MesasTabProps {
  id_sucursal: number | null;
}

export function MesasTab({ id_sucursal }: MesasTabProps) {
  const { zonas, loading: loadingZonas } = useZonas(id_sucursal);
  const [idZona, setIdZona] = useState<number | null>(null);

  const {
    mesas,
    loading,
    error,
    refetch,
    createMesa,
    updateMesa,
    deactivateMesa,
    activateMesa,
  } = useMesas(idZona);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<MesaItem | null>(null);

  // Si cambia la sucursal o desaparece la zona seleccionada de la lista, resetear.
  useEffect(() => {
    if (idZona !== null && !zonas.some(z => z.id_zona === idZona)) {
      setIdZona(null);
    }
  }, [zonas, idZona]);

  const zonasActivas = zonas.filter(z => z.activo);

  const handleCreate = () => {
    setSelected(null);
    setModalMode('create');
  };

  const handleEdit = (mesa: MesaItem) => {
    setSelected(mesa);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelected(null);
  };

  if (id_sucursal === null) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <p className="text-gray-500">Selecciona una sucursal para gestionar sus mesas.</p>
      </div>
    );
  }

  if (!loadingZonas && zonasActivas.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <p className="text-gray-500">
          Esta sucursal no tiene zonas activas. Crea una zona en el tab "Zonas" antes de agregar mesas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
        <select
          value={idZona ?? ''}
          onChange={(e) => setIdZona(e.target.value === '' ? null : Number(e.target.value))}
          disabled={loadingZonas}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">{loadingZonas ? 'Cargando zonas...' : 'Selecciona una zona'}</option>
          {zonasActivas.map(z => (
            <option key={z.id_zona} value={z.id_zona}>{z.nombre}</option>
          ))}
        </select>
      </div>

      <MesasList
        mesas={mesas}
        loading={loading}
        error={error}
        zonaSeleccionada={idZona !== null}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeactivate={deactivateMesa}
        onActivate={activateMesa}
      />

      {modalMode && idZona !== null && (
        <MesaForm
          mesa={selected ?? undefined}
          zonaActual={idZona}
          zonasDisponibles={zonasActivas}
          onCreate={createMesa}
          onUpdate={updateMesa}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
