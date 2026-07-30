import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface Props {
  error: string;
  onRetry?: () => void;
}

export function ErrorBanner({ error, onRetry }: Props) {
  return (
    <div className="mx-4 mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3">
      <AlertTriangle className="size-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          Error de conexión
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
          {error}
        </p>
      </div>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="shrink-0">
          <RefreshCw className="size-4 mr-1" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
