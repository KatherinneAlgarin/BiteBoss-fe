import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Power, PowerOff, Loader2, AlertCircle, MoreVertical, Store } from 'lucide-react';
import type { CategoriaItem, ProductosActivosCategoria } from '../../types/categoria.types';
import { ModalShell } from '../ui/ModalShell';

interface CategoriasListProps {
  categorias: CategoriaItem[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
  onCreate: () => void;
  onEdit: (categoria: CategoriaItem) => void;
  onFetchProductosActivos: (id: number) => Promise<ProductosActivosCategoria>;
  onDeactivate: (id: number) => Promise<void>;
  onActivate: (id: number) => Promise<void>;
}

interface MenuPos { top: number; left: number }

function ActionMenu({
  categoria,
  onEdit,
  onDesactivar,
  onActivar,
  loadingId,
}: {
  categoria: CategoriaItem;
  onEdit: () => void;
  onDesactivar: () => void;
  onActivar: () => void;
  loadingId: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!btnRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.right - 176 });
    setOpen(o => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loadingId}
        className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 transition-colors"
      >
        {loadingId
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MoreVertical className="w-4 h-4" />}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 176 }}
          className="bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden"
        >
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <Edit className="w-4 h-4 flex-shrink-0" />
            Editar
          </button>

          <div className="border-t border-gray-100 mx-2" />

          {categoria.activo ? (
            <button
              onClick={() => { setOpen(false); onDesactivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <Power className="w-4 h-4 flex-shrink-0" />
              Desactivar
            </button>
          ) : (
            <button
              onClick={() => { setOpen(false); onActivar(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors"
            >
              <PowerOff className="w-4 h-4 flex-shrink-0" />
              Activar
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export function CategoriasList({
  categorias,
  loading,
  error,
  onRefetch,
  onCreate,
  onEdit,
  onFetchProductosActivos,
  onDeactivate,
  onActivate,
}: CategoriasListProps) {
  const [confirming, setConfirming] = useState<CategoriaItem | null>(null);
  const [productosActivos, setProductosActivos] = useState<ProductosActivosCategoria | null>(null);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  const handleOpenConfirm = async (categoria: CategoriaItem) => {
    try {
      setConfirmError(null);
      setProductosActivos(null);
      setLoadingProductos(true);
      const result = await onFetchProductosActivos(categoria.id_categoria);
      setProductosActivos(result);
      setConfirming(categoria);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingProductos(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirming) return;
    try {
      setBusyId(confirming.id_categoria);
      setConfirmError(null);
      await onDeactivate(confirming.id_categoria);
      setConfirming(null);
      setProductosActivos(null);
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (categoria: CategoriaItem) => {
    try {
      setActivateError(null);
      setActivatingId(categoria.id_categoria);
      await onActivate(categoria.id_categoria);
    } catch (err) {
      setActivateError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-700">Error al cargar categorías: {error}</span>
        </div>
        <button onClick={onRefetch} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {activateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{activateError}</span>
          <button onClick={() => setActivateError(null)} className="ml-4 text-red-700 hover:text-red-900">×</button>
        </div>
      )}

      {confirmError && !confirming && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center justify-between mb-4">
          <span>{confirmError}</span>
          <button onClick={() => setConfirmError(null)} className="ml-4 text-red-700 hover:text-red-900">×</button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Categorías</h2>
          <button
            onClick={onCreate}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </button>
        </div>

        {loadingProductos && (
          <div className="px-6 py-3 text-sm text-gray-500 border-b border-gray-100 flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verificando productos asociados...
          </div>
        )}

        {categorias.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No hay categorías registradas</p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categorias.map((cat) => (
              <div
                key={cat.id_categoria}
                className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${
                  cat.activo ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-base font-semibold leading-snug ${cat.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                    {cat.nombre}
                  </span>
                  <ActionMenu
                    categoria={cat}
                    onEdit={() => onEdit(cat)}
                    onDesactivar={() => handleOpenConfirm(cat)}
                    onActivar={() => handleActivate(cat)}
                    loadingId={busyId === cat.id_categoria || activatingId === cat.id_categoria}
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Store className="w-3 h-3" />
                    {cat.cantidad_sucursales} sucursal{cat.cantidad_sucursales !== 1 ? 'es' : ''}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cat.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {cat.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirming && (
        <ModalShell
          title="Desactivar categoría"
          onClose={() => { setConfirming(null); setConfirmError(null); setProductosActivos(null); }}
          maxWidthClass="max-w-lg"
        >
          <div className="px-6 py-5">
            <p className="text-sm text-gray-700">
              Vas a desactivar <span className="font-semibold">"{confirming.nombre}"</span>.
            </p>

            {productosActivos && productosActivos.cantidad > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm">
                Esta categoría tiene <span className="font-semibold">{productosActivos.cantidad}</span> producto(s) activo(s).
                Al desactivarla dejarán de aparecer agrupados en el POS.
              </div>
            )}

            {productosActivos && productosActivos.cantidad === 0 && (
              <div className="mt-4 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-md text-sm">
                No hay productos activos en esta categoría.
              </div>
            )}

            {confirmError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {confirmError}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => { setConfirming(null); setConfirmError(null); setProductosActivos(null); }}
                disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busyId !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50 inline-flex items-center"
              >
                {busyId !== null && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar desactivación
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}
