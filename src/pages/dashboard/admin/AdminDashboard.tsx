import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, DollarSign, UserCircle, Truck, ListOrdered, Store, LayoutGrid, Package, CreditCard } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard',   url: '/dashboard/admin',             icon: LayoutDashboard },
  { title: 'Usuarios',    url: '/dashboard/admin/usuarios',    icon: Users },
  { title: 'Proveedores', url: '/dashboard/admin/proveedores', icon: Truck },
  { title: 'Tipos de Orden', url: '/dashboard/admin/tipos-orden', icon: ListOrdered },
  { title: 'Tipos de Pago', url: '/dashboard/admin/tipos-pago', icon: CreditCard },
  { title: 'Sucursales',  url: '/dashboard/admin/sucursales',  icon: Store },
  { title: 'Zonas y Mesas', url: '/dashboard/admin/zonas-mesas', icon: LayoutGrid },
  { title: 'Inventario',  url: '/dashboard/admin/inventario',  icon: Package },
  { title: 'Menú',        url: '/dashboard/admin/menu',        icon: UtensilsCrossed },
  { title: 'Caja',        url: '/dashboard/admin/caja',        icon: DollarSign },
  { title: 'Perfil',      url: '/dashboard/profile',           icon: UserCircle },
];

export function AdminDashboard() {
  const { session, logout, displayName } = useAuth();

  if (!session) return null;

  return (
    <DashboardLayout
      user={{ name: displayName, email: session.user.email ?? '', role: 'admin' }}
      data={{ navMain }}
      onLogout={logout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
