import { AlertCircle } from 'lucide-react';

interface TableErrorStateProps {
  message: string;
  onRetry: () => void;
  className?: string;
}

export function TableErrorState({ message, onRetry, className = '' }: TableErrorStateProps) {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 px-4 py-4 ${className}`.trim()}>
      <div className="flex items-center">
        <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
        <span className="text-red-700">{message}</span>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Reintentar
      </button>
    </div>
  );
}
