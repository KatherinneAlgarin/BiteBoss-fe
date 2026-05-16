import { useState, useCallback, useEffect } from 'react';
import { UserPlus, Loader2, AlertCircle, Users } from 'lucide-react';
import { useUsuarios, type UsuariosFilters } from '../../../hooks/useUsuarios';
import { listarSucursales } from '../../../services/sucursal.service';
import { UsuarioModal } from '../../../components/usuarios/UsuarioModal';
import { UsuariosList } from '../../../components/usuarios/UsuariosList';
import type { CrearUsuarioDto, ActualizarUsuarioDto, UsuarioListItem } from '../../../types/usuario.types';
import type { SucursalItem } from '../../../types/sucursal.types';
import { useHasRole } from '../../../hooks/useAuth';

interface ModalState {
  open: boolean;
  mode: 'crear' | 'editar';
  usuario?: UsuarioListItem;
}

const MODAL_CLOSED: ModalState = { open: false, mode: 'crear' };

export function UsuariosPage() {
  const esAdmin = useHasRole('admin');
  const [filters, setFilters] = useState<UsuariosFilters>({});
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);

  const { usuarios, roles, loading, error, refetch, crearNuevoUsuario, actualizarPermisosUsuario } =
    useUsuarios(filters);

  // Load sucursales on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await listarSucursales();
        setSucursales(data);
      } catch (err) {
        console.error('Error al cargar sucursales:', err);
      } finally {
        setLoadingSucursales(false);
      }
    })();
  }, []);

  function openCrearModal() {
    setModal({ open: true, mode: 'crear' });
    setSuccessMsg('');
  }

  function openEditarModal(usuario: UsuarioListItem) {
    setModal({ open: true, mode: 'editar', usuario });
    setSuccessMsg('');
  }

  function closeModal() {
    setModal(MODAL_CLOSED);
  }

  async function handleCrearUsuario(dto: CrearUsuarioDto) {
    await crearNuevoUsuario(dto);
    closeModal();
    setSuccessMsg('Usuario creado correctamente.');
  }

  async function handleActualizarUsuario(id_usuario: number, dto: ActualizarUsuarioDto) {
    await actualizarPermisosUsuario(id_usuario, dto);
    closeModal();
    setSuccessMsg('Permisos del usuario actualizados exitosamente');
  }

  const handleSearch = useCallback((search: string, idRol?: number, idSucursal?: number) => {
    setFilters({
      search: search || undefined,
      id_rol: idRol,
      id_sucursal: idSucursal,
    });
  }, []);

  if (!esAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-600">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">No tienes permiso para acceder a esta página</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los usuarios y sus permisos</p>
        </div>
        <button
          onClick={openCrearModal}
          disabled={loading || loadingSucursales}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium
            rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center justify-between">
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-green-700 hover:text-green-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Users List */}
      {loadingSucursales ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Cargando datos...</span>
        </div>
      ) : (
        <UsuariosList
          usuarios={usuarios}
          roles={roles}
          sucursales={sucursales}
          loading={loading}
          error={error}
          onEdit={openEditarModal}
          onSearch={handleSearch}
          onRefetch={refetch}
        />
      )}

      {/* Modal */}
      {modal.open && modal.mode === 'crear' && (
        <UsuarioModal
          mode="crear"
          roles={roles}
          sucursales={sucursales}
          onClose={closeModal}
          onSubmit={handleCrearUsuario}
        />
      )}

      {modal.open && modal.mode === 'editar' && modal.usuario && (
        <UsuarioModal
          mode="editar"
          roles={roles}
          sucursales={sucursales}
          usuario={modal.usuario}
          onClose={closeModal}
          onSubmit={handleActualizarUsuario}
        />
      )}
    </div>
  );
}
