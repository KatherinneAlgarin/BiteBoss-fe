import type { ReactNode } from 'react';

interface TableEmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function TableEmptyState({ message, icon, action, className = '' }: TableEmptyStateProps) {
  return (
    <div className={`flex w-full flex-col items-center justify-center py-12 text-center ${className}`.trim()}>
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <p className="text-sm text-gray-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
