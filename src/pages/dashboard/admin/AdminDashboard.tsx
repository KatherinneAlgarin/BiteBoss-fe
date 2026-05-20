import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, DollarSign, UserCircle, Truck, ListOrdered, Store, LayoutGrid, Package, CreditCard, Warehouse, FlaskConical, BarChart2, ShoppingCart, Building2 } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard',      url: '/dashboard/admin',             icon: LayoutDashboard },
  { title: 'Usuarios',       url: '/dashboard/admin/usuarios',    icon: Users },
  {
    title: 'Proveedores',
    icon: Truck,
    children: [
      { title: 'Gestor Proveedor', url: '/dashboard/admin/proveedores',        icon: Building2 },
      { title: 'Órdenes de compra', url: '/dashboard/admin/pedidos-proveedor', icon: ShoppingCart },
    ],
  },
  { title: 'Tipos de Orden', url: '/dashboard/admin/tipos-orden', icon: ListOrdered },
  { title: 'Tipos de Pago',  url: '/dashboard/admin/tipos-pago',  icon: CreditCard },
  { title: 'Sucursales',     url: '/dashboard/admin/sucursales',  icon: Store },
  { title: 'Zonas y Mesas',  url: '/dashboard/admin/zonas-mesas', icon: LayoutGrid },
  {
    title: 'Almacén',
    icon: Package,
    children: [
      { title: 'Ingredientes', url: '/dashboard/admin/ingredientes', icon: FlaskConical },
      { title: 'Bodegas',      url: '/dashboard/admin/bodegas',      icon: Warehouse },
      { title: 'Inventario',   url: '/dashboard/admin/inventario',   icon: BarChart2 },
    ],
  },
  { title: 'Menú',  url: '/dashboard/admin/menu',  icon: UtensilsCrossed },
  { title: 'Caja',  url: '/dashboard/admin/caja',  icon: DollarSign },
  { title: 'Perfil', url: '/dashboard/profile',    icon: UserCircle },
];

export function AdminDashboard() {
  const { session, logout, displayName, role } = useAuth();

  if (!session || !role) return null;

  return (
    <DashboardLayout
      user={{ name: displayName, email: session.user.email ?? '', role }}
      data={{ navMain }}
      onLogout={logout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
