import { Loader2 } from 'lucide-react';

interface TableLoadingStateProps {
  message: string;
  className?: string;
}

export function TableLoadingState({ message, className = '' }: TableLoadingStateProps) {
  return (
    <div className={`flex min-h-96 w-full items-center justify-center px-6 py-16 text-center ${className}`.trim()}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}
