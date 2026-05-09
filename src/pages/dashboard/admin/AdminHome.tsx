import { useAuth } from '../../../hooks/useAuth';

export function AdminHome() {
  const { displayName } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {displayName ?? 'Administrador'}
        </h1>
        <p className="text-gray-500 mt-1">Panel de administración — BiteBoss</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios',      value: '—', color: 'bg-purple-50 text-purple-600' },
          { label: 'Ventas hoy',    value: '—', color: 'bg-green-50 text-green-600' },
          { label: 'Mesas activas', value: '—', color: 'bg-orange-50 text-orange-600' },
          { label: 'Pedidos',       value: '—', color: 'bg-blue-50 text-blue-600' },
        ].map(stat => (
          <div key={stat.label} className="card flex items-center gap-4">
            
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
