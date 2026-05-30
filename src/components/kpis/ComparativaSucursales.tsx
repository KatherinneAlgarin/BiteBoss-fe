import { TrendingUp, ShoppingBag, DollarSign, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { KpiSucursalResumen } from '../../types/kpi.types';

interface ComparativaSucursalesProps {
  data: KpiSucursalResumen[];
  onSelectSucursal: (id: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

function esTendenciaPorHora(tendencia: KpiSucursalResumen['tendencia']): boolean {
  return tendencia.some(item => Boolean(item.hora));
}

interface SucursalCardProps {
  sucursal: KpiSucursalResumen;
  onSelect: () => void;
}

function SucursalCard({ sucursal, onSelect }: SucursalCardProps) {
  const { resumen, top_producto, metodo_predominante, tendencia } = sucursal;
  const tendenciaPorHora = esTendenciaPorHora(tendencia);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all group"
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{sucursal.nombre}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{resumen.total_pedidos} pedidos</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors mt-1" />
      </div>

      {/* Total ventas */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-orange-50">
          <DollarSign className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Ventas</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(resumen.total_ventas)}</p>
        </div>
      </div>

      {/* Mini tendencia */}
      {tendencia.length > 1 && (
        <div className="mb-3 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tendencia}>
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), 'Ventas']}
                contentStyle={{ fontSize: 10, borderRadius: 6 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer info */}
      <div className="space-y-1.5 pt-3 border-t border-gray-50">
        {top_producto && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <ShoppingBag className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              Top: <span className="font-medium text-gray-800">{top_producto.nombre}</span>
              <span className="text-gray-400"> ({top_producto.cantidad})</span>
            </span>
          </div>
        )}
        {metodo_predominante && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <TrendingUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="truncate">
              Pago: <span className="font-medium text-gray-800">{metodo_predominante.nombre}</span>
              <span className="text-gray-400"> ({metodo_predominante.porcentaje.toFixed(0)}%)</span>
            </span>
          </div>
        )}
        {!top_producto && !metodo_predominante && (
          <p className="text-xs text-gray-400 italic">Sin ventas en el período</p>
        )}
      </div>

      {/* Trend indicator */}
      {!tendenciaPorHora && tendencia.length >= 2 && (() => {
        const last = tendencia[tendencia.length - 1].total;
        const prev = tendencia[tendencia.length - 2].total;
        const diff = last - prev;
        if (diff === 0) return null;
        return (
          <div className={`mt-2 text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {diff > 0 ? '▲' : '▼'} {formatCurrency(Math.abs(diff))} vs día anterior
          </div>
        );
      })()}
    </div>
  );
}

export function ComparativaSucursales({ data, onSelectSucursal }: ComparativaSucursalesProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400 text-sm">
        No hay sucursales activas para comparar
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Haz clic en una sucursal para ver el desglose completo
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map(sucursal => (
          <SucursalCard
            key={sucursal.id_sucursal}
            sucursal={sucursal}
            onSelect={() => onSelectSucursal(sucursal.id_sucursal)}
          />
        ))}
      </div>
    </div>
  );
}
