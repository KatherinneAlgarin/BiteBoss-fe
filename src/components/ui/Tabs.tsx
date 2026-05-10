import type { ReactNode } from 'react';

interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  children: ReactNode;
}

export function Tabs({ items, active, onChange, children }: TabsProps) {
  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-2" aria-label="Tabs">
          {items.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => !tab.disabled && onChange(tab.key)}
                disabled={tab.disabled}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                  isActive
                    ? 'border-orange-500 text-orange-600'
                    : tab.disabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-600 hover:text-orange-600 hover:border-orange-300'
                }`}
                aria-selected={isActive}
                role="tab"
                title={tab.hint}
              >
                {tab.label}
                {tab.hint && tab.disabled && (
                  <span className="ml-2 text-xs text-gray-400">({tab.hint})</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
