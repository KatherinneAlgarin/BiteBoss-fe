import { useEffect, useMemo, useState } from 'react';
import { ModalShell } from '../ui/ModalShell';
import { Button } from '../ui/Button';
import { AlertMessage } from '../ui/AlertMessage';
import { obtenerResumenCajaActual, solicitarCierreCaja } from '../../services/caja-cierre.service';
import type { CajaResumen } from '../../types/caja-cierre.types';

interface CajaCierreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CajaCierreModal({ isOpen, onClose, onSuccess }: CajaCierreModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumen, setResumen] = useState<CajaResumen | null>(null);
  const [codigoEmpleado, setCodigoEmpleado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [montoDeclarado, setMontoDeclarado] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerResumenCajaActual();
        if (!mounted) return;
        setResumen(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el resumen de caja');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const totalCalculado = useMemo(() => Number(resumen?.total_monto ?? 0), [resumen]);

  const handleMontoDeclaradoChange = (raw: string) => {
    const soloNumerico = raw
      .replace(',', '.')
      .replace(/[^0-9.]/g, '');

    const [entero, ...decimales] = soloNumerico.split('.');
    const normalizado = decimales.length > 0
      ? `${entero}.${decimales.join('')}`
      : entero;

    setMontoDeclarado(normalizado);
  };

  if (!isOpen) return null;

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (!codigoEmpleado.trim()) {
        setError('El código de empleado es requerido para cerrar caja.');
        setSubmitting(false);
        return;
      }

      if (!montoDeclarado.trim()) {
        setError('El monto contado en caja es requerido.');
        setSubmitting(false);
        return;
      }

      const monto = Number(montoDeclarado);
      if (!Number.isFinite(monto) || monto < 0) {
        setError('El monto contado en caja debe ser un número válido.');
        setSubmitting(false);
        return;
      }

      await solicitarCierreCaja({
        codigo_empleado: codigoEmpleado.trim(),
        observacion: observacion.trim() || undefined,
        monto_declarado: monto,
      });
      onSuccess('Cierre de caja enviado para revisión.');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo solicitar el cierre de caja');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Cierre de caja" onClose={onClose} maxWidthClass="max-w-4xl" panelClassName="max-h-[90vh] overflow-hidden">
      <div className="max-h-[calc(90vh-73px)] overflow-y-auto px-6 py-5 space-y-4">
        {error && <AlertMessage type="error" message={error} />}

        {loading ? (
          <p className="text-sm text-gray-500">Cargando resumen de caja...</p>
        ) : resumen ? (
          <>
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
              Apertura: {new Date(resumen.fecha_apertura).toLocaleString('es-ES')} · Transacciones: {resumen.total_transacciones} · Total: ${totalCalculado.toFixed(2)}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Ventas por método</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  {resumen.por_metodo.map(item => (
                    <p key={item.metodo}>{item.metodo}: ${item.total.toFixed(2)} ({item.cantidad})</p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">Productos vendidos</h3>
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-gray-700">
                  {resumen.productos.slice(0, 12).map(item => (
                    <p key={item.id_producto}>{item.cantidad_total}x {item.nombre_producto} · ${item.total_vendido.toFixed(2)}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Transacciones</h3>
              <div className="mt-2 max-h-40 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-1 pr-3">Pedido</th>
                      <th className="py-1 pr-3">Método</th>
                      <th className="py-1 pr-3">Monto</th>
                      <th className="py-1">Propina</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.transacciones.map(tx => (
                      <tr key={tx.id_pago_pedido} className="border-t border-gray-100 text-gray-700">
                        <td className="py-1 pr-3">#{tx.id_pedido}</td>
                        <td className="py-1 pr-3">{tx.metodo}</td>
                        <td className="py-1 pr-3">${tx.monto.toFixed(2)}</td>
                        <td className="py-1">${tx.propina.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Código de empleado</label>
                <input
                  value={codigoEmpleado}
                  onChange={e => setCodigoEmpleado(e.target.value)}
                  placeholder="Requerido"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Monto contado en caja *</label>
                <input
                  value={montoDeclarado}
                  onChange={e => handleMontoDeclaradoChange(e.target.value)}
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.00"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Observación del cajero</label>
                <input
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          </>
        ) : null}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button type="button" fullWidth onClick={() => void submit()} isLoading={submitting} disabled={loading || !resumen}>Enviar cierre</Button>
        </div>
      </div>
    </ModalShell>
  );
}
