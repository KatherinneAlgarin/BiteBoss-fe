import { useState } from 'react';
import { ProveedoresList } from '../../../components/proveedores/ProveedoresList';
import { ProveedorForm } from '../../../components/proveedores/ProveedorForm';
import type { ProveedorListItem } from '../../../types/proveedor.types';

type ModalMode = 'create' | 'edit' | null;

export function ProveedoresPage() {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<ProveedorListItem | null>(null);
  const [listVersion, setListVersion] = useState(0);

  const handleCreate = () => {
    setSelectedProveedor(null);
    setModalMode('create');
  };

  const handleEdit = (proveedor: ProveedorListItem) => {
    setSelectedProveedor(proveedor);
    setModalMode('edit');
  };

  const handleSuccess = () => {
    if (modalMode === 'create') {
      setListVersion((prev) => prev + 1);
    }
    setModalMode(null);
    setSelectedProveedor(null);
  };

  const handleCancel = () => {
    setModalMode(null);
    setSelectedProveedor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 mt-1">Gestiona los proveedores de tu restaurante</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Nuevo Proveedor
        </button>
      </div>

      <ProveedoresList key={listVersion} onCreate={handleCreate} onEdit={handleEdit} />

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