import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { KpiTipoOrden } from '../../types/kpi.types';

interface TipoOrdenChartProps {
  data: KpiTipoOrden[];
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: KpiTipoOrden = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-800">{d.nombre}</p>
      <p className="text-gray-600">Total: <span className="font-medium text-gray-900">{formatCurrency(d.total)}</span></p>
      <p className="text-gray-600">Pedidos: <span className="font-medium text-gray-900">{d.cantidad}</span></p>
      <p className="text-gray-600">Participación: <span className="font-medium text-orange-600">{d.porcentaje.toFixed(1)}%</span></p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, porcentaje }: any) {
  if (porcentaje < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${porcentaje.toFixed(0)}%`}
    </text>
  );
}

export function TipoOrdenChart({ data }: TipoOrdenChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Ventas por Tipo de Orden</h3>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          Sin datos para el período seleccionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
