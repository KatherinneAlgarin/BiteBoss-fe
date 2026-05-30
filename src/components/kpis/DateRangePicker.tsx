import type { DateRange } from '../../types/kpi.types';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHoy(): DateRange {
  const d = toLocalISO(new Date());
  return { inicio: d, fin: d };
}

function getSemana(): DateRange {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, ...
  const offsetLunes = (diaSemana + 6) % 7;

  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - offsetLunes);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);

  return { inicio: toLocalISO(inicio), fin: toLocalISO(fin) };
}

function getMes(): DateRange {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { inicio: toLocalISO(inicio), fin: toLocalISO(fin) };
}

const PRESETS = [
  { label: 'Hoy', fn: getHoy },
  { label: 'Semana', fn: getSemana },
  { label: 'Mes', fn: getMes },
];

function isPresetActive(value: DateRange, fn: () => DateRange): boolean {
  const p = fn();
  return value.inicio === p.inicio && value.fin === p.fin;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Presets */}
      <div className="flex gap-1">
        {PRESETS.map(({ label, fn }) => (
          <button
            key={label}
            onClick={() => onChange(fn())}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              isPresetActive(value, fn)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="flex items-center gap-2 text-sm">
        <input
          type="date"
          value={value.inicio}
          max={value.fin}
          onChange={e => onChange({ ...value, inicio: e.target.value })}
          className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <span className="text-gray-400">—</span>
        <input
          type="date"
          value={value.fin}
          min={value.inicio}
          onChange={e => onChange({ ...value, fin: e.target.value })}
          className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
    </div>
  );
}
