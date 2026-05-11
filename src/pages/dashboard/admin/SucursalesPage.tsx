import { useState } from 'react';
import { useSucursales } from '../../../hooks/useSucursales';
import { useTiposOrden } from '../../../hooks/useTiposOrden';
import { useTiposPago } from '../../../hooks/useTiposPago';
import { SucursalesList } from '../../../components/sucursales/SucursalesList';
import { SucursalForm } from '../../../components/sucursales/SucursalForm';
import type { SucursalItem } from '../../../types/sucursal.types';

type ModalMode = 'create' | 'edit' | null;

export function SucursalesPage() {
  const {
    sucursales,
    loading,
    error,
    refetch,
    createSucursal,
    updateSucursal,
    deactivateSucursal,
    activateSucursal,
    fetchDependencias,
  } = useSucursales();

  const { tipos: tiposOrden, loading: loadingTiposOrden } = useTiposOrden();
  const { tipos: tiposPago, loading: loadingTiposPago } = useTiposPago();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<SucursalItem | null>(null);

  const handleCreate = () => {
    setSelected(null);
    setModalMode('create');
  };

  const handleEdit = (sucursal: SucursalItem) => {
    setSelected(sucursal);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelected(null);
  };

  const loadingCatalogos = loadingTiposOrden || loadingTiposPago;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sucursales</h1>
        <p className="text-gray-500 mt-1">
          Crea y configura las sucursales del restaurante. Vincula tipos de orden y métodos de pago a cada una.
        </p>
      </div>

      <SucursalesList
        sucursales={sucursales}
        loading={loading}
        error={error}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeactivate={deactivateSucursal}
        onActivate={activateSucursal}
        onFetchDependencias={fetchDependencias}
      />

      {modalMode && (
        <SucursalForm
          sucursal={selected ?? undefined}
          tiposOrden={tiposOrden}
          tiposPago={tiposPago}
          loadingCatalogos={loadingCatalogos}
          onCreate={createSucursal}
          onUpdate={updateSucursal}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
