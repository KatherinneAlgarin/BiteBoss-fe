import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, DollarSign } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/cajero',          icon: LayoutDashboard },
  { title: 'Órdenes',   url: '/dashboard/cajero/ordenes',  icon: ClipboardList },
  { title: 'Caja',      url: '/dashboard/cajero/caja',     icon: DollarSign },
];

export function CajeroDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.profile) return null;

  return (
    <DashboardLayout
      user={{ name: user.profile.nombre, email: user.email, role: 'cajero' }}
      data={{ navMain }}
      onLogout={() => { void logout().then(() => navigate('/login', { replace: true })); }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user.profile.nombre}
          </h1>
          <p className="text-gray-500 mt-1">Panel de caja — BiteBoss</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Caja actual',         value: '—', icon: '🏧', color: 'bg-green-50 text-green-600' },
            { label: 'Cuentas por cobrar',  value: '—', icon: '🧾', color: 'bg-orange-50 text-orange-600' },
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
    </DashboardLayout>
  );
}
