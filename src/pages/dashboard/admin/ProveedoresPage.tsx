import { useState } from 'react';
import { ProveedoresList } from '../../../components/proveedores/ProveedoresList';
import { ProveedorForm } from '../../../components/proveedores/ProveedorForm';
import type { ProveedorListItem } from '../../../types/proveedor.types';

type ModalMode = 'create' | 'edit' | null;

export function ProveedoresPage() {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<ProveedorListItem | null>(null);

  const handleCreate = () => {
    setSelectedProveedor(null);
    setModalMode('create');
  };

  const handleEdit = (proveedor: ProveedorListItem) => {
    setSelectedProveedor(proveedor);
    setModalMode('edit');
  };

  const handleSuccess = () => {
    setModalMode(null);
    setSelectedProveedor(null);
  };

  const handleCancel = () => {
    setModalMode(null);
    setSelectedProveedor(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <p className="text-gray-500 mt-1">Gestiona los proveedores de tu restaurante</p>
      </div>

      <ProveedoresList onCreate={handleCreate} onEdit={handleEdit} />

      {modalMode && (
        <ProveedorForm
          proveedor={selectedProveedor || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}