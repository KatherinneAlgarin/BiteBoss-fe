// pages/dashboard/cajero/POSPage.tsx
import { useState } from 'react';
import { useOrdenesPendientes } from '../../../hooks/useOrdenes';
import type { Orden } from '../../../types/orden.types';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { OrderEditModal } from '../../../components/pos/OrderEditModal';

export function POSPage() {
  const { ordenes, loading, error, refetch } = useOrdenesPendientes();
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectOrden = (orden: Orden) => {
    setSelectedOrden(orden);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrden(null);
    refetch(); // Refrescar lista después de cambios
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <AlertMessage type="error" message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Punto de Venta (POS)</h1>
        <p className="text-gray-500 mt-1">Gestiona pedidos pendientes</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Órdenes Pendientes</h2>
        {ordenes.length === 0 ? (
          <p className="text-gray-500">No hay órdenes pendientes.</p>
        ) : (
          <div className="space-y-2">
            {ordenes.map((orden) => (
              <div key={orden.id_pedido} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Orden #{orden.numero_orden}</p>
                  <p className="text-sm text-gray-500">
                    Tipo: {orden.tipo_orden ?? '—'} | Operativo: {orden.estado_operativo} | Financiero: {orden.estado_financiero} | Total: ${orden.total.toFixed(2)}
                  </p>
                </div>
                <Button onClick={() => handleSelectOrden(orden)}>Editar</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrden && (
        <OrderEditModal
          orden={selectedOrden}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}