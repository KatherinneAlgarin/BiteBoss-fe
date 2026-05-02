import { useAuth } from '../../hooks/useAuth';

export function GerenteDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.profile?.full_name ?? 'Gerente'}
        </h1>
        <p className="text-gray-500 mt-1">Panel de gerencia — BiteBoss</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { label: 'Ventas del mes', value: '—', icon: '📈', color: 'bg-blue-50 text-blue-600' },
          { label: 'Personal activo', value: '—', icon: '👤', color: 'bg-green-50 text-green-600' },
          { label: 'Pedidos pendientes', value: '—', icon: '⏳', color: 'bg-orange-50 text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Reportes y gestión</h2>
        <p className="text-sm text-gray-500">
          Accede a reportes de ventas, control de personal y análisis de desempeño del restaurante.
        </p>
      </div>
    </div>
  );
}
