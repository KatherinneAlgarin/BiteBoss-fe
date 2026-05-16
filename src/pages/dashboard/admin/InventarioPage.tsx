import { useEffect, useMemo, useState } from 'react';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { getInventarioStockActual } from '../../../services/inventario.service';
import type { InventarioStockItem } from '../../../types/inventario.types';

export function InventarioPage() {
  const [items, setItems] = useState<InventarioStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventario = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getInventarioStockActual();
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar inventario');
      } finally {
        setLoading(false);
      }
    };

    loadInventario();
  }, []);

  const totalAlertas = useMemo(
    () => items.filter(item => item.en_alerta).length,
    [items]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75 text-orange-500">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Estado actual del stock de productos activos.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="font-medium text-gray-700">Alertas:</span>
          <span className={`font-semibold ${totalAlertas > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {totalAlertas}
          </span>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {!error && items.length === 0 && (
        <AlertMessage
          type="info"
          message="No hay productos activos en inventario para esta sucursal."
        />
      )}

      {!error && items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Producto</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock actual</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Unidad</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock minimo</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr
                  key={item.id_producto}
                  className={`border-t ${item.en_alerta ? 'bg-red-50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{item.nombre_producto}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${item.en_alerta ? 'text-red-700' : 'text-gray-900'}`}>
                    {item.stock_actual}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.unidad_medida}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.stock_minimo}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.en_alerta
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.en_alerta ? 'Bajo minimo' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
