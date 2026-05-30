import { useEffect, useMemo, useState } from 'react';
import { MonitorPlay, ReceiptText, Sparkles, ArrowUpRight, Store } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/Button';
import { ModalShell } from '../../../components/ui/ModalShell';
import { listarSucursales } from '../../../services/sucursal.service';
import { iniciarSesionCaja, obtenerSesionCajaActiva } from '../../../services/caja-cierre.service';
import type { SucursalItem } from '../../../types/sucursal.types';

function openWindow(path: string, name: string, idSucursal?: number | null) {
  const suffix = idSucursal ? `?id_sucursal=${idSucursal}` : '';
  window.open(`${window.location.origin}${path}${suffix}`, name, 'noopener,noreferrer');
}

export function CajaHubPage() {
  const { displayName, role, id_sucursal: idSucursal } = useAuth();
  const isAdmin = role === 'admin';
  const esCajero = role === 'cajero';

  const [sucursales, setSucursales] = useState<SucursalItem[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(idSucursal);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [errorSucursales, setErrorSucursales] = useState<string | null>(null);
  const [errorCaja, setErrorCaja] = useState<string | null>(null);
  const [showCodigoModal, setShowCodigoModal] = useState(false);
  const [codigoEmpleado, setCodigoEmpleado] = useState('');
  const [abriendoCaja, setAbriendoCaja] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setSelectedSucursal(idSucursal);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoadingSucursales(true);
      setErrorSucursales(null);
      try {
        const data = await listarSucursales(true);
        if (!mounted) return;
        setSucursales(data);
        setSelectedSucursal(prev => prev ?? data[0]?.id_sucursal ?? null);
      } catch (err) {
        if (!mounted) return;
        setErrorSucursales(err instanceof Error ? err.message : 'No se pudieron cargar las sucursales');
      } finally {
        if (mounted) setLoadingSucursales(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [idSucursal, isAdmin]);

  const sucursalEfectiva = isAdmin ? selectedSucursal : idSucursal;

  const nombreSucursal = useMemo(() => {
    if (!sucursalEfectiva) return 'Sucursal no detectada';
    const found = sucursales.find(item => item.id_sucursal === sucursalEfectiva);
    return found?.nombre ?? `Sucursal ${sucursalEfectiva}`;
  }, [sucursalEfectiva, sucursales]);

  const abrirCaja = async () => {
    if (!sucursalEfectiva) {
      setErrorCaja('No se detectó una sucursal asignada para abrir la caja.');
      return;
    }

    try {
      setErrorCaja(null);
      const sesion = await obtenerSesionCajaActiva();
      if (sesion.sesion?.estado === 'PENDIENTE') {
        setErrorCaja('Hay una revisión pendiente de tu cierre de caja. No puedes abrir la caja hasta que sea autorizada o denegada.');
        return;
      }

      if (!sesion.activa) {
        setCodigoEmpleado('');
        setShowCodigoModal(true);
        return;
      }

      openWindow('/caja/terminal', 'biteboss-caja-terminal', sucursalEfectiva);
    } catch (err) {
      setErrorCaja(err instanceof Error ? err.message : 'No se pudo abrir la caja');
    }
  };

  const confirmarAperturaCaja = async () => {
    if (!sucursalEfectiva) return;
    if (!codigoEmpleado.trim()) {
      setErrorCaja('Ingresa tu código de empleado para abrir caja.');
      return;
    }

    try {
      setAbriendoCaja(true);
      setErrorCaja(null);
      await iniciarSesionCaja(codigoEmpleado.trim());
      setShowCodigoModal(false);
      openWindow('/caja/terminal', 'biteboss-caja-terminal', sucursalEfectiva);
    } catch (err) {
      setErrorCaja(err instanceof Error ? err.message : 'No se pudo abrir la caja');
    } finally {
      setAbriendoCaja(false);
    }
  };

  const codigoModal = showCodigoModal ? (
    <ModalShell title="Abrir caja" onClose={() => setShowCodigoModal(false)} maxWidthClass="max-w-md">
      <div className="space-y-4 p-6">
        <p className="text-sm text-gray-600">Ingresa tu código de empleado para iniciar sesión de caja.</p>
        <div>
          <label htmlFor="codigo-empleado-caja" className="mb-1 block text-sm font-medium text-gray-700">Código de empleado</label>
          <input
            id="codigo-empleado-caja"
            value={codigoEmpleado}
            onChange={e => setCodigoEmpleado(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            inputMode="numeric"
            maxLength={4}
            placeholder="Ej. 1234"
            autoFocus
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" fullWidth onClick={() => setShowCodigoModal(false)} disabled={abriendoCaja}>
            Cancelar
          </Button>
          <Button type="button" fullWidth onClick={() => void confirmarAperturaCaja()} isLoading={abriendoCaja}>
            Abrir caja
          </Button>
        </div>
      </div>
    </ModalShell>
  ) : null;

  if (esCajero) {
    return (
      <div className="max-w-md">
        {errorCaja && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorCaja}
          </div>
        )}
        <Button type="button" onClick={() => void abrirCaja()}>
          Abrir caja
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>

        {codigoModal}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-orange-100 bg-linear-to-br from-white via-orange-50 to-amber-100 p-6 shadow-[0_20px_60px_rgba(249,115,22,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Caja</p>
            <h1 className="mt-1 text-3xl font-black text-gray-950">Centro de operaciones</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              {esCajero
                ? 'Abre la terminal de caja para operar pedidos y cobros en tu sucursal.'
                : 'Abre la terminal de caja o el monitor en vivo en pestañas separadas. La experiencia está pensada para trabajo rápido tipo cadena de servicio.'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Store className="h-4 w-4 text-orange-500" />
              {nombreSucursal}
            </div>
            <div className="mt-1 text-xs text-gray-500">{displayName ? `${displayName} · ` : ''}{role}</div>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-4 rounded-2xl border border-orange-200 bg-white/70 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="hub-sucursal" className="text-sm font-medium text-orange-800">Elegir sucursal para abrir POS y tablero</label>
              <select
                id="hub-sucursal"
                value={selectedSucursal ?? ''}
                onChange={e => setSelectedSucursal(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingSucursales}
                className="min-w-57.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-700"
              >
                <option value="">Seleccionar sucursal...</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id_sucursal} value={sucursal.id_sucursal}>{sucursal.nombre}</option>
                ))}
              </select>
              {loadingSucursales && <span className="text-xs text-orange-700">Cargando sucursales...</span>}
              {errorSucursales && <span className="text-xs text-red-600">{errorSucursales}</span>}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 text-sm text-gray-600">
            {esCajero
              ? 'Solo puedes abrir caja para tu sucursal asignada.'
              : 'Solo puedes abrir POS/tablero para tu sucursal asignada.'}
          </div>
        )}

        {errorCaja && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorCaja}
          </div>
        )}
      </div>

      <div className={`grid gap-4 ${esCajero ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        <div className="rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
              <MonitorPlay className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-950">Caja</h2>
              <p className="mt-1 text-sm text-gray-600">
                Menú rápido, carrito y creación de pedidos en una ventana independiente.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => void abrirCaja()}>
              Abrir caja
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
            {!esCajero && (
              <Button type="button" variant="secondary" onClick={() => openWindow('/pedidos-en-vivo', 'biteboss-pedidos-vivo', sucursalEfectiva)}>
                Abrir tablero vivo
              </Button>
            )}
          </div>
        </div>

        {!esCajero && (
          <div className="rounded-3xl border border-white/80 bg-gray-950 p-6 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-orange-300">
                <ReceiptText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">Pedidos en tiempo real</h2>
                <p className="mt-1 text-sm text-gray-300">
                  Visualiza estados de cocina y despacho con actualización automática.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-gray-200">
              <Sparkles className="h-4 w-4 text-orange-300" />
              Se abre en una pestaña aparte para monitoreo continuo.
            </div>
          </div>
        )}
      </div>

      {codigoModal}
    </div>
  );
}