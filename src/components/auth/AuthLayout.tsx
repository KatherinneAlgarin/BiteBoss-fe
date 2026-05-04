import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-5xl">🍽️</span>
            <h1 className="text-4xl font-bold tracking-tight">BiteBoss</h1>
          </div>
          <p className="text-xl font-light text-orange-100">
            Sistema de gestión de restaurante
          </p>
          <p className="text-orange-200 text-sm leading-relaxed">
            Administra tu restaurante de forma eficiente. Control de mesas, pedidos, caja y mucho más desde un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <span className="text-3xl">🍽️</span>
          <span className="text-2xl font-bold text-orange-500">BiteBoss</span>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} BiteBoss. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
