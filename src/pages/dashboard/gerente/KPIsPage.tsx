import { useEffect } from 'react';
import { BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { useKPIs } from '../../../hooks/useKPIs';
import { useAuth } from '../../../hooks/useAuth';
import { DateRangePicker } from '../../../components/kpis/DateRangePicker';
import { ResumenCards } from '../../../components/kpis/ResumenCards';
import { TendenciaChart } from '../../../components/kpis/TendenciaChart';
import { MetodoPagoChart } from '../../../components/kpis/MetodoPagoChart';
import { TipoOrdenChart } from '../../../components/kpis/TipoOrdenChart';
import { TopProductosTable } from '../../../components/kpis/TopProductosTable';

export function KPIsPage() {
  const { id_sucursal } = useAuth();

  const {
    ventasData,
    loadingVentas,
    error,
    dateRange,
    setDateRange,
    fetchVentas,
  } = useKPIs();

  useEffect(() => {
    if (id_sucursal) {
      fetchVentas(dateRange, id_sucursal);
    }
  }, [dateRange, id_sucursal, fetchVentas]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <BarChart2 className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">KPIs de Ventas</h1>
            <p className="text-sm text-gray-500">Ventas de tu sucursal</p>
          </div>
        </div>
      </div>

      {/* Date filter */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Initial loading */}
      {loadingVentas && !ventasData && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Content */}
      {ventasData && (
        <div className={`space-y-4 ${loadingVentas ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}>
          <ResumenCards data={ventasData.resumen} />
          <TendenciaChart data={ventasData.tendencia} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetodoPagoChart data={ventasData.por_metodo_pago} />
            <TipoOrdenChart data={ventasData.por_tipo_orden} />
          </div>
          <TopProductosTable data={ventasData.top_productos} />
        </div>
      )}
    </div>
  );
}
