import type { DateRange } from '../../types/kpi.types';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getHoy(): DateRange {
  const d = toISO(new Date());
  return { inicio: d, fin: d };
}

function getSemana(): DateRange {
  const fin = new Date();
  const inicio = new Date();
  inicio.setDate(fin.getDate() - 6);
  return { inicio: toISO(inicio), fin: toISO(fin) };
}

function getMes(): DateRange {
  const now = new Date();
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { inicio: toISO(inicio), fin: toISO(fin) };
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
