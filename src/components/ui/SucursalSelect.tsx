import type { SucursalItem } from '../../types/sucursal.types';

interface SucursalSelectProps {
  sucursales: SucursalItem[];
  value: number | null;
  onChange: (id: number | null) => void;
  loading?: boolean;
  label?: string;
  placeholder?: string;
  soloActivas?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SucursalSelect({
  sucursales,
  value,
  onChange,
  loading = false,
  label = 'Sucursal',
  placeholder = 'Selecciona una sucursal',
  soloActivas = true,
  className = '',
  disabled = false,
}: SucursalSelectProps) {
  const opciones = soloActivas ? sucursales.filter(s => s.activo) : sucursales;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        disabled={disabled || loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{loading ? 'Cargando...' : placeholder}</option>
        {opciones.map((s) => (
          <option key={s.id_sucursal} value={s.id_sucursal}>
            {s.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
