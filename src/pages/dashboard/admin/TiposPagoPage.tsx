import { useState } from 'react';
import { useTiposPago } from '../../../hooks/useTiposPago';
import { TiposPagoList } from '../../../components/tipos-pago/TiposPagoList';
import { TipoPagoForm } from '../../../components/tipos-pago/TipoPagoForm';
import type { TipoPagoItem } from '../../../types/tipo-pago.types';

type ModalMode = 'create' | 'edit' | null;

export function TiposPagoPage() {
  const {
    tipos,
    loading,
    error,
    refetch,
    createTipoPago,
    updateTipoPago,
    deactivateTipoPago,
    activateTipoPago,
    fetchDependenciasDesactivacion,
  } = useTiposPago();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<TipoPagoItem | null>(null);

  const handleCreate = () => {
    setSelected(null);
    setModalMode('create');
  };

  const handleEdit = (tipo: TipoPagoItem) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Métodos de Pago Globales</h1>
        <p className="text-gray-500 mt-1">
          Gestiona el catálogo global de métodos de pago disponibles para asignar a sucursales.
        </p>
      </div>

      <TiposPagoList
        tipos={tipos}
        loading={loading}
        error={error}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onFetchDependenciasDesactivacion={fetchDependenciasDesactivacion}
        onDeactivate={deactivateTipoPago}
        onActivate={activateTipoPago}
      />

      {modalMode && (
        <TipoPagoForm
          tipo={selected ?? undefined}
          onCreate={createTipoPago}
          onUpdate={updateTipoPago}
          onSuccess={handleClose}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
