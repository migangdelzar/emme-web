import { ExternalLink, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { useSheetsExport } from '@/features/google-workspace/hooks/useSheetsExport';
import { cn } from '@/shared/lib/utils';

const typeLabels: Record<string, string> = {
  APPOINTMENTS: 'Citas',
  CLIENTS: 'Clientes',
  FULL: 'Completo',
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function SpreadsheetList() {
  const { sheets } = useSheetsExport();

  if (sheets.isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando hojas de cálculo...
      </div>
    );
  }

  if (!sheets.data?.length) {
    return (
      <p className="py-4 text-sm text-muted-foreground">No hay hojas de cálculo exportadas aún.</p>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">Hojas de cálculo exportadas</h4>
      <div className="space-y-2">
        {sheets.data.map((sheet) => (
          <a
            key={sheet.id}
            href={sheet.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card
              className={cn(
                'hover:bg-secondary/50 transition-colors cursor-pointer',
                'border-border'
              )}
            >
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="size-4 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {typeLabels[sheet.exportType] || sheet.exportType}
                    </p>
                    {sheet.lastExportedAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sheet.lastExportedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <ExternalLink className="size-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
