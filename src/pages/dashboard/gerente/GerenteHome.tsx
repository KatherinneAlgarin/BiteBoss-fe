import { useAuth } from '../../../hooks/useAuth';

export function GerenteHome() {
  const { displayName } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {displayName ?? 'Gerente'}
        </h1>
        <p className="text-gray-500 mt-1">Panel de gerencia — BiteBoss</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pedidos pendientes',   value: '—', icon: '⏳', color: 'bg-orange-50 text-orange-600' },
          { label: 'En preparación',       value: '—', icon: '🍳', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Listos para entregar', value: '—', icon: '✅', color: 'bg-green-50 text-green-600' },
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
