import { useState } from 'react';
import { useSucursales } from '../../../hooks/useSucursales';
import { Tabs } from '../../../components/ui/Tabs';
import { SucursalSelect } from '../../../components/ui/SucursalSelect';
import { ZonasTab } from '../../../components/zonas/ZonasTab';

type TabKey = 'zonas' | 'mesas';

export function ZonasMesasPage() {
  const { sucursales, loading: loadingSucursales } = useSucursales();
  const [idSucursal, setIdSucursal] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('zonas');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Zonas y Mesas</h1>
        <p className="text-gray-500 mt-1">
          Configura el espacio físico de cada sucursal: zonas (terrazas, salones) y mesas dentro de cada zona.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <SucursalSelect
          sucursales={sucursales}
          value={idSucursal}
          onChange={setIdSucursal}
          loading={loadingSucursales}
          label="Sucursal a configurar"
          placeholder="Selecciona una sucursal"
        />
      </div>

      <Tabs
        items={[
          { key: 'zonas', label: 'Zonas' },
          { key: 'mesas', label: 'Mesas', disabled: true, hint: 'próximamente' },
        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
      >
        {activeTab === 'zonas' && <ZonasTab id_sucursal={idSucursal} />}
        {activeTab === 'mesas' && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <p className="text-gray-500">El módulo de mesas se habilitará en una próxima entrega.</p>
          </div>
        )}
      </Tabs>
    </div>
  );
}
