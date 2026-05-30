import type { ReactNode } from 'react';

interface FilterPanelProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterPanel({
  title,
  description,
  children,
  actions,
  className = '',
}: FilterPanelProps) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`.trim()}>
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
}
