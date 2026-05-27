import { useEffect, useState } from 'react';
import { BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { useKPIs } from '../../../hooks/useKPIs';
import { listarSucursales } from '../../../services/sucursal.service';
import type { SucursalItem } from '../../../types/sucursal.types';
import { DateRangePicker } from '../../../components/kpis/DateRangePicker';
import { ResumenCards } from '../../../components/kpis/ResumenCards';
import { TendenciaChart } from '../../../components/kpis/TendenciaChart';
import { MetodoPagoChart } from '../../../components/kpis/MetodoPagoChart';
import { TipoOrdenChart } from '../../../components/kpis/TipoOrdenChart';
import { TopProductosTable } from '../../../components/kpis/TopProductosTable';
import { ComparativaSucursales } from '../../../components/kpis/ComparativaSucursales';

export function KPIsPage() {
  const {
    ventasData,
    comparativaData,
    loadingVentas,
    loadingComparativa,
    error,
    dateRange,
    setDateRange,
    sucursalFiltro,
    setSucursalFiltro,
    fetchVentas,
    fetchComparativa,
  } = useKPIs();

  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);

  // Load active sucursales for selector
  useEffect(() => {
    listarSucursales(true).then(setSucursales).catch(console.error);
  }, []);

  // Fetch data when range or sucursal filter changes
  useEffect(() => {
    if (sucursalFiltro === null) {
      // Global view: fetch both resumen global and comparativa
      fetchVentas(dateRange, undefined);
      fetchComparativa(dateRange);
    } else {
      // Specific sucursal: only ventas filtered
      fetchVentas(dateRange, sucursalFiltro);
    }
  }, [dateRange, sucursalFiltro, fetchVentas, fetchComparativa]);

  function handleSelectSucursal(id: number) {
    setSucursalFiltro(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isGlobal = sucursalFiltro === null;
  const selectedSucursal = sucursales.find(s => s.id_sucursal === sucursalFiltro);
  const isLoading = loadingVentas || (isGlobal && loadingComparativa);

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
            <p className="text-sm text-gray-500">
              {isGlobal ? 'Vista global — todas las sucursales' : `Sucursal: ${selectedSucursal?.nombre ?? '…'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <DateRangePicker value={dateRange} onChange={setDateRange} />

        <div className="flex items-center gap-2">
          <select
            value={sucursalFiltro ?? ''}
            onChange={e => setSucursalFiltro(e.target.value === '' ? null : Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">Global (todas)</option>
            {sucursales.map(s => (
              <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>
            ))}
          </select>

          {!isGlobal && (
            <button
              onClick={() => setSucursalFiltro(null)}
              className="px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Global
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading overlay for initial load */}
      {isLoading && !ventasData && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Resumen cards */}
      {ventasData && (
        <div className={isLoading ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
          <ResumenCards data={ventasData.resumen} />
        </div>
      )}

      {/* Global view: comparativa grid */}
      {isGlobal && (
        <div className={isLoading ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
          {loadingComparativa && comparativaData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : (
            <ComparativaSucursales
              data={comparativaData}
              onSelectSucursal={handleSelectSucursal}
            />
          )}
        </div>
      )}

      {/* Specific sucursal view: charts */}
      {!isGlobal && ventasData && (
        <div className={`space-y-4 ${isLoading ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}>
          {/* Tendencia full width */}
          <TendenciaChart data={ventasData.tendencia} />

          {/* Método pago + Tipo orden side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetodoPagoChart data={ventasData.por_metodo_pago} />
            <TipoOrdenChart data={ventasData.por_tipo_orden} />
          </div>

          {/* Top productos */}
          <TopProductosTable data={ventasData.top_productos} />
        </div>
      )}
    </div>
  );
}
