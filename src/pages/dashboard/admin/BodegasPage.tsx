import { useMemo, useState } from 'react';
import { useBodegas } from '../../../hooks/useBodegas';
import { useSucursales } from '../../../hooks/useSucursales';
import { useAuth } from '../../../hooks/useAuth';
import { BodegasList } from '../../../components/bodegas/BodegasList';
import { BodegaForm } from '../../../components/bodegas/BodegaForm';
import { FilterPanel } from '../../../components/ui/FilterPanel';
import { SucursalSelect } from '../../../components/ui/SucursalSelect';
import type { BodegaItem } from '../../../types/bodega.types';

export function BodegasAdminPage() {
  const { role, id_sucursal: sucursalUsuario } = useAuth();
  const isAdmin = role === 'admin';

  const [sucursalFiltro, setSucursalFiltro] = useState<number | null>(
    isAdmin ? null : (sucursalUsuario ?? null)
  );
  const [busqueda, setBusqueda] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedBodega, setSelectedBodega] = useState<BodegaItem | undefined>(undefined);

  const { bodegas, loading, error, refetch, createBodega, updateBodega, deactivateBodega, activateBodega, checkStock } =
    useBodegas(sucursalFiltro ?? undefined);
  const { sucursales, loading: loadingSucursales } = useSucursales();

  const bodegasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return bodegas;

    return bodegas.filter(bodega => {
      const estado = bodega.activo ? 'activa' : 'inactiva';
      const tipo = bodega.tipo.toLowerCase();
      const sucursal = (bodega.sucursal ?? '').toLowerCase();
      const descripcion = (bodega.descripcion ?? '').toLowerCase();

      return (
        bodega.nombre.toLowerCase().includes(termino) ||
        tipo.includes(termino) ||
        sucursal.includes(termino) ||
        descripcion.includes(termino) ||
        estado.includes(termino)
      );
    });
  }, [bodegas, busqueda]);

  const handleCreate = () => {
    setSelectedBodega(undefined);
    setModalMode('create');
  };

  const handleEdit = (bodega: BodegaItem) => {
    setSelectedBodega(bodega);
    setModalMode('edit');
  };

  const handleClose = () => {
    setModalMode(null);
    setSelectedBodega(undefined);
  };

  const handleSuccess = () => {
    handleClose();
    refetch();
  };

  const handleSucursalChange = (id: number | null) => {
    setSucursalFiltro(id);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Bodegas</h1>
        <p className="text-gray-500 text-sm mt-1">Administra las bodegas de las sucursales</p>
      </div>

      <FilterPanel title="Buscar bodegas" description="Filtra por nombre, tipo, descripción, sucursal o estado.">
        <input
          id="busqueda-bodegas"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, tipo, descripción, sucursal o estado"
          className="input-field"
        />
      </FilterPanel>

      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-4">
          <SucursalSelect
            sucursales={sucursales}
            value={sucursalFiltro}
            onChange={handleSucursalChange}
            loading={loadingSucursales}
            label="Filtrar por sucursal"
            placeholder="Todas las sucursales"
            soloActivas={false}
            className="max-w-xs"
          />
        </div>
      )}

      <BodegasList
        bodegas={bodegasFiltradas}
        loading={loading}
        error={error}
        onRefetch={refetch}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeactivate={deactivateBodega}
        onActivate={activateBodega}
        onCheckStock={checkStock}
      />

      {modalMode && (
        <BodegaForm
          bodega={selectedBodega}
          isAdmin={isAdmin}
          sucursalIdUsuario={sucursalUsuario ?? undefined}
          sucursales={sucursales}
          loadingSucursales={loadingSucursales}
          onCreate={createBodega}
          onUpdate={updateBodega}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}
