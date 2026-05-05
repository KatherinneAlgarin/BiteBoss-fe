import { useAuth } from '../../../hooks/useAuth';

export function MeseroHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.profile?.nombre ?? 'Mesero'}
        </h1>
        <p className="text-gray-500 mt-1">Panel de servicio — BiteBoss</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Mis mesas',          value: '—', icon: '🍽️', color: 'bg-orange-50 text-orange-600' },
          { label: 'Pedidos activos',    value: '—', icon: '📋', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pedidos entregados', value: '—', icon: '✅', color: 'bg-green-50 text-green-600' },
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
    </div>
  );
}
