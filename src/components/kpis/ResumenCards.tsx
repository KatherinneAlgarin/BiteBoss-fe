import { DollarSign, ShoppingBag } from 'lucide-react';
import type { KpiResumen } from '../../types/kpi.types';

interface ResumenCardsProps {
  data: KpiResumen;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function ResumenCards({ data }: ResumenCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Total Ventas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-orange-100">
          <DollarSign className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Ventas</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCurrency(data.total_ventas)}</p>
        </div>
      </div>

      {/* Nº Pedidos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-100">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Pedidos</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{data.total_pedidos.toLocaleString('es-SV')}</p>
        </div>
      </div>
    </div>
  );
}
