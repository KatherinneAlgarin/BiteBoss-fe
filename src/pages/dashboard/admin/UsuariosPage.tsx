import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Loader2, AlertCircle, Users } from 'lucide-react';
import { listarUsuarios, listarRoles, listarSucursales, crearUsuario } from '../../../services/usuario.service';
import { UsuarioModal, type UsuarioModalMode } from '../../../components/usuarios/UsuarioModal';
import type { CrearUsuarioDto, RolItem, SucursalItem, UsuarioListItem } from '../../../types/usuario.types';

const ROLE_BADGE: Record<string, string> = {
  admin:    'bg-purple-100 text-purple-700',
  cajero:   'bg-green-100 text-green-700',
  mesero:   'bg-orange-100 text-orange-700',
  cocinero: 'bg-red-100 text-red-700',
};

function roleBadgeClass(rol: string): string {
  return ROLE_BADGE[rol?.toLowerCase()] ?? 'bg-gray-100 text-gray-700';
}

interface ModalState {
  open: boolean;
  mode: UsuarioModalMode;
  usuario?: UsuarioListItem;
}

const MODAL_CLOSED: ModalState = { open: false, mode: 'crear' };

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [usuariosData, rolesData, sucursalesData] = await Promise.all([
        listarUsuarios(),
        listarRoles(),
        listarSucursales(),
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
      setSucursales(sucursalesData);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function openModal(mode: UsuarioModalMode, usuario?: UsuarioListItem) {
    setModal({ open: true, mode, usuario });
    setSuccessMsg('');
  }

  function closeModal() {
    setModal(MODAL_CLOSED);
  }

  async function handleCrear(dto: CrearUsuarioDto) {
    await crearUsuario(dto);
    closeModal();
    setSuccessMsg('Usuario creado correctamente.');
    void loadData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-600">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">{loadError}</p>
        <button
          onClick={() => void loadData()}
          className="text-sm font-medium underline underline-offset-2 hover:text-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} activo{usuarios.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => openModal('crear')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium
            rounded-lg hover:bg-orange-600 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Table */}
      {usuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <Users className="w-12 h-12" />
          <p className="text-sm">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Correo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Rol</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Sucursal</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map(u => (
                  <tr key={u.id_usuario} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(u.rol)}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.sucursal}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal('ver', u)}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <UsuarioModal
          mode={modal.mode}
          roles={roles}
          sucursales={sucursales}
          usuario={modal.usuario}
          onClose={closeModal}
          onSubmit={modal.mode !== 'ver' ? handleCrear : undefined}
        />
      )}
    </div>
  );
}
