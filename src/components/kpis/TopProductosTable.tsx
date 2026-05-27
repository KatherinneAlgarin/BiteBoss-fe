import type { KpiProducto } from '../../types/kpi.types';

interface TopProductosTableProps {
  data: KpiProducto[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

export function TopProductosTable({ data }: TopProductosTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Productos</h3>
      {data.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
          Sin datos para el período seleccionado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Categoría</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Cant.</th>
                <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((producto, i) => (
                <tr key={producto.id_producto} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-2 font-medium text-gray-500">
                    {MEDAL[i] ?? <span className="text-gray-400">{i + 1}</span>}
                  </td>
                  <td className="py-2.5 font-medium text-gray-900">{producto.nombre}</td>
                  <td className="py-2.5 hidden sm:table-cell">
                    <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-gray-700 font-medium">{producto.cantidad.toLocaleString('es-SV')}</td>
                  <td className="py-2.5 text-right text-gray-900 font-semibold">{formatCurrency(producto.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
