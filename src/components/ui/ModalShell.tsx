import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
  panelClassName?: string;
  headerContent?: ReactNode;
  hideCloseButton?: boolean;
}

export function ModalShell({
  title,
  onClose,
  children,
  maxWidthClass = 'max-w-md',
  panelClassName = '',
  headerContent,
  hideCloseButton = false,
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`w-full ${maxWidthClass} rounded-2xl border border-gray-100 bg-white shadow-xl ${panelClassName}`.trim()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {headerContent ?? <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}